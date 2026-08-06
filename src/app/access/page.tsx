import Image from "next/image";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { CLINIC, MAP_EMBED_URL, MAP_LINK_URL } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "アクセス",
  description: "青山整形外科クリニックの所在地・地図・駐車場のご案内。",
};

export default function AccessPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="アクセス" />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <iframe
              title="青山整形外科クリニック 地図"
              src={MAP_EMBED_URL}
              className="h-96 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            地図が表示されない場合は、
            <a
              href={MAP_LINK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Googleマップで開く
            </a>
            か、緯度経度「{CLINIC.lat}, {CLINIC.lng}」で検索してください。
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full border-collapse text-sm sm:text-base">
            <tbody>
              {[
                ["住所", CLINIC.fullAddress],
                ["電話番号", CLINIC.tel],
                ["FAX番号", CLINIC.fax],
                ["E-mail", CLINIC.email],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-b-0 even:bg-muted/40">
                  <th className="w-28 bg-secondary/40 p-3 text-left align-top font-semibold text-primary sm:w-36 sm:p-4">
                    {label}
                  </th>
                  <td className="p-3 sm:p-4">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">駐車場</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <figure className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Image
              src="/images/parking.jpg"
              alt="駐車場（19台、海側隣接の愛の里駐車場にも8台駐車可）"
              width={640}
              height={480}
              className="aspect-4/3 w-full object-cover"
            />
            <figcaption className="p-3 text-sm text-muted-foreground">
              院内駐車場19台分に加え、海側隣接の「愛の里」駐車場にも8台駐車いただけます。
            </figcaption>
          </figure>
          <figure className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Image
              src="/images/entrance.jpg"
              alt="玄関前（先代から引き継いだ石灯籠）"
              width={640}
              height={480}
              className="aspect-4/3 w-full object-cover"
            />
            <figcaption className="p-3 text-sm text-muted-foreground">
              玄関前には先代から引き継いだ石灯籠がございます。目印としてご利用ください。
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
