import Link from "next/link";
import { connection } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { ResourceForm } from "./resource-form";
import { toggleResource } from "./actions";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "../logout/button";

export const instant = false;

export default async function AdminPage() {
  await requireAdmin();
  await connection();
  let resources: Array<{ id: string; name: string; category: string; isActive: boolean }> = [];
  let reservations: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
    status: string;
    resource: { name: string };
    user: { name: string; email: string };
  }> = [];
  let databaseError = false;

  try {
    const prisma = getPrismaClient();
    [resources, reservations] = await Promise.all([
      prisma.resource.findMany({
        select: { id: true, name: true, category: true, isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.reservation.findMany({
        where: { endTime: { gte: new Date() } },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          purpose: true,
          status: true,
          resource: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { startTime: "asc" },
        take: 20,
      }),
    ]);
  } catch (error) {
    console.error("Unable to load admin resources.", error);
    databaseError = true;
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">Resv<span className="text-indigo-600">Hub</span></Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/resources">Resources</Link>
            <Link href="/bookings">My bookings</Link>
            <Link href="/admin" className="text-indigo-600">Admin</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Operations</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Manage resources</h1>
        <p className="mt-3 text-slate-500">Keep the shared-resource catalog accurate as facilities and equipment change.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <ResourceForm />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Resource status</h2>
            {databaseError ? (
              <p className="mt-4 text-sm text-rose-600">Resources are temporarily unavailable.</p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{resource.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{resource.category}</p>
                    </div>
                    <form action={toggleResource}>
                      <input type="hidden" name="resourceId" value={resource.id} />
                      <input type="hidden" name="isActive" value={String(resource.isActive)} />
                      <button className={`rounded-full px-3 py-1.5 text-xs font-semibold ${resource.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {resource.isActive ? "Active" : "Inactive"}
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Upcoming reservations</h2>
              <p className="mt-1 text-sm text-slate-500">The next 20 organization-wide bookings.</p>
            </div>
            <Link href="/bookings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Open booking lookup
            </Link>
          </div>
          {databaseError ? (
            <p className="mt-4 text-sm text-rose-600">Reservations are temporarily unavailable.</p>
          ) : reservations.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming reservations.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-170 text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-3 pr-4 font-semibold">Resource</th>
                    <th className="pb-3 pr-4 font-semibold">Requester</th>
                    <th className="pb-3 pr-4 font-semibold">Schedule</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="py-4 pr-4 font-semibold text-slate-900">{reservation.resource.name}</td>
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-700">{reservation.user.name}</p>
                        <p className="text-xs text-slate-500">{reservation.user.email}</p>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {formatDate(reservation.startTime)} – {formatDate(reservation.endTime)}
                      </td>
                      <td className="py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          reservation.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {reservation.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
