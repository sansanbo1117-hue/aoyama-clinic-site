"use client";

import { useActionState } from "react";

import { login } from "@/lib/actions/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { success: false, message: undefined } as const;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "ログイン中…" : "ログイン"}
      </Button>
    </form>
  );
}
