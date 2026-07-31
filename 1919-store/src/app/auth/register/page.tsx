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

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const success = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    setLoading(false);
    if (success) {
      toast.success("Account created successfully!");
      router.push("/account");
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
            <h1 className="mt-6 font-heading text-2xl font-light">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join the 1990 community of originals
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" className="mt-1.5" {...register("firstName")} />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" className="mt-1.5" {...register("lastName")} />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="mt-1.5" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" className="mt-1.5" {...register("password")} />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" className="mt-1.5" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
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
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
