import { prisma } from "@/lib/prisma";
import { ContactStatusSelect } from "@/components/admin/contact-status-select";

export default async function AdminContactsPage() {
  const contacts = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-primary">お問い合わせ一覧</h1>

      {contacts.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-card p-6 text-muted-foreground">
          お問い合わせはまだありません。
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {c.createdAt.toLocaleString("ja-JP")}
                </span>
                <span className="font-semibold">{c.name}</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
