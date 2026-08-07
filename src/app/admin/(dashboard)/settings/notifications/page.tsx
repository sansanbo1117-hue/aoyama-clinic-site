import { prisma } from "@/lib/prisma";
import { StaffNotificationSettingsForm } from "@/components/admin/staff-notification-settings-form";

export default async function AdminNotificationSettingsPage() {
  const setting = await prisma.staffNotificationSetting.findUnique({ where: { id: "default" } });
  return <div className="max-w-2xl space-y-6"><div><p className="text-xs font-bold tracking-[0.16em] text-primary">SETTINGS</p><h1 className="mt-1 text-2xl font-bold">受付通知の設定</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">一人受付でも新着を見落とさないための通知先を設定します。メール本文にはカルテ番号や診療内容を記載しません。</p></div><section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7"><StaffNotificationSettingsForm setting={setting ?? undefined} /></section></div>;
}
