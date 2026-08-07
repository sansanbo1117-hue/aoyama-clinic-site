"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  requestCode?: string;
};

const VALID_STATUSES = [
  "pending",
  "in_review",
  "awaiting_patient",
  "confirmed",
  "declined",
  "cancelled",
  "done",
] as const;
type ReservationStatus = (typeof VALID_STATUSES)[number];

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus
): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.update({
      where: { id },
      data: { status },
    });

    await tx.auditEvent.create({
      data: {
        actorType: "staff",
        action: "reservation.status_changed",
        entityType: "Reservation",
        entityId: reservation.id,
        metadata: JSON.stringify({ status }),
      },
    });
  });

  revalidatePath("/admin/reservations");
}
