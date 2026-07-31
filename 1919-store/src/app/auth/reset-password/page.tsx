import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <div className="luxury-container luxury-section">
      <div className="mx-auto max-w-md rounded-2xl border p-8">
        <p className="luxury-subheading">Account Recovery</p>
        <h1 className="mt-2 font-heading text-3xl font-light">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new secure password for your account.
        </p>
        <Suspense fallback={<Skeleton className="mt-8 h-52 w-full" />}>
          <ResetPasswordForm />
        </Suspense>
        <Link
          href="/auth/login"
          className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
