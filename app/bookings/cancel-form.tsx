"use client";

import { useActionState } from "react";
import { cancelReservation, type BookingActionState } from "./actions";

const initialState: BookingActionState = { success: false, message: "" };

export function CancelForm({
  reservationId,
}: {
  reservationId: string;
}) {
  const [state, formAction, isPending] = useActionState(cancelReservation, initialState);

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="reservationId" value={reservationId} />
      {state.message ? (
        <p className={`mb-3 text-xs ${state.success ? "text-emerald-700" : "text-rose-600"}`}>
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
      >
        {isPending ? "Cancelling..." : "Cancel reservation"}
      </button>
    </form>
  );
}
