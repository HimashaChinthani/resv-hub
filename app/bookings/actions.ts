"use server";

import { revalidatePath } from "next/cache";
import { getPrismaClient } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type BookingActionState = {
  success: boolean;
  message: string;
};

export async function cancelReservation(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const reservationId = formData.get("reservationId")?.toString().trim() ?? "";
  if (!reservationId) {
    return { success: false, message: "We could not verify this reservation." };
  }

  try {
    const currentUser = await requireUser();
    const result = await getPrismaClient().reservation.updateMany({
      where: {
        id: reservationId,
        status: "CONFIRMED",
        startTime: { gt: new Date() },
        userId: currentUser.id,
      },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) {
      return {
        success: false,
        message: "This reservation cannot be cancelled or was not found.",
      };
    }

    revalidatePath("/bookings");
    revalidatePath("/resources");
    return { success: true, message: "Reservation cancelled." };
  } catch (error) {
    console.error("Unable to cancel reservation.", error);
    return { success: false, message: "Unable to cancel the reservation. Please try again." };
  }
}
