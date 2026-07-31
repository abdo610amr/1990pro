"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";
import type { Brand } from "@/types";
import { formatFollowers } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  className?: string;
}

export function BrandCard({ brand, className }: BrandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("group", className)}
    >
      <Link href={`/showroom/${brand.slug}`}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={brand.coverImage}
            alt={brand.name}
            fill
            className="image-zoom object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/30">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{brand.name}</h3>
                <p className="text-xs text-white/70">{brand.story}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" />
              {brand.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {formatFollowers(brand.followers)}
            </span>
          </div>
          <Button variant="outline" size="sm" className="rounded-full">
            Visit Store
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
