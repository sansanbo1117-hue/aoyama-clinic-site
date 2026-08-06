import { z } from "zod";

export const RESERVATION_TYPES = [
  { value: "initial", label: "初診の予約" },
  { value: "followup", label: "再診の予約" },
  { value: "change", label: "予約の変更" },
  { value: "cancel", label: "予約のキャンセル" },
] as const;

export const DESIRED_TIME_OPTIONS = [
  { value: "am", label: "午前中" },
  { value: "pm_early", label: "午後（早め）" },
  { value: "pm_late", label: "午後（遅め）" },
] as const;

export const reservationSchema = z.object({
  type: z.enum(["initial", "followup", "change", "cancel"], {
    message: "予約の種類を選択してください。",
  }),
  name: z.string().trim().min(1, "お名前を入力してください。").max(100),
  nameKana: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(1, "電話番号を入力してください。")
    .regex(/^[0-9()\-+ ]{9,15}$/, "電話番号の形式が正しくありません。"),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "メールアドレスの形式が正しくありません。",
    }),
  birthDate: z.string().trim().max(20).optional().or(z.literal("")),
  desiredDate: z.string().trim().min(1, "ご希望日を入力してください。"),
  desiredTime: z.enum(["am", "pm_early", "pm_late"], {
    message: "ご希望の時間帯を選択してください。",
  }),
  symptom: z.string().trim().max(1000).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  consent: z.literal("on", {
    message: "プライバシーポリシーへの同意が必要です。",
  }),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください。").max(100),
  phone: z
    .string()
    .trim()
    .max(15)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^[0-9()\-+ ]{9,15}$/.test(v), {
      message: "電話番号の形式が正しくありません。",
    }),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "メールアドレスの形式が正しくありません。",
    }),
  message: z.string().trim().min(1, "お問い合わせ内容を入力してください。").max(2000),
  consent: z.literal("on", {
    message: "プライバシーポリシーへの同意が必要です。",
  }),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const NEWS_CATEGORIES = [
  { value: "general", label: "お知らせ" },
  { value: "closure", label: "臨時休診" },
  { value: "hours_change", label: "診療時間変更" },
  { value: "obon", label: "お盆休み" },
  { value: "year_end", label: "年末年始" },
] as const;

export const newsSchema = z.object({
  title: z.string().trim().min(1, "タイトルを入力してください。").max(200),
  body: z.string().trim().min(1, "本文を入力してください。").max(5000),
  category: z.enum(["general", "closure", "hours_change", "obon", "year_end"]),
  isPublished: z.enum(["on"]).optional(),
});
