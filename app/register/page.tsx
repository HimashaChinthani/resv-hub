"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = { message: "" };

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-6">
      <form action={formAction} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-950">
          Resv<span className="text-indigo-600">Hub</span>
        </Link>
        <h1 className="mt-10 text-3xl font-bold text-slate-950">Create an account</h1>
        <p className="mt-2 text-sm text-slate-500">Create a user account to reserve shared resources.</p>
        <label className="mt-8 block text-sm font-semibold text-slate-700">
          Full name
          <input name="name" required maxLength={100} autoComplete="name" className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-500" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-500" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none focus:border-indigo-500" />
        </label>
        {state.message ? <p className="mt-4 text-sm text-rose-600">{state.message}</p> : null}
        <button disabled={isPending} className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {isPending ? "Creating account..." : "Create account"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
