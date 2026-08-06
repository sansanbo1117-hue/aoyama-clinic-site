"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { createReservation } from "@/lib/actions/reservation";
import { RESERVATION_TYPES, DESIRED_TIME_OPTIONS } from "@/lib/validations";
import { CLINIC } from "@/lib/clinic-info";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: undefined, errors: undefined } as const;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-destructive">
      {errors[0]}
    </p>
  );
}

export function ReservationForm() {
  const [state, formAction, pending] = useActionState(createReservation, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-secondary/40 p-8 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden />
        <p className="text-lg font-bold">送信が完了しました</p>
        <p className="text-muted-foreground">{state.message}</p>
        <p className="text-sm text-muted-foreground">
          お急ぎの場合は、お電話（
          <a href={CLINIC.telHref} className="font-semibold text-primary hover:underline">
            {CLINIC.tel}
          </a>
          ）でも承っております。
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 font-semibold text-destructive">
          {state.message}
        </p>
      )}

      <fieldset>
        <legend className="mb-2 text-base font-bold">
          ご希望の内容<span className="ml-1 text-destructive">必須</span>
        </legend>
        <RadioGroup name="type" defaultValue="initial" className="grid gap-3 sm:grid-cols-2">
          {RESERVATION_TYPES.map((t) => (
            <Label
              key={t.value}
              htmlFor={`type-${t.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/50"
            >
              <RadioGroupItem value={t.value} id={`type-${t.value}`} />
              {t.label}
            </Label>
          ))}
        </RadioGroup>
        <FieldError errors={state.errors?.type} />
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">
            お名前<span className="ml-1 text-destructive">必須</span>
          </Label>
          <Input id="name" name="name" required autoComplete="name" className="mt-1.5" />
          <FieldError errors={state.errors?.name} />
        </div>
        <div>
          <Label htmlFor="nameKana">フリガナ</Label>
          <Input id="nameKana" name="nameKana" className="mt-1.5" />
          <FieldError errors={state.errors?.nameKana} />
        </div>
        <div>
          <Label htmlFor="phone">
            電話番号<span className="ml-1 text-destructive">必須</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="0977-25-XXXX"
            className="mt-1.5"
          />
          <FieldError errors={state.errors?.phone} />
        </div>
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
          <FieldError errors={state.errors?.email} />
        </div>
        <div>
          <Label htmlFor="birthDate">生年月日</Label>
          <Input
            id="birthDate"
            name="birthDate"
            placeholder="例：1980年4月1日"
            className="mt-1.5"
          />
          <FieldError errors={state.errors?.birthDate} />
        </div>
        <div>
          <Label htmlFor="desiredDate">
            ご希望日<span className="ml-1 text-destructive">必須</span>
          </Label>
          <Input
            id="desiredDate"
            name="desiredDate"
            type="date"
            required
            className="mt-1.5"
          />
          <FieldError errors={state.errors?.desiredDate} />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-base font-bold">
          ご希望の時間帯<span className="ml-1 text-destructive">必須</span>
        </legend>
        <RadioGroup name="desiredTime" defaultValue="am" className="grid gap-3 sm:grid-cols-3">
          {DESIRED_TIME_OPTIONS.map((t) => (
            <Label
              key={t.value}
              htmlFor={`time-${t.value}`}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/50"
            >
              <RadioGroupItem value={t.value} id={`time-${t.value}`} />
              {t.label}
            </Label>
          ))}
        </RadioGroup>
        <FieldError errors={state.errors?.desiredTime} />
      </fieldset>

      <div>
        <Label htmlFor="symptom">症状・受診したい内容</Label>
        <Textarea
          id="symptom"
          name="symptom"
          placeholder="例：3日前に足首をひねって腫れています"
          className="mt-1.5"
        />
        <FieldError errors={state.errors?.symptom} />
      </div>

      <div>
        <Label htmlFor="notes">
          その他ご連絡事項（予約変更・キャンセルの方は対象の予約日時をご記入ください）
        </Label>
        <Textarea id="notes" name="notes" className="mt-1.5" />
        <FieldError errors={state.errors?.notes} />
      </div>

      <Label htmlFor="consent" className="flex items-start gap-3 font-normal">
        <Checkbox id="consent" name="consent" required className="mt-0.5" />
        <span>
          <a href="/privacy" target="_blank" className="text-primary underline">
            プライバシーポリシー
          </a>
          に同意のうえ送信します。
        </span>
      </Label>
      <FieldError errors={state.errors?.consent} />

      <p className="text-sm text-muted-foreground">
        送信内容は当院で確認のうえ対応いたします。日時が確定するものではなく、必要に応じてお電話でご連絡する場合がございます。お急ぎの場合はお電話（{CLINIC.tel}）をご利用ください。
      </p>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "送信中…" : "この内容で送信する"}
      </Button>
    </form>
  );
}
