"use client";

import { useActionState } from "react";

import { createNews, updateNews } from "@/lib/actions/news";
import { NEWS_CATEGORIES } from "@/lib/validations";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const initialState = { success: false, message: undefined, errors: undefined } as const;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p role="alert" className="mt-1 text-sm font-semibold text-destructive">
      {errors[0]}
    </p>
  );
}

function toDateTimeLocal(date: Date | null | undefined) {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

export function NewsForm({
  news,
}: {
  news?: {
    id: string;
    title: string;
    body: string;
    category: string;
    isPublished: boolean;
    publishUntil: Date | null;
  };
}) {
  const action = news ? updateNews.bind(null, news.id) : createNews;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="title">
          タイトル<span className="ml-1 text-destructive">必須</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={news?.title}
          className="mt-1.5"
        />
        <FieldError errors={state.errors?.title} />
      </div>

      <div>
        <Label htmlFor="publishUntil">公開終了日時（任意）</Label>
        <Input id="publishUntil" name="publishUntil" type="datetime-local" defaultValue={toDateTimeLocal(news?.publishUntil)} className="mt-1.5" />
        <p className="mt-1 text-xs text-muted-foreground">休診・期間限定のお知らせは期限を設定すると自動的に非表示になります。</p>
      </div>

      <div>
        <Label htmlFor="category">カテゴリ</Label>
        <Select name="category" defaultValue={news?.category ?? "general"}>
          <SelectTrigger className="mt-1.5" id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NEWS_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError errors={state.errors?.category} />
      </div>

      <div>
        <Label htmlFor="body">
          本文<span className="ml-1 text-destructive">必須</span>
        </Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={8}
          defaultValue={news?.body}
          className="mt-1.5"
        />
        <FieldError errors={state.errors?.body} />
      </div>

      <Label htmlFor="isPublished" className="flex items-center gap-3 font-normal">
        <Checkbox
          id="isPublished"
          name="isPublished"
          defaultChecked={news ? news.isPublished : true}
        />
        公開する
      </Label>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "保存中…" : news ? "更新する" : "登録する"}
      </Button>
    </form>
  );
}
