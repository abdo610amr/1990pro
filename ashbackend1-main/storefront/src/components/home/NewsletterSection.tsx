import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-sidebar py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-primary/20">
          <Mail className="h-5 w-5 text-sidebar-primary" />
        </div>
        <h2 className="font-display text-3xl font-bold">Join Our Newsletter</h2>
        <p className="mt-2 text-sidebar-foreground/70">
          Get early access to new drops, exclusive offers, and style edits.
        </p>

        {submitted ? (
          <p className="mt-8 rounded-xl bg-sidebar-primary/20 px-6 py-4 text-sm font-medium text-sidebar-primary">
            Thanks for subscribing! Check your inbox for a welcome offer.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="flex-1 rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-4 py-3 text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/50 focus:border-sidebar-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sidebar-primary px-6 py-3 text-sm font-semibold text-sidebar-primary-foreground transition hover:opacity-90"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
