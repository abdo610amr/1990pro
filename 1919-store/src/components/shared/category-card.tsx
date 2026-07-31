"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn("group", className)}
    >
      <Link href={`/shop?category=${category.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="image-zoom object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4">
            <h3 className="text-lg font-medium text-white">{category.name}</h3>
            <p className="text-xs text-white/70">
              {category.productCount} Products
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
