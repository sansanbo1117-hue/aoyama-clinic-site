import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/components/contact-form";
import { CLINIC } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "青山整形外科クリニックへのお問い合わせ。",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader title="お問い合わせ" />
      <p className="mt-4 text-sm text-muted-foreground">
        お急ぎの場合はお電話（
        <a href={CLINIC.telHref} className="font-semibold text-primary hover:underline">
          {CLINIC.tel}
        </a>
        ）をご利用ください。
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
