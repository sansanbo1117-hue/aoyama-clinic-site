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

export const instantBookingSchema = z
  .object({
    holdToken: z.string().min(20),
    visitType: z.enum(["initial", "followup"]),
    name: z.string().trim().min(1, "お名前を入力してください。").max(100),
    nameKana: z.string().trim().max(100).optional().or(z.literal("")),
    phone: z.string().trim().min(1, "電話番号を入力してください。").regex(/^[0-9()\-+ ]{9,15}$/, "電話番号の形式が正しくありません。"),
    email: z.string().trim().email("メールアドレスの形式が正しくありません。").max(200),
    birthDate: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), { message: "生年月日の形式が正しくありません。" }),
    patientCardNumber: z.string().trim().max(32).optional().or(z.literal("")),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    consent: z.literal("on", { message: "プライバシーポリシーへの同意が必要です。" }),
  })
  .superRefine((data, ctx) => {
    // 診察券番号だけでは他人になりすませてしまうため、入力する場合は生年月日も必須にする（Step5）。
    if (data.patientCardNumber && !data.birthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "診察券番号を入力する場合は、生年月日もあわせて入力してください。",
      });
    }
  });

export type InstantBookingInput = z.infer<typeof instantBookingSchema>;

export const appointmentLookupSchema = z.object({
  appointmentCode: z.string().trim().min(1, "予約番号を入力してください。").max(80),
  phone: z.string().trim().min(9, "電話番号を入力してください。").max(20).regex(/^[0-9()\-+ ]+$/, "電話番号の形式が正しくありません。"),
  birthDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "生年月日を入力してください。"),
});

export type AppointmentLookupInput = z.infer<typeof appointmentLookupSchema>;

export const patientSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "お名前を入力してください。").max(100),
  nameKana: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().min(1, "電話番号を入力してください。").regex(/^[0-9()\-+ ]{9,15}$/, "電話番号の形式が正しくありません。"),
  email: z.string().trim().email("メールアドレスの形式が正しくありません。").max(200).optional().or(z.literal("")),
  birthDate: z.string().trim().max(20).optional().or(z.literal("")),
  patientCardNumber: z.string().trim().max(32).optional().or(z.literal("")),
  chartNumber: z.string().trim().max(32).optional().or(z.literal("")),
});

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
  website: z.literal("").optional().or(z.undefined()),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const contactUpdateSchema = z.object({
  status: z.enum(["new", "read", "waiting_patient", "handled", "dismissed"]),
  priority: z.enum(["low", "normal", "high"]),
  dueAt: z.string().trim().max(40).optional().or(z.literal("")),
  responseChannel: z.enum(["phone", "email", "visit", "none"]).optional().or(z.literal("")),
  responseSummary: z.string().trim().max(2000).optional().or(z.literal("")),
  internalNote: z.string().trim().max(3000).optional().or(z.literal("")),
});

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;

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
  publishUntil: z.string().trim().max(40).optional().or(z.literal("")),
});

export const faqSchema = z.object({
  question: z.string().trim().min(1, "質問を入力してください。").max(300),
  answer: z.string().trim().min(1, "回答を入力してください。").max(3000),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isPublished: z.enum(["on"]).optional(),
});

export const staffNotificationSchema = z.object({
  destinationEmail: z.string().trim().email("通知先メールアドレスの形式が正しくありません。").optional().or(z.literal("")),
  enabled: z.enum(["on"]).optional(),
  notificationTypes: z.string().trim().max(300),
});
