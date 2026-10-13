"use client";

import { useActionState } from "react";
import { createResource, type AdminActionState } from "./actions";

const initialState: AdminActionState = { success: false, message: "" };

export function ResourceForm() {
  const [state, formAction, isPending] = useActionState(createResource, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Add a resource</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required maxLength={120} placeholder="Resource name" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
        <select name="category" required defaultValue="" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500">
          <option value="" disabled>Choose category</option>
          <option>Meeting Room</option>
          <option>Equipment</option>
          <option>Vehicle</option>
        </select>
      </div>
      <textarea name="description" maxLength={500} rows={3} placeholder="Short description" className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500" />
      {state.message ? <p className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p> : null}
      <button disabled={isPending} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
        {isPending ? "Adding..." : "Add resource"}
      </button>
    </form>
  );
}
