"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "default" | "inline";
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setEmail("");
    toast.success("Welcome to the Originals. You're subscribed.");
  };

  if (variant === "inline") {
    return (
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 rounded-full border-border bg-background"
        />
        <Button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-full px-8"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-3 sm:flex-row"
    >
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
      />
      <Button
        type="submit"
        variant="secondary"
        disabled={loading}
        className="shrink-0 px-8"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
