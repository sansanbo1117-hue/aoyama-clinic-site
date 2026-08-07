import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { CLINIC } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "青山整形外科クリニックの個人情報保護方針（プライバシーポリシー）。",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="PRIVACY POLICY" title="プライバシーポリシー" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <div className="mt-8 flex flex-col gap-6 leading-relaxed">
        <p>
          医療法人青山整形外科クリニック（以下「当クリニック」）は、患者さまからお預かりした個人情報の保護が重要であると認識しており、関係法令を遵守し、個人情報を適切に取り扱います。
        </p>

        <section>
          <h2 className="text-lg font-bold text-primary">個人情報の管理</h2>
          <p className="mt-2">
            当クリニックは、患者さまの個人情報を安全に保つために、セキュリティーシステムの導入、院内管理体制の整備、スタッフ教育を徹底させ、外部からの不正アクセス、紛失、破損、改ざん及び漏洩等を防止します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary">個人情報の利用</h2>
          <p className="mt-2">
            個人情報の利用目的を明確にし、その目的の達成に必要な範囲内で業務の遂行上必要な限りにおいて取り扱い、より良い医療の実践に役立たせていただきます。本サイトのWeb予約フォーム・お問い合わせフォームでお預かりした情報も、予約対応・お問い合わせ対応の目的にのみ利用します。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary">個人情報の第三者への開示</h2>
          <p className="mt-2">
            当クリニックは、患者さまよりお預かりした個人情報を、次のいずれかに該当する場合を除き、第三者に開示いたしません。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
            <li>他の病院、診療所、助産院、薬局、訪問看護ステーション、介護サービス事業者等との連携</li>
            <li>他の医療機関等からの照会への回答</li>
            <li>患者さまの診療のため、外部の医師等の意見・助言を求める場合</li>
            <li>検体検査業務等のその他業務委託</li>
            <li>保険事務の委託</li>
            <li>審査支払機関へのレセプトの提供</li>
            <li>審査支払機関または保険者からの照会への回答</li>
            <li>事業者等から委託を受けた健康診断に係る、事業者等への結果通知</li>
            <li>医師賠償責任保険等に係る、医療に関する専門の団体や保険会社等への相談または届出等</li>
            <li>その他、患者さまへの医療保険事務に関する利用</li>
            <li>患者さまの了解を得た場合</li>
            <li>人の生命、身体又は財産の保護のために必要がある場合</li>
            <li>法令に基づき開示が必要とされた場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary">法令等の遵守</h2>
          <p className="mt-2">当クリニックは、業務に関する全ての関係法令を遵守します。</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-primary">お問い合わせ</h2>
          <p className="mt-2">個人情報の保護に関するお問い合わせは、下記までご連絡ください。</p>
          <p className="mt-2 font-bold text-primary">
            <a href={CLINIC.telHref} className="hover:underline">
              TEL {CLINIC.tel}
            </a>
          </p>
        </section>
      </div>
      </div>
    </>
  );
}
