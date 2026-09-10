import Link from "next/link";
import { OtzMark } from "@/components/shared/otz-mark";
import { FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-background px-6 py-20 md:px-12 border-t border-border">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-10 border-b border-border pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="display block text-[clamp(3rem,10vw,7rem)] text-primary uppercase">1990</span>
            <span className="label mt-4 block text-wine/70">Made for Originals</span>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <h4 className="label text-primary mb-3">Shop</h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="label text-[11px] text-wine/70 transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="label text-primary mb-3">Company</h4>
              <ul className="space-y-2">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="label text-[11px] text-wine/70 transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <span className="label text-wine/60">Est. 2026</span>
          <OtzMark />
          <span className="label text-wine/60">© 1990 — Made for Originals</span>
        </div>
      </div>
    </footer>
  );
}
