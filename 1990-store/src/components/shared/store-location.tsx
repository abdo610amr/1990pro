import Link from "next/link";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import {
  STORE_NAME,
  STORE_ADDRESS_LINE1,
  STORE_ADDRESS_LINE2,
  STORE_HOURS,
  STORE_MAPS_URL,
  STORE_MAPS_EMBED,
} from "@/lib/constants";

/**
 * "Find Our Store" section — physical store address + live map + directions.
 * Used on the home page and the about page.
 */
export function StoreLocation({ eyebrow = "Visit Us" }: { eyebrow?: string }) {
  return (
    <section className="grain border-t border-border bg-background px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-16">
          {/* ── Text ── */}
          <div className="flex flex-col justify-center">
            <p className="label text-wine/70">{eyebrow}</p>
            <h2 className="display mt-4 text-[clamp(2.25rem,5.5vw,4.75rem)] uppercase leading-[0.95] text-primary">
              Find Our
              <br />
              Store
            </h2>

            <div className="mt-8 max-w-md space-y-5 border-t border-border pt-8">
              <div className="flex items-start gap-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-wine" />
                <div className="leading-relaxed">
                  <p className="font-medium text-primary">{STORE_NAME}</p>
                  <p className="text-wine/80">{STORE_ADDRESS_LINE1}</p>
                  <p className="text-wine/80">{STORE_ADDRESS_LINE2}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-wine" />
                <p className="text-wine/80">{STORE_HOURS}</p>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href={STORE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="label group inline-flex items-center gap-4 border border-primary px-8 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
              >
                Get Directions
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ── Map ── */}
          <div className="relative min-h-[340px] overflow-hidden border border-border md:min-h-[460px]">
            <iframe
              title="1990 store location map"
              src={STORE_MAPS_EMBED}
              className="absolute inset-0 h-full w-full grayscale-[0.25] transition-all duration-700 hover:grayscale-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
