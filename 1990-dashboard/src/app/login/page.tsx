"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";

const schema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await login(values.identifier, values.password);
      toast.success(`Welcome to ${SITE_NAME} Admin Web Portal`);
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md overflow-hidden shadow-xl border-border/80">
        <div className="bg-primary px-8 py-10 text-primary-foreground">
          <BrandLogo className="mb-6 h-12 w-40 rounded-xl" priority />
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
            Admin Web Portal
          </p>
          <h1 className="mt-2 font-heading text-4xl">{SITE_NAME} Admin</h1>
          <p className="mt-2 text-sm text-white/80">{SITE_SLOGAN}</p>
        </div>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-heading">Admin sign in</CardTitle>
          <CardDescription>
            Enter your Admin credentials to access the Web Control Panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username or Email</label>
              <Input
                {...form.register("identifier")}
                placeholder="admin or ahmed@1990.store"
                autoComplete="username"
              />
              {form.formState.errors.identifier && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                {...form.register("password")}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full h-11 text-base" size="lg" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
