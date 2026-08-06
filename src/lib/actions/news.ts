"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { newsSchema } from "@/lib/validations";
import { isAuthenticated } from "@/lib/auth";
import type { ActionState } from "@/lib/actions/reservation";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export async function createNews(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = newsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容をご確認ください。",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.newsPost.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      isPublished: parsed.data.isPublished === "on",
    },
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updateNews(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = newsSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: "入力内容をご確認ください。",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await prisma.newsPost.update({
    where: { id },
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      isPublished: parsed.data.isPublished === "on",
    },
  });

  revalidatePath("/news");
  revalidatePath(`/news/${id}`);
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deleteNews(id: string): Promise<void> {
  await requireAuth();
  await prisma.newsPost.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function togglePublish(id: string, isPublished: boolean): Promise<void> {
  await requireAuth();
  await prisma.newsPost.update({
    where: { id },
    data: { isPublished },
  });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}
