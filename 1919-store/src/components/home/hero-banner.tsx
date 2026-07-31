"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_SLOGAN } from "@/lib/constants";

export function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
        alt="1990 Luxury Fashion"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="relative flex min-h-[90vh] items-center">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="luxury-subheading text-white/70">{SITE_SLOGAN}</p>
            <h1 className="mt-4 font-heading text-5xl font-light tracking-tight text-white md:text-7xl lg:text-8xl">
              Define Your
              <br />
              Originality
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Discover exclusive Originals and curated premium local brands.
              Luxury fashion for those who lead, never follow.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="rounded-full px-8">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/originals">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  Explore Originals
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-8 w-[1px] bg-white/40"
          />
        </div>
      </motion.div>
    </section>
  );
}
