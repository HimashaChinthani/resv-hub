import Link from "next/link";
import { CancelForm } from "./cancel-form";
import { getPrismaClient } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "../logout/button";

export const instant = false;

type BookingsPageProps = {
  searchParams: Promise<{ email?: string }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const user = await requireUser();
  void searchParams;
  const email = user.email;
  let reservations: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    purpose: string;
    status: string;
    resource: { name: string; category: string };
  }> = [];
  let databaseError = false;

  if (email) {
    try {
      reservations = await getPrismaClient().reservation.findMany({
        where: { userId: user.id },
        include: { resource: { select: { name: true, category: true } } },
        orderBy: { startTime: "asc" },
      });
    } catch (error) {
      console.error("Unable to load reservations.", error);
      databaseError = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
            Resv<span className="text-indigo-600">Hub</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/resources">Resources</Link>
            <Link href="/bookings" className="text-indigo-600">My bookings</Link>
            <Link href="/admin">Admin</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Booking lookup</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Manage your reservations</h1>
        <p className="mt-3 text-slate-500">View and cancel your reservations from this account.</p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Showing bookings for <strong className="text-slate-900">{user.email}</strong>.
        </div>

        {databaseError ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            Reservations are temporarily unavailable. Check the database connection and try again.
          </div>
        ) : email && reservations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No reservations were found for this email address.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                      {reservation.resource.category}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{reservation.resource.name}</h2>
                  </div>
                  <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    reservation.status === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {reservation.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-slate-700">
                  {formatDate(reservation.startTime)} – {formatDate(reservation.endTime)}
                </p>
                <p className="mt-2 text-sm text-slate-500">{reservation.purpose}</p>
                {reservation.status === "CONFIRMED" && reservation.startTime > new Date() ? (
                  <CancelForm reservationId={reservation.id} />
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
