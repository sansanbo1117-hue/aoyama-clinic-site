"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import { isAuthenticated } from "@/lib/auth";

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createReservation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = reservationSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容をご確認ください。",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  await prisma.reservation.create({
    data: {
      type: data.type,
      name: data.name,
      nameKana: data.nameKana || null,
      phone: data.phone,
      email: data.email || null,
      birthDate: data.birthDate || null,
      desiredDate: data.desiredDate,
      desiredTime: data.desiredTime,
      symptom: data.symptom || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/admin/reservations");

  return {
    success: true,
    message:
      "予約リクエストを受け付けました。内容を確認のうえ、当院よりお電話でご連絡する場合がございます。",
  };
}

const VALID_STATUSES = ["pending", "confirmed", "cancelled", "done"] as const;
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

  await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/reservations");
}
