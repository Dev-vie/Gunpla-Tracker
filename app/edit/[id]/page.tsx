"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import GunplaForm from "@/components/gunpla-form";
import { getGunplaKitById } from "@/lib/gunpla-actions";
import { Database } from "@/types/database.types";

type GunplaKit = Database["public"]["Tables"]["gunpla_kits"]["Row"];

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const [kit, setKit] = useState<GunplaKit | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const { id: kitId } = await params;
      setId(kitId);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const loadKit = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGunplaKitById(id);
        setKit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load kit");
      } finally {
        setLoading(false);
      }
    };

    loadKit();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Gunpla Kit
        </h1>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && kit && (
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <GunplaForm kit={kit} />
          </div>
        )}
      </main>
    </div>
  );
}
