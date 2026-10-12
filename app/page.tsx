import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-6">
      <section className="max-w-2xl text-center">
        <p className="text-2xl font-bold tracking-tight text-slate-950">
          Resv<span className="text-indigo-600">Hub</span>
        </p>
        <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-950">
          Shared resources, without the scheduling chaos.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
          A simple internal portal for finding shared rooms, equipment, and vehicles and
          reserving them with confidence.
        </p>
        <Link
          href="/resources"
          className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Browse resources
        </Link>
      </section>
    </main>
  );
}
