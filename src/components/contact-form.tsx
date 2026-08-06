"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { createContactMessage } from "@/lib/actions/contact";
import { CLINIC } from "@/lib/clinic-info";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function ContactForm() {
  const [state, formAction, pending] = useActionState(createContactMessage, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-secondary/40 p-8 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden />
        <p className="text-lg font-bold">送信が完了しました</p>
        <p className="text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 font-semibold text-destructive">
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="name">
          お名前<span className="ml-1 text-destructive">必須</span>
        </Label>
        <Input id="name" name="name" required autoComplete="name" className="mt-1.5" />
        <FieldError errors={state.errors?.name} />
      </div>

      <div>
        <Label htmlFor="phone">電話番号</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" className="mt-1.5" />
        <FieldError errors={state.errors?.phone} />
      </div>

      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
        <FieldError errors={state.errors?.email} />
      </div>

      <div>
        <Label htmlFor="message">
          お問い合わせ内容<span className="ml-1 text-destructive">必須</span>
        </Label>
        <Textarea id="message" name="message" required rows={6} className="mt-1.5" />
        <FieldError errors={state.errors?.message} />
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
        診療のご予約はこちらではなく
        <a href="/reserve" className="font-semibold text-primary hover:underline">
          Web予約フォーム
        </a>
        をご利用ください。お急ぎの場合はお電話（{CLINIC.tel}）をご利用ください。
      </p>

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "送信中…" : "送信する"}
      </Button>
    </form>
  );
}
