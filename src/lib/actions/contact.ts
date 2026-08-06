"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { isAuthenticated } from "@/lib/auth";
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

  const { name, phone, email, message } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      message,
    },
  });

  revalidatePath("/admin/contacts");

  return {
    success: true,
    message: "お問い合わせを受け付けました。内容を確認のうえ、必要に応じてご連絡いたします。",
  };
}

export async function updateContactStatus(
  id: string,
  status: "new" | "read" | "handled"
): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/contacts");
}
