import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [pendingReservations, unpublishedNews, newContacts] = await Promise.all([
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.newsPost.count(),
    prisma.contactMessage.count({ where: { status: "new" } }),
  ]);

  const cards = [
    {
      href: "/admin/reservations",
      label: "未対応のWeb予約",
      value: pendingReservations,
    },
    { href: "/admin/news", label: "お知らせ件数", value: unpublishedNews },
    { href: "/admin/contacts", label: "未対応のお問い合わせ", value: newContacts },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.href} href={c.href}>
          <Card className="transition-colors hover:border-primary">
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-3xl font-bold text-primary">{c.value}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
