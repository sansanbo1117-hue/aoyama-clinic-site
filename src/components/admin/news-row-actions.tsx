"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

import { deleteNews, togglePublish } from "@/lib/actions/news";
import { Button } from "@/components/ui/button";

export function NewsRowActions({
  id,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label={isPublished ? "非公開にする" : "公開する"}
        onClick={() => startTransition(() => togglePublish(id, !isPublished))}
      >
        {isPublished ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
      <Button variant="ghost" size="icon" asChild aria-label="編集">
        <Link href={`/admin/news/${id}/edit`}>
          <Pencil className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        aria-label="削除"
        onClick={() => {
          if (confirm("このお知らせを削除しますか？")) {
            startTransition(() => deleteNews(id));
          }
        }}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
