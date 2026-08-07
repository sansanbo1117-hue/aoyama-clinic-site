import type { Metadata } from "next";

import { PhoneAppointmentForm } from "@/components/admin/phone-appointment-form";

export const metadata: Metadata = { title: "電話予約を登録" };

export default function NewAppointmentPage() { return <div className="mx-auto max-w-2xl"><h1 className="text-2xl font-bold text-primary">電話予約を登録</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Web予約と同じ診療枠を使います。電話を受けながら、患者検索 → 枠選択 → 登録の順に進めてください。</p><div className="mt-6"><PhoneAppointmentForm /></div></div>; }
