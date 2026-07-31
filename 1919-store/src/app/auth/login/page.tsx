"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageTransition } from "@/components/shared/page-transition";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { SITE_NAME } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const success = await login(data.email, data.password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back!");
      router.push("/account");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <PageTransition>
      <div className="luxury-container flex min-h-[70vh] items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center">
            <Link href="/">
              <span className="font-heading text-3xl tracking-[0.3em]">{SITE_NAME}</span>
            </Link>
            <h1 className="mt-6 font-heading text-2xl font-light">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="mt-1.5"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="mt-1.5"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-8">
            <Separator />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button variant="outline" className="w-full rounded-full" type="button">
            <FcGoogle className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
