import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { OtzMark } from "@/components/OtzMark";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

import essentialTee from "@/assets/p-essential-tee.jpg";
import oversizedTee from "@/assets/p-oversized-tee.jpg";
import signatureTee from "@/assets/p-signature-tee.jpg";
import coreHoodie from "@/assets/p-core-hoodie.jpg";
import cap from "@/assets/p-cap.jpg";
import heavyHoodie from "@/assets/p-heavy-hoodie.jpg";
import campaign from "@/assets/campaign.jpg";
import comingSoonImg from "@/assets/coming-soon.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "1990 — Made for Originals | Premium Streetwear" },
      {
        name: "description",
        content:
          "1990 — made for originals. Heavyweight tees, hoodies and caps in a vintage editorial streetwear identity. EST. 2026.",
      },
      { property: "og:title", content: "1990 — Made for Originals" },
      {
        property: "og:description",
        content:
          "A premium streetwear label built for individuality, authenticity and timeless pieces.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const newArrivals: Product[] = [
  { name: "1990 Essential Tee", price: "$68", image: essentialTee, tag: "New" },
  { name: "Originals Oversized Tee", price: "$74", image: oversizedTee, tag: "New" },
  { name: "OTZ Signature Tee", price: "$72", image: signatureTee, tag: "New" },
  { name: "1990 Core Hoodie", price: "$148", image: coreHoodie, tag: "New" },
];

const bestSellers: Product[] = [
  { name: "1990 Essential Tee", price: "$68", image: essentialTee, tag: "Best Seller" },
  { name: "OTZ Signature Tee", price: "$72", image: signatureTee, tag: "Best Seller" },
  { name: "Originals Oversized Tee", price: "$74", image: oversizedTee },
  { name: "1990 Heavyweight Hoodie", price: "$158", image: heavyHoodie, tag: "Best Seller" },
];

const collection: Product[] = [
  { name: "1990 Essential Tee", price: "$68", image: essentialTee },
  { name: "Originals Oversized Tee", price: "$74", image: oversizedTee },
  { name: "OTZ Signature Tee", price: "$72", image: signatureTee },
  { name: "1990 Core Hoodie", price: "$148", image: coreHoodie },
  { name: "Originals Cap", price: "$48", image: cap },
  { name: "1990 Heavyweight Hoodie", price: "$158", image: heavyHoodie },
];

function SectionHead({
  label,
  title,
  note,
}: {
  label: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-14 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <Reveal>
          <span className="label text-wine/70">{label}</span>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="display mt-4 text-[clamp(2.5rem,6vw,5.5rem)] uppercase text-primary">
            {title}
          </h2>
        </Reveal>
      </div>
      {note && (
        <Reveal delay={200}>
          <p className="label max-w-xs text-wine/70">{note}</p>
        </Reveal>
      )}
    </div>
  );
}

