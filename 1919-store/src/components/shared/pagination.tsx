"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) =>
      p === 1 ||
      p === totalPages ||
      Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1 py-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, index) => {
        const prevPage = visiblePages[index - 1];
        const showEllipsis = prevPage && page - prevPage > 1;

        return (
          <span key={page} className="contents">
            {showEllipsis && (
              <span className="px-2 text-muted-foreground">...</span>
            )}
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn("rounded-full", currentPage === page && "pointer-events-none")}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </Button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
