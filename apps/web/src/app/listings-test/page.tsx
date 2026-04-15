import type { Metadata } from "next";
import { CreateListingForm } from "@/components/listings/CreateListingForm";
import { ListingsList } from "@/components/listings/ListingsList";

export const metadata: Metadata = {
  title: "Listings Test | Sooqna",
  description: "Create and inspect milestone 1 listing flow",
};

export default function ListingsTestPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Listings Milestone 1 Test</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create a test listing and inspect published listings.
          </p>
        </header>

        <CreateListingForm />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Published Listings</h2>
          <ListingsList />
        </section>
      </div>
    </main>
  );
}

