"use client";

import { useActionState } from "react";
import { useMemo } from "react";
import { createReservation, type ReservationActionState } from "./actions";

type BookingFormProps = {
  resourceId: string;
  resourceName: string;
};

const initialState: ReservationActionState = {
  success: false,
  message: "",
};

export function BookingForm({ resourceId, resourceName }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createReservation,
    initialState,
  );
  const minimumDateTime = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - offset * 60_000);
    return localNow.toISOString().slice(0, 16);
  }, []);

  return (
    <form action={formAction} className="mt-5 space-y-4 border-t border-slate-100 pt-5">
      <input type="hidden" name="resourceId" value={resourceId} />
      <p className="text-sm font-semibold text-slate-900">
        Reserve {resourceName}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">
          Your name
          <input
            name="name"
            required
            maxLength={100}
            placeholder="Alex Morgan"
            className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="alex@company.com"
            className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Starts
          <input
            name="startTime"
            type="datetime-local"
            required
            min={minimumDateTime}
            className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Ends
          <input
            name="endTime"
            type="datetime-local"
            required
            min={minimumDateTime}
            className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>
      <label className="block text-xs font-semibold text-slate-600">
        Purpose
        <textarea
          name="purpose"
          required
          maxLength={500}
          rows={2}
          placeholder="What will you use it for?"
          className="mt-1.5 block w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
      </label>
      {state.message ? (
        <p
          role="status"
          className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-600"}`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Checking availability..." : "Confirm reservation"}
      </button>
    </form>
  );
}
