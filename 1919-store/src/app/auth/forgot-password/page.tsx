"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/shared/page-transition";
import { toast } from "sonner";
import { authApi } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success(`Reset instructions requested for ${data.email}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to request reset"
      );
    }
  };

  return (
    <PageTransition>
      <div className="luxury-container flex min-h-[70vh] items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>

          <span className="mt-8 block font-heading text-3xl tracking-[0.3em]">{SITE_NAME}</span>

          {sent ? (
            <div className="mt-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-heading text-2xl font-light">Check Your Email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to your email address.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mt-6 font-heading text-2xl font-light">Reset Password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 text-left">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1.5" {...register("email")} />
                  {errors.email && (
                    <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full rounded-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
