"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { contactSchema, contactUpdateSchema } from "@/lib/validations";
import { isAuthenticated } from "@/lib/auth";
import { allowPublicSubmission } from "@/lib/rate-limit";
import { queueContactStaffNotification } from "@/lib/staff-notifications";
import type { ActionState } from "@/lib/actions/reservation";

export async function createContactMessage(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容をご確認ください。",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (parsed.data.website) {
    return { success: true, message: "お問い合わせを受け付けました。" };
  }

  if (!(await allowPublicSubmission("contact"))) {
    return {
      success: false,
      message: "送信が集中しています。時間をおいてから、もう一度お試しください。",
    };
  }

  const { name, phone, email, message } = parsed.data;

  try {
    const contact = await prisma.contactMessage.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        message,
      },
    });
    await prisma.contactEvent.create({
      data: { contactMessageId: contact.id, eventType: "created", actorType: "patient" },
    });
    await queueContactStaffNotification(contact.id);
  } catch (error) {
    console.error("Failed to create contact message", error instanceof Error ? error.message : error);
    return {
      success: false,
      message: "送信を完了できませんでした。お手数ですが、お電話でお問い合わせください。",
    };
  }

  revalidatePath("/admin/contacts");
  revalidatePath("/admin");

  return {
    success: true,
    message: "お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡いたします。",
  };
}

export async function updateContactStatus(
  id: string,
  status: "new" | "read" | "waiting_patient" | "handled" | "dismissed"
): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  await prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      firstRespondedAt: status === "read" ? now : undefined,
      resolvedAt: ["handled", "dismissed"].includes(status) ? now : null,
    },
  });
  await prisma.contactEvent.create({
    data: { contactMessageId: id, eventType: status === "handled" ? "completed" : status, actorType: "staff" },
  });

  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin");
}

export async function updateContactDetails(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const parsed = contactUpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容をご確認ください。",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const current = await prisma.contactMessage.findUnique({ where: { id } });
  if (!current) return { success: false, message: "お問い合わせが見つかりません。" };

  const statusChanged = current.status !== parsed.data.status;
  const hasResponse = Boolean(parsed.data.responseSummary || parsed.data.responseChannel);
  const now = new Date();
  await prisma.contactMessage.update({
    where: { id },
    data: {
      status: parsed.data.status,
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      responseChannel: parsed.data.responseChannel || null,
      responseSummary: parsed.data.responseSummary || null,
      internalNote: parsed.data.internalNote || null,
      firstRespondedAt: current.firstRespondedAt || (hasResponse ? now : undefined),
      resolvedAt: ["handled", "dismissed"].includes(parsed.data.status) ? now : null,
    },
  });

  if (statusChanged) {
    await prisma.contactEvent.create({
      data: {
        contactMessageId: id,
        eventType: parsed.data.status === "handled" ? "completed" : parsed.data.status,
        actorType: "staff",
        detail: parsed.data.responseSummary || undefined,
      },
    });
  }
  if (parsed.data.internalNote && parsed.data.internalNote !== current.internalNote) {
    await prisma.contactEvent.create({
      data: { contactMessageId: id, eventType: "note", actorType: "staff", detail: parsed.data.internalNote },
    });
  }

  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/admin");
  return { success: true, message: "対応内容を保存しました。" };
}

export async function resendContactStaffNotification(id: string): Promise<void> {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await prisma.staffNotificationJob.updateMany({
    where: { contactMessageId: id, type: "contact", status: { in: ["failed", "skipped"] } },
    data: { status: "pending", lastError: null },
  });
  await queueContactStaffNotification(id);
  await prisma.contactMessage.update({ where: { id }, data: { lastNotifiedAt: new Date() } });
  await prisma.contactEvent.create({
    data: { contactMessageId: id, eventType: "notified", actorType: "staff", detail: "受付通知を再送" },
  });
  revalidatePath(`/admin/contacts/${id}`);
}
