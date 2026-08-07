"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqSchema, staffNotificationSchema } from "@/lib/validations";
import type { ActionState } from "@/lib/actions/reservation";

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
}

export async function saveStaffNotificationSettings(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuth();
  const parsed = staffNotificationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "入力内容をご確認ください。", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  await prisma.staffNotificationSetting.upsert({
    where: { id: "default" },
    create: { id: "default", destinationEmail: parsed.data.destinationEmail || null, enabled: parsed.data.enabled === "on", notificationTypes: parsed.data.notificationTypes },
    update: { destinationEmail: parsed.data.destinationEmail || null, enabled: parsed.data.enabled === "on", notificationTypes: parsed.data.notificationTypes },
  });
  revalidatePath("/admin/settings/notifications");
  revalidatePath("/admin");
  return { success: true, message: "通知設定を保存しました。" };
}

export async function createFaq(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuth();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "入力内容をご確認ください。", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  await prisma.faqEntry.create({ data: { question: parsed.data.question, answer: parsed.data.answer, category: parsed.data.category || "general", sortOrder: parsed.data.sortOrder, isPublished: parsed.data.isPublished === "on" } });
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}

export async function updateFaq(id: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAuth();
  const parsed = faqSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { success: false, message: "入力内容をご確認ください。", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  await prisma.faqEntry.update({ where: { id }, data: { question: parsed.data.question, answer: parsed.data.answer, category: parsed.data.category || "general", sortOrder: parsed.data.sortOrder, isPublished: parsed.data.isPublished === "on" } });
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
  redirect("/admin/faq");
}

export async function deleteFaq(id: string): Promise<void> {
  await requireAuth();
  await prisma.faqEntry.delete({ where: { id } });
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}

export async function toggleFaqPublish(id: string, isPublished: boolean): Promise<void> {
  await requireAuth();
  await prisma.faqEntry.update({ where: { id }, data: { isPublished } });
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
}
