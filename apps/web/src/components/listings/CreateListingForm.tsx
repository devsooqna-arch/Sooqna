"use client";

import { useState } from "react";
import type {
  CreateListingInput,
  ListingCondition,
  ListingContactPreference,
} from "@/types/listing";
import { createListing } from "@/services/listingService";
import { useAuth } from "@/hooks/useAuth";
import { ImageUpload } from "./ImageUpload";

type ListingFormState = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  country: string;
  city: string;
  area: string;
  condition: ListingCondition;
  contactPreference: ListingContactPreference;
};

const initialState: ListingFormState = {
  title: "",
  description: "",
  price: "",
  categoryId: "",
  country: "",
  city: "",
  area: "",
  condition: "used",
  contactPreference: "chat",
};

export function CreateListingForm() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState<ListingFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  function updateField<K extends keyof ListingFormState>(
    key: K,
    value: ListingFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Title is required.";
    if (!form.categoryId.trim()) return "Category is required.";
    if (!form.price.trim()) return "Price is required.";
    const priceNumber = Number(form.price);
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      return "Price must be a valid non-negative number.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: CreateListingInput = {
      title: form.title.trim(),
      price: Number(form.price),
      categoryId: form.categoryId.trim(),
    };

    setSubmitting(true);
    try {
      const result = await createListing(payload);
      setCreatedListingId(result.listingId);
      setSuccess(`Listing created successfully (ID: ${result.listingId}).`);
      setForm(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Create Listing (Test)</h2>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <LabeledInput
          label="Title"
          value={form.title}
          onChange={(v) => updateField("title", v)}
          disabled={submitting}
        />
        <LabeledInput
          label="Category ID"
          value={form.categoryId}
          onChange={(v) => updateField("categoryId", v)}
          disabled={submitting}
          placeholder="cars"
        />
      </div>

      <LabeledTextarea
        label="Description"
        value={form.description}
        onChange={(v) => updateField("description", v)}
        disabled={submitting}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <LabeledInput
          label="Price"
          type="number"
          value={form.price}
          onChange={(v) => updateField("price", v)}
          disabled={submitting}
        />
        <LabeledInput
          label="Country"
          value={form.country}
          onChange={(v) => updateField("country", v)}
          disabled={submitting}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <LabeledInput
          label="City"
          value={form.city}
          onChange={(v) => updateField("city", v)}
          disabled={submitting}
        />
        <LabeledInput
          label="Area"
          value={form.area}
          onChange={(v) => updateField("area", v)}
          disabled={submitting}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <LabeledSelect
          label="Condition"
          value={form.condition}
          onChange={(v) => updateField("condition", v as ListingCondition)}
          disabled={submitting}
          options={[
            { value: "new", label: "new" },
            { value: "used", label: "used" },
          ]}
        />
        <LabeledSelect
          label="Contact Preference"
          value={form.contactPreference}
          onChange={(v) => updateField("contactPreference", v as ListingContactPreference)}
          disabled={submitting}
          options={[
            { value: "chat", label: "chat" },
            { value: "phone", label: "phone" },
          ]}
        />
      </div>

      <p className="text-xs text-slate-500">
        Milestone 1 note: backend listing creation currently requires title, price, and
        categoryId. Other fields are captured for upcoming schema expansion.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Creating..." : "Create Listing"}
      </button>

      {createdListingId && currentUser ? (
        <ImageUpload listingId={createdListingId} userId={currentUser.uid} />
      ) : null}
    </form>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      />
    </label>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

