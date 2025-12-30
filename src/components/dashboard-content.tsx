"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getGunplaKits, deleteGunplaKit } from "@/lib/gunpla-actions";
import { Database } from "@/types/database.types";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"];

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
];

const BRANDS = [
  "Bandai",
  "SNAA",
  "Motor Nuclear",
  "In Era+",
  "Hemoxian",
  "CangDao",
  "AniMester",
  "Other",
];

export default function DashboardContent() {
  const [kits, setKits] = useState<GunplaKit[]>([]);
  const [filteredKits, setFilteredKits] = useState<GunplaKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "owned" | "wishlist">("all");
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [sublineFilter, setSublineFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [exclusiveFilter, setExclusiveFilter] = useState<
    "all" | "exclusive" | "regular"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "model_number" | "model_name" | "price" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadKits();
  }, [filter]);

  const loadKits = async () => {
    try {
      setLoading(true);
      setError(null);
      const filterType =
        filter === "all" ? undefined : (filter as "owned" | "wishlist");
      const data = await getGunplaKits(filterType);
      setKits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load kits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gradeFilter !== "HG") {
      setSublineFilter(null);
    }
  }, [gradeFilter]);

  // Filter by search query and grade
  useEffect(() => {
    let filtered = kits.filter((kit) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        kit.model_name.toLowerCase().includes(searchLower) ||
        kit.model_number.toLowerCase().includes(searchLower) ||
        kit.series?.toLowerCase().includes(searchLower) ||
        kit.subline?.toLowerCase().includes(searchLower) ||
        kit.brand?.toLowerCase().includes(searchLower);

      const matchesBrand = brandFilter === "all" || kit.brand === brandFilter;
      const matchesGrade = !gradeFilter || kit.grade === gradeFilter;
      const matchesSubline = !sublineFilter || kit.subline === sublineFilter;
      const matchesExclusive =
        exclusiveFilter === "all" ||
        (exclusiveFilter === "exclusive"
          ? (kit as any).exclusive
          : !(kit as any).exclusive);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesGrade &&
        matchesSubline &&
        matchesExclusive
      );
    });

    // Apply sorting
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;

        if (sortBy === "model_number") {
          compareValue = a.model_number.localeCompare(
            b.model_number,
            undefined,
            { numeric: true }
          );
        } else if (sortBy === "model_name") {
          compareValue = a.model_name.localeCompare(b.model_name);
        } else if (sortBy === "price") {
          const priceA = a.purchase_price
            ? typeof a.purchase_price === "string"
              ? parseFloat(a.purchase_price)
              : a.purchase_price
            : 0;
          const priceB = b.purchase_price
            ? typeof b.purchase_price === "string"
              ? parseFloat(b.purchase_price)
              : b.purchase_price
            : 0;
          compareValue = priceA - priceB;
        }

        return sortOrder === "asc" ? compareValue : -compareValue;
      });
    }

    setFilteredKits(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    kits,
    searchQuery,
    gradeFilter,
    sublineFilter,
    brandFilter,
    exclusiveFilter,
    sortBy,
    sortOrder,
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredKits.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentKits = showAll
    ? filteredKits
    : filteredKits.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate stats
  const ownedCount = kits.filter((k) => k.owned).length;
  const wishlistCount = kits.filter((k) => !k.owned).length;
  const totalSpent = kits
    .filter((k) => k.purchase_price)
    .reduce(
      (sum, k) =>
        sum +
        (typeof k.purchase_price === "string"
          ? parseFloat(k.purchase_price)
          : k.purchase_price || 0),
      0
    );

  return (
    <div className="space-y-8 width-full">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 p-6 backdrop-blur-sm dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Kits</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {kits.length}
          </p>
        </div>
        <div className="rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 p-6 backdrop-blur-sm dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">Owned</p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {ownedCount}
          </p>
        </div>
        <div className="rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 p-6 backdrop-blur-sm dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Spent
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            ${totalSpent.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
          <input
            type="text"
            placeholder="Search by model name, number, or series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />

          <div className="flex gap-2 flex-wrap">
            {(["all", "owned", "wishlist"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBrandFilter("all")}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              brandFilter === "all"
                ? "bg-purple-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Brands
          </button>
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => setBrandFilter(brand)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                brandFilter === brand
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Grade Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setGradeFilter(null)}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              gradeFilter === null
                ? "bg-gray-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Grades
          </button>
          {["HG", "RG", "MG", "PG", "EG", "SD", "BB", "RE/100", "FM", "NG"].map(
            (grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  gradeFilter === grade
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {grade}
              </button>
            )
          )}
        </div>

        {/* Subline Filter (HG only) */}
        {gradeFilter === "HG" && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSublineFilter(null)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                sublineFilter === null
                  ? "bg-gray-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All Sublines
            </button>
            {SUBLINES.map((subline) => (
              <button
                key={subline}
                onClick={() => setSublineFilter(subline)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  sublineFilter === subline
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {subline}
              </button>
            ))}
          </div>
        )}

        {/* Exclusive Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setExclusiveFilter("all")}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              exclusiveFilter === "all"
                ? "bg-gray-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Editions
          </button>
          <button
            onClick={() => setExclusiveFilter("exclusive")}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              exclusiveFilter === "exclusive"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Exclusive
          </button>
          <button
            onClick={() => setExclusiveFilter("regular")}
            className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
              exclusiveFilter === "regular"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Regular
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </span>
          <select
            value={sortBy || ""}
            onChange={(e) =>
              setSortBy(
                (e.target.value as
                  | "model_number"
                  | "model_name"
                  | "price"
                  | null) || null
              )
            }
            className="rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm px-3 py-1 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:text-white"
          >
            <option value="">None</option>
            <option value="model_number">Model Number</option>
            <option value="model_name">Model Name</option>
            <option value="price">Price</option>
          </select>
          {sortBy && (
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder("asc")}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  sortOrder === "asc"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {sortBy === "price" ? "Low to High" : "Ascending"}
              </button>
              <button
                onClick={() => setSortOrder("desc")}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  sortOrder === "desc"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {sortBy === "price" ? "High to Low" : "Descending"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredKits.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? "No kits match your search"
              : filter === "owned"
              ? "No owned kits yet"
              : filter === "wishlist"
              ? "No wishlist items yet"
              : "No kits yet. Add your first kit!"}
          </p>
        </div>
      )}

      {/* Kits Table */}
      {!loading && filteredKits.length > 0 && (
        <>
          <div className="rounded-lg border-2 border-gray-400 w-full bg-white/10 dark:bg-black/20 dark:border-gray-600 backdrop-blur-sm">
            <table className="w-full border-collapse min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-400 bg-gray-50/30 dark:border-gray-600 dark:bg-gray-900/30">
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Image
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white w-20">
                    Model #
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Model
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Series
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Brand
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Grade/Subline
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Edition
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Price
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Release
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentKits.map((kit) => (
                  <KitTableRow
                    key={kit.id}
                    kit={kit}
                    onDelete={(id) => {
                      setKits(kits.filter((k) => k.id !== id));
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg border-2 border-gray-400 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {showAll
                    ? `Showing all ${filteredKits.length} kits`
                    : `Showing ${startIndex + 1} to ${Math.min(
                        endIndex,
                        filteredKits.length
                      )} of ${filteredKits.length} kits`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Show All Button */}
                <button
                  onClick={() => {
                    setShowAll(!showAll);
                    if (showAll) setCurrentPage(1);
                  }}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                    showAll
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {showAll ? "Show Pages" : "Show All"}
                </button>

                {!showAll && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-1 text-gray-500 dark:text-gray-400"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface KitTableRowProps {
  kit: GunplaKit;
  onDelete: (id: string) => void;
}

function KitTableRow({ kit, onDelete }: KitTableRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGunplaKit(kit.id);
      onDelete(kit.id);
    } catch (error) {
      console.error("Failed to delete:", error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <tr className="border-b-2 border-gray-400 dark:border-gray-600">
        <td className="px-3 py-4 text-sm">
          {kit.image_url ? (
            <img
              src={kit.image_url}
              alt={kit.model_name}
              className="h-32 w-52 object-contain rounded shadow-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowImageModal(!showImageModal)}
            />
          ) : (
            <div className="h-32 w-52 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center shadow-md">
              <span className="text-xs text-gray-600 dark:text-gray-300 text-center px-2">
                No image
              </span>
            </div>
          )}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          {kit.model_number}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white max-w-[300px]">
          {kit.brand !== "Bandai"
            ? `${kit.brand} ${kit.model_name}`
            : kit.model_name}
        </td>
        <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[300px]">
          {kit.series || "—"}
        </td>
        <td className="px-3 py-4 text-sm">
          <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            {kit.brand}
          </span>
        </td>
        <td className="px-3 py-4 text-sm">
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {kit.brand !== "Bandai"
              ? "—"
              : kit.subline && kit.grade === "HG"
              ? kit.subline
              : kit.grade}
          </span>
        </td>
        <td className="px-3 py-4 text-sm">
          {(kit as any).exclusive ? (
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Exclusive
            </span>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              Regular
            </span>
          )}
        </td>
        <td className="px-3 py-4 text-sm text-gray-900 dark:text-white">
          {kit.purchase_price
            ? `$${parseInt(String(kit.purchase_price)).toLocaleString("en-US")}`
            : "—"}
        </td>
        <td className="px-3 py-4 text-sm text-gray-600 dark:text-gray-300">
          {kit.release_year || "—"}
        </td>
        <td className="px-3 py-4 text-sm">
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
              kit.owned
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {kit.owned ? "Owned" : "Wishlist"}
          </span>
        </td>
        <td className="px-3 py-4 text-sm">
          <div className="flex gap-2">
            <Link
              href={`/edit/${kit.id}`}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <tr>
          <td colSpan={11} className="p-4">
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Delete
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Are you sure you want to delete{" "}
                  <span className="font-medium">
                    {kit.model_number} {kit.model_name}
                  </span>
                  ?
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Image Modal */}
      {showImageModal && kit.image_url && (
        <tr>
          <td colSpan={11} className="p-4 bg-gray-900/50">
            <div className="flex flex-col items-center gap-4">
              <button
                className="self-end text-white text-2xl font-bold hover:text-gray-300 transition-colors"
                onClick={() => setShowImageModal(false)}
              >
                ×
              </button>
              <div className="relative w-full max-w-2xl">
                <img
                  src={kit.image_url}
                  alt={kit.model_name}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
