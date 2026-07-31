import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SocialLinks } from "@/components/shared/social-links";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  FOOTER_LINKS,
  SITE_ESTABLISHED,
  SITE_MARK,
  SITE_NAME,
  SITE_SLOGAN,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="luxury-container luxury-section">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block" aria-label={`${SITE_NAME} home`}>
              <BrandLogo className="h-16 w-52" />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{SITE_SLOGAN}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Discover exclusive Originals and curated premium local brands at
              1990 — where luxury meets originality.
            </p>
            <SocialLinks
              className="mt-6"
              instagram="https://instagram.com/1990official"
              twitter="https://twitter.com/1990official"
              facebook="https://facebook.com/1990official"
            />
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium tracking-wider uppercase">
              Shop
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium tracking-wider uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium tracking-wider uppercase">
              Account
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-primary p-8 text-primary-foreground md:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h3 className="font-heading text-2xl font-light md:text-3xl">
              Join the Originals
            </h3>
            <p className="mt-2 text-sm opacity-80">
              Subscribe for exclusive access to new collections, early releases,
              and member-only offers.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <Separator />
      <div className="luxury-container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_NAME} · {SITE_MARK} · Est.{" "}
          {SITE_ESTABLISHED}. All rights reserved.
        </p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/shipping" className="hover:text-foreground">
            Shipping Info
          </Link>
        </div>
      </div>
    </footer>
  );
}
