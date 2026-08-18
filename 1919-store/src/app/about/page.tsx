import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_SLOGAN } from "@/lib/constants";

export const metadata = {
  title: "About",
  description: `Learn about ${SITE_NAME} — a luxury fashion destination for originals and curated local brands.`,
};

const values = [
  {
    title: "Originality",
    description:
      "We celebrate individuality through design that refuses to follow trends and instead defines them.",
  },
  {
    title: "Craftsmanship",
    description:
      "Every piece is selected for exceptional materials, construction, and attention to detail.",
  },
  {
    title: "Community",
    description:
      "Our platform elevates premium local brands, connecting creators with a global audience.",
  },
];

export default function AboutPage() {
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "About" }]} />

      <div className="mx-auto max-w-3xl text-center">
        <p className="luxury-subheading">Our Story</p>
        <h1 className="luxury-heading mt-2">{SITE_NAME}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{SITE_SLOGAN}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Founded on the belief that luxury should feel personal, {SITE_NAME} is
          a destination where official Originals meet a curated marketplace of
          premium local brands. We blend the precision of high fashion with the
          energy of modern street culture — creating an experience inspired by
          the world&apos;s most refined retailers, yet entirely our own.
        </p>
      </div>

      <div className="relative mt-16 aspect-[21/9] overflow-hidden rounded-2xl">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=700&fit=crop"
          alt="1990 luxury space"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-2xl border bg-secondary/20 p-8 text-center"
          >
            <h2 className="font-heading text-2xl font-light">{value.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {value.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-2xl bg-primary p-10 text-center text-primary-foreground md:p-16">
        <h2 className="font-heading text-3xl font-light md:text-4xl">
          Experience the Platform
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm opacity-80">
          Explore official Originals, discover partner brands, and shop
          collections curated for those who lead — not follow.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop">
            <Button variant="secondary" className="rounded-full px-8">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/brands">
            <Button
              variant="outline"
              className="rounded-full border-primary-foreground/30 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Explore Brands
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
