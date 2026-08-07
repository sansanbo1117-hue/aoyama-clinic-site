import { prisma } from "@/lib/prisma";
import { ContactStatusSelect } from "@/components/admin/contact-status-select";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = [
  ["", "すべて"],
  ["new", "未対応"],
  ["read", "確認済み"],
  ["waiting_patient", "患者返信待ち"],
  ["handled", "対応済み"],
] as const;

export default async function AdminContactsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const contacts = await prisma.contactMessage.findMany({
    where: status && ["new", "read", "waiting_patient", "handled", "dismissed"].includes(status) ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold tracking-[0.16em] text-primary">INBOX</p><h1 className="mt-1 text-2xl font-bold">お問い合わせ受信箱</h1><p className="mt-1 text-sm text-muted-foreground">新着を見つけ、次の対応を残します。</p></div>
        <Button asChild variant="outline" size="sm"><Link href="/admin"><Plus aria-hidden />受付ボードへ</Link></Button>
      </div>

      <nav aria-label="問い合わせフィルター" className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map(([value, label]) => <Link key={label} href={value ? `/admin/contacts?status=${value}` : "/admin/contacts"} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${status === value || (!status && !value) ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`}>{label}</Link>)}
      </nav>

      {contacts.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-card p-6 text-muted-foreground">
          お問い合わせはまだありません。
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {c.createdAt.toLocaleString("ja-JP")}
                </span>
                <Link href={`/admin/contacts/${c.id}`} className="font-semibold hover:text-primary hover:underline">{c.name}</Link>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${c.priority === "high" ? "bg-red-100 text-red-800" : "bg-secondary text-secondary-foreground"}`}>{c.priority === "high" ? "高優先" : c.priority === "low" ? "低優先" : "通常"}</span>
                <div className="ml-auto">
                  <ContactStatusSelect id={c.id} status={c.status} />
                </div>
              </div>
              <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {c.phone && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-muted-foreground">電話</dt>
                    <dd>
                      <a href={`tel:${c.phone}`} className="text-primary hover:underline">
                        {c.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {c.email && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-muted-foreground">メール</dt>
                    <dd>{c.email}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-2 rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
                {c.message}
              </p>
              {c.responseSummary && <p className="mt-3 border-l-2 border-primary pl-3 text-xs text-muted-foreground">対応メモ：{c.responseSummary}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
