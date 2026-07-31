"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmation: z.string(),
  })
  .refine((data) => data.password === data.confirmation, {
    path: ["confirmation"],
    message: "Passwords do not match",
  });

type ResetForm = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      toast.error("This reset link is invalid");
      return;
    }
    try {
      setSubmitting(true);
      await authApi.resetPassword(token, data.password);
      toast.success("Password updated. You can now sign in.");
      router.push("/auth/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reset password"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          className="mt-1.5"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmation">Confirm Password</Label>
        <Input
          id="confirmation"
          type="password"
          className="mt-1.5"
          {...register("confirmation")}
        />
        {errors.confirmation && (
          <p className="mt-1 text-xs text-destructive">
            {errors.confirmation.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={submitting || !token}
        className="w-full rounded-full"
      >
        {submitting ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
