import type { Listing } from "@/types/listing";

export function ListingCard({ listing }: { listing: Listing }) {
  const firstImage = listing.images.find((img) => img.isPrimary) ?? listing.images[0];

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {firstImage?.url ? (
        <img
          src={firstImage.url}
          alt={listing.title}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-500">
          No image
        </div>
      )}

      <div className="space-y-2 p-4 text-sm">
        <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
        <p className="text-slate-700">
          Price: {listing.price} {listing.currency}
        </p>
        <p className="text-slate-600">Category: {listing.categoryId}</p>
        <p className="text-slate-600">City: {listing.location.city || "—"}</p>
        <p className="text-slate-600">Status: {listing.status}</p>
        <p className="text-slate-600">
          Owner: {listing.ownerSnapshot.fullName || listing.ownerId}
        </p>
      </div>
    </article>
  );
}

