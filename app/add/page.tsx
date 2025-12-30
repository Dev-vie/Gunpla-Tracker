import Header from "@/components/header";
import GunplaForm from "@/components/gunpla-form";

export const metadata = {
  title: "Add New Kit - Gunpla Tracker",
};

export default function AddPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add New Gunpla Kit
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new kit to your collection
        </p>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <GunplaForm />
        </div>
      </main>
    </div>
  );
}
