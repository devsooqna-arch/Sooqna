"use client";

import { useEffect, useState } from "react";
import { getListings } from "@/services/listingService";
import type { Listing } from "@/types/listing";
import { ListingCard } from "./ListingCard";

export function ListingsList() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void getListings()
      .then((items) => {
        if (!mounted) return;
        setListings(items);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch listings.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading listings...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!listings.length) {
    return (
      <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        No published listings found yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

