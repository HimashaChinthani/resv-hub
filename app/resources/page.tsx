import Link from "next/link";
import { getPrismaClient } from "@/lib/prisma";

export const instant = false;

const categories = ["All resources", "Meeting Room", "Equipment", "Vehicle"];

type ResourcesPageProps = {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
};

type ResourceCard = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isActive: boolean;
};

function formatCategory(category: string) {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const filters = await searchParams;
  const category =
    filters.category && categories.includes(filters.category)
      ? filters.category
      : "All resources";
  const activeOnly = filters.status !== "inactive";

  let resources: ResourceCard[] = [];
  let databaseError = false;

  try {
    resources = await getPrismaClient().resource.findMany({
      where: {
        ...(category !== "All resources" ? { category } : {}),
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Unable to load resources.", error);
    databaseError = true;
    resources = [];
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
            Resv<span className="text-indigo-600">Hub</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/resources" className="text-indigo-600">
              Resources
            </Link>
            <span>My bookings</span>
            <span>Admin</span>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-12 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Resource catalog
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              Find a space or resource
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Browse what is available for your next meeting, project, or team activity.
            </p>
          </div>
          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            + New reservation
          </Link>
        </div>

        <form className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_220px_auto] sm:items-end">
          <label className="text-sm font-semibold text-slate-700">
            Category
            <select
              name="category"
              defaultValue={category}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Show
            <select
              name="status"
              defaultValue={activeOnly ? "active" : "inactive"}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="active">Active resources</option>
              <option value="inactive">All statuses</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600"
          >
            Apply filters
          </button>
        </form>

        {databaseError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <h2 className="font-semibold">Resources are temporarily unavailable</h2>
            <p className="mt-1 text-sm">
              Check that DATABASE_URL is configured and the PostgreSQL database is running.
            </p>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">No resources found</h2>
            <p className="mt-2 text-sm text-slate-500">
              Try a different filter or add a resource from the admin view.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <article
                key={resource.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                    {resource.category === "Meeting Room"
                      ? "⌂"
                      : resource.category === "Vehicle"
                        ? "▣"
                        : "◆"}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      resource.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {resource.isActive ? "Available" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                  {formatCategory(resource.category)}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">{resource.name}</h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">
                  {resource.description ?? "No additional details provided."}
                </p>
                <button
                  type="button"
                  disabled={!resource.isActive}
                  className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {resource.isActive ? "Check availability" : "Unavailable"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
