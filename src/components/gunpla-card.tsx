"use client";

import Link from "next/link";
import { Database } from "@/types/database.types";
import {
  formatGunplaDisplay,
  formatCurrency,
  getSeriesAbbreviation,
} from "@/lib/gunpla-utils";
import { useState } from "react";
import { deleteGunplaKit } from "@/lib/gunpla-actions";
import { useRouter } from "next/navigation";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"];

interface GunplaCardProps {
  kit: GunplaKit;
}

export default function GunplaCard({ kit }: GunplaCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const seriesAbbrev = getSeriesAbbreviation(kit.series);
  const displayName = formatGunplaDisplay(kit);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGunplaKit(kit.id);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      {/* Header: Grade Badge + Series */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {kit.grade}
          </span>
          {seriesAbbrev && (
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {seriesAbbrev}
            </span>
          )}
        </div>

        {/* Owned/Wishlist Badge */}
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
            kit.owned
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {kit.owned ? "Owned" : "Wishlist"}
        </span>
      </div>

      {/* Model Number + Name */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        {kit.model_number} {kit.model_name}
      </h3>

      {/* Series (full name, if available) */}
      {kit.series && (
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {kit.series}
        </p>
      )}

      {/* Release Year */}
      {kit.release_year && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Released: {kit.release_year}
        </p>
      )}

      {/* Purchase Info */}
      <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 dark:border-gray-700">
        {kit.purchase_date && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Purchased: {new Date(kit.purchase_date).toLocaleDateString()}
          </p>
        )}
        {kit.purchase_price && (
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Price: {formatCurrency(kit.purchase_price)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-2">
        <Link
          href={`/edit/${kit.id}`}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Edit
        </Link>

        {showConfirm ? (
          <>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 rounded-lg border border-red-300 px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-50 transition-colors dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
