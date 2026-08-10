import { prisma } from "@/lib/prisma";
import { RESERVATION_TYPES, DESIRED_TIME_OPTIONS } from "@/lib/validations";
import { ReservationStatusSelect } from "@/components/admin/reservation-status-select";
import { ReservationDeleteButton } from "@/components/admin/reservation-delete-button";
import { Badge } from "@/components/ui/badge";
import { formatSlotTime } from "@/lib/booking";

export default async function AdminReservationsPage() {
  const [appointments, reservations] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: { in: ["confirmed", "checked_in"] } },
      include: { patient: true, slot: true },
      orderBy: { slot: { startsAt: "asc" } },
      take: 100,
    }),
    prisma.reservation.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-primary">予約管理</h1>
      <section className="mt-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="font-bold">確定済みWeb予約</h2>
        <p className="mt-1 text-sm text-muted-foreground">患者が空き枠から選んで確定した予約です。診療枠の在庫は「診療枠管理」で調整できます。</p>
        {appointments.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">確定済みのWeb予約はありません。</p> : <div className="mt-4 divide-y">{appointments.map((appointment) => <div key={appointment.id} className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-bold">{appointment.slot.startsAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })} {formatSlotTime(appointment.slot.startsAt)}　{appointment.patient.name} 様</p><p className="mt-1 text-muted-foreground">{appointment.visitType === "initial" ? "初診" : "再診"}　／　予約番号 {appointment.appointmentCode}　／　{appointment.patient.phone}</p></div><Badge>{appointment.status === "checked_in" ? "来院済み" : "確定"}</Badge></div>)}</div>}
      </section>
      <h2 className="mt-10 text-xl font-bold text-primary">予約リクエスト受信箱</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        新しい依頼が上に表示されます。日時の確定は、院内台帳との照合と患者への連絡後に行ってください。
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
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                    {r.requestCode}
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
                  {r.patientCardNumberLast4 && (
                    <div className="flex gap-2">
                      <dt className="font-semibold text-muted-foreground">診察券</dt>
                      <dd>••••{r.patientCardNumberLast4}</dd>
                    </div>
                  )}
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
                {r.status === "cancelled" ? <ReservationDeleteButton id={r.id} /> : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
