"use server";

import { revalidatePath } from "next/cache";

import { isAuthenticated } from "@/lib/auth";
import { blockSlot, ensureDefaultBookingSetup } from "@/lib/booking";

export async function initializeSchedule() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await ensureDefaultBookingSetup();
  revalidatePath("/admin/schedule");
}

export async function updateSlotStatus(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const slotId = String(formData.get("slotId") ?? "");
  const blocked = String(formData.get("blocked") ?? "true") === "true";
  if (!slotId) throw new Error("枠が指定されていません。");
  await blockSlot(slotId, blocked);
  revalidatePath("/admin/schedule");
}
