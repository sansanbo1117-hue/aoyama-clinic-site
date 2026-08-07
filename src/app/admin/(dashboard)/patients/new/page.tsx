import type { Metadata } from "next";

import { PatientForm } from "@/components/admin/patient-form";

export const metadata: Metadata = { title: "患者を登録" };

export default function NewPatientPage() { return <div className="mx-auto max-w-2xl"><p className="text-sm font-bold tracking-[0.16em] text-primary">PATIENT REGISTRATION</p><h1 className="mt-1 text-2xl font-bold">患者を登録</h1><p className="mt-2 text-sm text-muted-foreground">電話予約や窓口受付で、まだ台帳にいない患者を登録します。</p><div className="mt-6"><PatientForm /></div></div>; }
