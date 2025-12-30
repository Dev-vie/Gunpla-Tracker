import Header from "@/components/header";
import Footer from "@/components/footer";
import GunplaForm from "@/components/gunpla-form";

export const metadata = {
  title: "Add New Kit - Gunpla Tracker",
};

export default function AddPage() {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-70 dark:opacity-60 bg-fixed"
        style={{ backgroundImage: "url('/dashboard-bg.jpg')" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gray-50/40 via-gray-50/30 to-gray-50/50 dark:from-black/30 dark:via-black/20 dark:to-black/40"
        aria-hidden
      />

      <div className="relative flex flex-col min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 flex-grow">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Gunpla Kit
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Add a new kit to your collection
          </p>

          <div className="mt-8 rounded-lg border-2 border-gray-400 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm p-8 shadow-sm dark:border-gray-600">
            <GunplaForm />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
