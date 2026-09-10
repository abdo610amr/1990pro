import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="luxury-container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="luxury-subheading">404</p>
      <h1 className="luxury-heading mt-2">Page Not Found</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Continue exploring our collections.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button className="rounded-full px-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" className="rounded-full px-8">
            Browse Shop
          </Button>
        </Link>
      </div>
    </div>
  );
}
