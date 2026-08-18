"use client";

import { useState } from "react";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "default" | "inline";
}

export function NewsletterForm({ variant = "default" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubscribed(true);
    toast.success("You're on the list. Watch your inbox.");
  };

  if (subscribed) {
    return (
      <p className="label mt-6 border-t border-border pt-4 text-primary">
        You're on the list. Watch your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="YOUR EMAIL"
        aria-label="Email address"
        className="label w-full flex-1 border-b border-input bg-transparent pb-3 text-primary outline-none placeholder:text-wine/40 focus:border-primary"
      />
      <button
        type="submit"
        disabled={loading}
        className="label shrink-0 border border-primary px-7 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Subscribing..." : "Get Notified"}
      </button>
    </form>
  );
}
