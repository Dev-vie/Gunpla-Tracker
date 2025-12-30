"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGunplaSchema, kitBrandEnum } from "@/lib/schemas";
import { createGunplaKit, updateGunplaKit } from "@/lib/gunpla-actions";
import { Database } from "@/types/database.types";
import ImageUploadField from "@/components/image-upload-field";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"] | undefined;

const BRANDS = kitBrandEnum.options;

const GRADES = [
  "HG",
  "RG",
  "MG",
  "PG",
  "EG",
  "SD",
  "BB",
  "RE/100",
  "FM",
  "NG",
] as const;

const SUBLINES = [
  "HGUC",
  "HGIBO",
  "HGCE",
  "HG00",
  "HGAC",
  "HGAGE",
  "HGBF",
  "HGGTO",
  "HGBC",
] as const;

interface GunplaFormProps {
  kit?: GunplaKit;
  onSubmit?: () => void;
}

export default function GunplaForm({ kit, onSubmit }: GunplaFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createGunplaSchema),
    defaultValues: {
      brand: kit?.brand || "Bandai",
      grade: kit?.grade || "HG",
      subline: (kit as any)?.subline || null,
      model_number: kit?.model_number || "",
      model_name: kit?.model_name || "",
      series: kit?.series || "",
      release_year: kit?.release_year?.toString() || "",
      owned: kit?.owned ? true : false,
      exclusive: (kit as any)?.exclusive ? true : false,
      purchase_date: kit?.purchase_date || "",
      purchase_price: kit?.purchase_price?.toString() || "",
      image_url: kit?.image_url || "",
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    kit?.image_url || null
  );
  const imageUrl = watch("image_url");
  const brand = watch("brand");
  const grade = watch("grade");

  useEffect(() => {
    if (imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "") {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [imageUrl]);

  const onSubmitForm = async (data: any) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const submitData = {
        brand: data.brand,
        grade: data.grade,
        subline: data.subline || null,
        model_number: data.model_number,
        model_name: data.model_name,
        series: data.series?.trim() || null,
        release_year: data.release_year ? parseInt(data.release_year) : null,
        owned: !!data.owned,
        exclusive: !!data.exclusive,
        purchase_date: data.purchase_date || null,
        purchase_price: data.purchase_price
          ? parseFloat(data.purchase_price)
          : null,
        image_url: data.image_url?.trim() || null,
      };

      if (kit?.id) {
        await updateGunplaKit(kit.id, submitData);
      } else {
        await createGunplaKit(submitData);
      }

      onSubmit?.();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Brand */}
        <div className="sm:col-span-2">
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Brand
          </label>
          <select
            {...register("brand")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Grade */}
        {brand === "Bandai" && (
          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Grade *
            </label>
            <select
              {...register("grade")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {errors.grade && (
              <p className="mt-1 text-sm text-red-600">
                {String(errors.grade?.message)}
              </p>
            )}
          </div>
        )}

        {/* Subline (HG only) */}
        {brand === "Bandai" && grade === "HG" && (
          <div>
            <label
              htmlFor="subline"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subline (optional)
            </label>
            <select
              {...register("subline")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">No subline</option>
              {SUBLINES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Model Number */}
        <div>
          <label
            htmlFor="model_number"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Model Number *
          </label>
          <input
            {...register("model_number")}
            type="text"
            placeholder="e.g. 001, 191, 033"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
          {errors.model_number && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.model_number?.message)}
            </p>
          )}
        </div>
      </div>

      {/* Model Name */}
      <div>
        <label
          htmlFor="model_name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Model Name *
        </label>
        <input
          {...register("model_name")}
          type="text"
          placeholder="e.g. RX-78-2 Gundam, Gundam Barbatos"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
        {errors.model_name && (
          <p className="mt-1 text-sm text-red-600">
            {String(errors.model_name?.message)}
          </p>
        )}
      </div>

      {/* Series */}
      <div>
        <label
          htmlFor="series"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Series (optional)
        </label>
        <input
          {...register("series")}
          type="text"
          placeholder="e.g. Universal Century, Iron-Blooded Orphans"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Release Year */}
        <div>
          <label
            htmlFor="release_year"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Release Year (optional)
          </label>
          <input
            {...register("release_year")}
            type="number"
            placeholder="2024"
            min="1980"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Purchase Price */}
        <div>
          <label
            htmlFor="purchase_price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Purchase Price (optional)
          </label>
          <input
            {...register("purchase_price")}
            type="number"
            placeholder="0.00"
            step="0.01"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label
            htmlFor="purchase_date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Purchase Date (optional)
          </label>
          <input
            {...register("purchase_date")}
            type="date"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <ImageUploadField preview={imagePreview} setValue={setValue} />
      </div>

      {/* Owned Checkbox */}
      <div className="flex items-center">
        <input
          {...register("owned")}
          type="checkbox"
          id="owned"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="owned"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          I own this kit (checked = owned, unchecked = wishlist)
        </label>
      </div>

      {/* Exclusive Checkbox */}
      <div className="flex items-center">
        <input
          {...register("exclusive")}
          type="checkbox"
          id="exclusive"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="exclusive"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Exclusive Edition (checked = exclusive, unchecked = regular)
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Saving..." : kit ? "Update Kit" : "Add Kit"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
