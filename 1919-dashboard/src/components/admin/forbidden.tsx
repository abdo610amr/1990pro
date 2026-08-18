"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

export function Forbidden403Screen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const userName = useAuthStore((s) => s.displayName());
  const role = useAuthStore((s) => s.role);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center border-destructive/30 shadow-2xl overflow-hidden">
        <div className="bg-destructive/10 p-8 flex flex-col items-center justify-center border-b border-destructive/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 text-destructive mb-3">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-destructive uppercase">
            Error 403 · Access Denied
          </span>
        </div>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Admin Authorization Required</CardTitle>
          <CardDescription className="text-sm">
            Signed in as <strong className="text-foreground">{userName}</strong> ({role.toUpperCase()}).
            <br />
            You do not have permission to access the Web Admin Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground bg-secondary/50 p-3 rounded-lg border">
            Sellers are restricted to the POS selling environment only. Please contact a system administrator if you require Admin privileges.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <Button variant="default" className="flex-1 gap-2" onClick={() => router.replace("/sell/")}>
              <ArrowLeft className="h-4 w-4" /> Go to POS Selling
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => { logout(); router.replace("/login/"); }}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
