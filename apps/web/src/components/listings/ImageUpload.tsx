"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { attachListingImage } from "@/services/listingService";
import { uploadImage } from "@/services/backendUploadService";

type ImageUploadProps = {
  listingId: string;
  onUploaded?: (payload: { url: string; path: string }) => void;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function ImageUpload({ listingId, onUploaded }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleUpload(): Promise<void> {
    if (!file) {
      setError("اختر صورة أولاً.");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("نوع الصورة غير مدعوم. استخدم JPG/PNG/WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("الصورة تتجاوز 5MB.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const uploaded = await uploadImage(file);
      await attachListingImage(listingId, uploaded);

      setUploadedUrl(uploaded.url);
      setUploadedPath(uploaded.path);
      onUploaded?.({ url: uploaded.url, path: uploaded.path });
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">رفع صورة للإعلان</h3>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        disabled={submitting}
        className="block w-full text-sm"
      />

      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Selected preview"
          className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
          width={128}
          height={128}
          unoptimized
        />
      ) : null}

      <button
        type="button"
        onClick={handleUpload}
        disabled={submitting || !file}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "جارٍ الرفع..." : "رفع الصورة"}
      </button>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {uploadedUrl ? (
        <div className="space-y-2 text-xs">
          <p className="text-emerald-700">تم رفع الصورة وربطها بالإعلان.</p>
          <Image
            src={uploadedUrl}
            alt="Uploaded preview"
            className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
            width={128}
            height={128}
            unoptimized
          />
          <p className="break-all text-slate-600">الرابط: {uploadedUrl}</p>
          {uploadedPath ? <p className="break-all text-slate-500">المسار: {uploadedPath}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

