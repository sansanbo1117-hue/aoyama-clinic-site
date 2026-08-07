"use server";

import { revalidatePath } from "next/cache";

import { cancelAppointmentByToken } from "@/lib/booking";

export async function cancelAppointment(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  try {
    await cancelAppointmentByToken(token);
    revalidatePath("/appointments/manage");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "予約を取り消せませんでした。");
  }
}