function ImageReveal({
  src,
  alt,
  className,
  ratio,
}: {
  src: string;
  alt: string;
  className?: string;
  ratio: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={cn("overflow-hidden bg-secondary", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("clip-reveal w-full object-cover", ratio, visible && "is-visible")}
      />
    </div>
  );
}

function Index() {
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  return (
    <div id="top" className="min-h-screen bg-background font-body">
      <Nav />

      {/* HERO */}
      <section className="grain relative flex min-h-[100svh] flex-col justify-center px-6 pt-28 md:px-12">
        <div className="mx-auto w-full max-w-[1500px]">
          <p className="rise label text-wine/70" style={{ animationDelay: "80ms" }}>
            1990 — Streetwear
          </p>

          <h1
            className="rise display mt-6 text-[clamp(5rem,23vw,20rem)] text-primary"
            style={{ animationDelay: "220ms" }}
          >
            1990
          </h1>

          <div
            className="rise mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-border pt-6"
            style={{ animationDelay: "620ms" }}
          >
            <span className="label text-primary">Made for Originals</span>
            <OtzMark />
            <span className="label ml-auto text-wine/70">Est. 2026</span>
          </div>

          <div className="rise mt-16 md:mt-20" style={{ animationDelay: "880ms" }}>
            <a
              href="#new-arrivals"
              className="label group inline-flex items-center gap-4 border border-primary px-8 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
            >
              Shop the Collection
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT */}
      <section className="px-6 py-32 md:px-12 md:py-48">
        <div className="mx-auto grid max-w-[1500px] gap-16 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal>
              <h2 className="display text-[clamp(2rem,5.4vw,4.75rem)] uppercase text-primary">
                Not made for
                <br />
                everyone.
                <br />
                <span className="text-wine">Made for originals.</span>
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-4 md:pt-4">
            <Reveal delay={180}>
              <p className="max-w-sm text-base leading-relaxed text-wine/80">
                1990 is built for individuality, authenticity and timeless pieces. A modern
                streetwear identity inspired by those who choose their own direction.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-10 h-px w-full bg-border" />
              <p className="label mt-6 text-wine/60">Originals only — since 2026</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section id="new-arrivals" className="scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto max-w-[1500px]">
          <SectionHead label="Just Dropped" title="New Arrivals" note="Four pieces. One direction." />
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.name} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section id="best-sellers" className="scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto max-w-[1500px]">
          <SectionHead
            label="Best Sellers"
            title="Best Sellers"
            note="The ones you keep coming back to."
          />
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p, i) => (
              <ProductCard key={`bs-${p.name}`} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL STATEMENT */}
      <section className="relative px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto max-w-[1500px]">
          <ImageReveal
            src={campaign}
            alt="1990 campaign — model in burgundy overcoat in a sunlit concrete room"
            ratio="aspect-[16/10] md:aspect-[16/8]"
          />
          <Reveal>
            <h2 className="display mt-10 text-[clamp(2.25rem,8vw,7rem)] uppercase text-primary">
              Wear your original.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className="scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto max-w-[1500px]">
          <SectionHead label="Full Range" title="The Collection" note="Tees. Hoodies. Headwear." />
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {collection.map((p, i) => (
              <ProductCard key={`c-${p.name}`} product={p} index={i % 3} />
            ))}
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section id="coming-soon" className="scroll-mt-24 px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto grid max-w-[1500px] items-end gap-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <ImageReveal
              src={comingSoonImg}
              alt="Silhouette behind a curtain teasing the next 1990 collection"
              ratio="aspect-[4/5] md:aspect-[4/4.4]"
            />
          </div>
          <div className="md:col-span-5 md:pb-6">
            <Reveal>
              <span className="label text-wine/70">New Collection</span>
            </Reveal>
            <Reveal delay={220}>
              <h2 className="display mt-5 text-[clamp(2.75rem,7vw,6rem)] uppercase text-primary">
                Coming
                <br />
                Soon
              </h2>
            </Reveal>
            <Reveal delay={460}>
              <p className="label mt-8 text-wine/70">A new chapter is on the way.</p>
            </Reveal>
            <Reveal delay={640}>
              {notified ? (
                <p className="label mt-10 border-t border-border pt-6 text-primary">
                  You're on the list. Watch your inbox.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setNotified(true);
                  }}
                  className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row"
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
                    className="label shrink-0 border border-primary px-7 py-4 text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground"
                  >
                    Get Notified
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="px-6 pb-32 md:px-12 md:pb-40">
        <div className="mx-auto grid max-w-[1500px] gap-12 border-t border-border pt-14 md:grid-cols-3 md:gap-16">
          {[
            ["01", "Originality", "Designed for people who don't follow the crowd."],
            ["02", "Quality", "Thoughtful pieces made to become everyday essentials."],
            ["03", "Identity", "Your style. Your story. Your rules."],
          ].map(([n, title, copy], i) => (
            <Reveal key={n} delay={i * 160}>
              <div className="md:border-l md:border-border md:pl-8 md:first:border-l-0 md:first:pl-0">
                <span className="label text-wine/60">{n}</span>
                <h3 className="display mt-4 text-3xl uppercase text-primary md:text-4xl">{title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-wine/75">{copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="final" className="grain scroll-mt-24 bg-primary px-6 py-36 md:px-12 md:py-52">
        <div className="mx-auto max-w-[1500px] text-center">
          <Reveal>
            <h2 className="display text-[clamp(3.5rem,14vw,11rem)] uppercase text-primary-foreground">
              Be original.
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="label mt-8 text-primary-foreground/70">Discover the 1990 collection.</p>
          </Reveal>
          <Reveal delay={340}>
            <a
              href="#collection"
              className="label mt-14 inline-block border border-primary-foreground px-10 py-4 text-primary-foreground transition-colors duration-500 hover:bg-primary-foreground hover:text-primary"
            >
              Shop 1990
            </a>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-background px-6 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-10 border-b border-border pb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="display block text-[clamp(3rem,10vw,7rem)] text-primary">1990</span>
              <span className="label mt-4 block text-wine/70">Made for Originals</span>
            </div>
            <ul className="flex flex-wrap gap-8">
              {["Instagram", "TikTok", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href="#top"
                    className="label text-primary/80 transition-colors hover:text-primary"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <span className="label text-wine/60">Est. 2026</span>
            <OtzMark />
            <span className="label text-wine/60">© 1990</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
