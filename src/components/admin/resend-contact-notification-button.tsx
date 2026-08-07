"use client";

import { useTransition } from "react";
import { BellRing } from "lucide-react";

import { resendContactStaffNotification } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";

export function ResendContactNotificationButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => startTransition(() => resendContactStaffNotification(id))}><BellRing aria-hidden />{pending ? "再送中…" : "受付通知を再送"}</Button>;
}
