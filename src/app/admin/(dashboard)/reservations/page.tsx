import { prisma } from "@/lib/prisma";
import { RESERVATION_TYPES, DESIRED_TIME_OPTIONS } from "@/lib/validations";
import { ReservationStatusSelect } from "@/components/admin/reservation-status-select";
import { Badge } from "@/components/ui/badge";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-primary">Web予約一覧</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        新しい予約リクエストが上に表示されます。対応状況を更新できます。
      </p>

      {reservations.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-card p-6 text-muted-foreground">
          予約リクエストはまだありません。
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {reservations.map((r) => {
            const type = RESERVATION_TYPES.find((t) => t.value === r.type);
            const time = DESIRED_TIME_OPTIONS.find((t) => t.value === r.desiredTime);
            return (
              <div key={r.id} className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{type?.label ?? r.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    受付：{r.createdAt.toLocaleString("ja-JP")}
                  </span>
                  <div className="ml-auto">
                    <ReservationStatusSelect id={r.id} status={r.status} />
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <div className="flex gap-2">
                    <dt className="font-semibold text-muted-foreground">お名前</dt>
                    <dd>
                      {r.name}
                      {r.nameKana ? `（${r.nameKana}）` : ""}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold text-muted-foreground">電話番号</dt>
                    <dd>
                      <a href={`tel:${r.phone}`} className="text-primary hover:underline">
                        {r.phone}
                      </a>
                    </dd>
                  </div>
                  {r.email && (
                    <div className="flex gap-2">
                      <dt className="font-semibold text-muted-foreground">メール</dt>
                      <dd>{r.email}</dd>
                    </div>
                  )}
                  {r.birthDate && (
                    <div className="flex gap-2">
                      <dt className="font-semibold text-muted-foreground">生年月日</dt>
                      <dd>{r.birthDate}</dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="font-semibold text-muted-foreground">希望日時</dt>
                    <dd>
                      {r.desiredDate}　{time?.label ?? r.desiredTime}
                    </dd>
                  </div>
                </dl>

                {r.symptom && (
                  <p className="mt-2 rounded-lg bg-muted p-3 text-sm">
                    <span className="font-semibold">症状：</span>
                    {r.symptom}
                  </p>
                )}
                {r.notes && (
                  <p className="mt-2 rounded-lg bg-muted p-3 text-sm">
                    <span className="font-semibold">備考：</span>
                    {r.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
