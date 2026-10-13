"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ReservationActionState = {
  success: boolean;
  message: string;
};

const initialState: ReservationActionState = {
  success: false,
  message: "",
};

function getText(formData: FormData, field: string) {
  return formData.get(field)?.toString().trim() ?? "";
}

export async function createReservation(
  previousState: ReservationActionState = initialState,
  formData: FormData,
): Promise<ReservationActionState> {
  void previousState;
  const resourceId = getText(formData, "resourceId");
  const name = getText(formData, "name");
  const email = getText(formData, "email").toLowerCase();
  const purpose = getText(formData, "purpose");
  const startValue = getText(formData, "startTime");
  const endValue = getText(formData, "endTime");
  const startTime = new Date(startValue);
  const endTime = new Date(endValue);

  if (!resourceId || !name || !email || !purpose || !startValue || !endValue) {
    return { success: false, message: "Complete every field before booking." };
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || email.length > 254) {
    return { success: false, message: "Enter a valid email address." };
  }

  if (name.length > 100 || purpose.length > 500) {
    return { success: false, message: "Please keep the booking details within the field limits." };
  }

  if (
    Number.isNaN(startTime.getTime()) ||
    Number.isNaN(endTime.getTime()) ||
    startTime >= endTime
  ) {
    return { success: false, message: "End time must be after the start time." };
  }

  if (startTime <= new Date()) {
    return { success: false, message: "Reservations must start in the future." };
  }

  try {
    const currentUser = await requireUser();
    const prisma = getPrismaClient();

    await prisma.$transaction(
      async (transaction) => {
        const resource = await transaction.resource.findUnique({
          where: { id: resourceId },
          select: { isActive: true },
        });

        if (!resource?.isActive) {
          throw new Error("This resource is no longer available.");
        }

        const conflictingBooking = await transaction.reservation.findFirst({
          where: {
            resourceId,
            status: "CONFIRMED",
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
          select: { id: true },
        });

        if (conflictingBooking) {
          throw new Error(
            "This resource is already booked for the selected time slot.",
          );
        }

        await transaction.reservation.create({
          data: {
            resourceId,
            userId: currentUser.id,
            startTime,
            endTime,
            purpose,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/resources");
    return { success: true, message: "Reservation confirmed." };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "This resource is no longer available." ||
        error.message ===
          "This resource is already booked for the selected time slot.")
    ) {
      return { success: false, message: error.message };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return {
        success: false,
        message: "The resource was booked at the same time. Please try again.",
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Unable to create reservation. Prisma error:", error.code, error.message);
      return {
        success: false,
        message: `Unable to save the reservation (${error.code}). Check that the database schema is synchronized.`,
      };
    }

    console.error("Unable to create reservation.", error);
    return {
      success: false,
      message: "Unable to create the reservation. Please try again.",
    };
  }
}
