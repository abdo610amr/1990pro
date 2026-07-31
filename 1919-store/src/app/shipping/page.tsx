import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

export const metadata = {
  title: "Shipping Information",
};

export default function ShippingPage() {
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Shipping Info" }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="luxury-heading">Shipping Information</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>
            We ship to all 50 US states and select international destinations.
            All orders are processed within 1–2 business days.
          </p>
          <h2 className="font-heading text-xl font-light text-foreground">
            Shipping Options
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong className="text-foreground">Standard</strong> — 3–5
              business days (${SHIPPING_COST}, free on orders over $
              {FREE_SHIPPING_THRESHOLD})
            </li>
            <li>
              <strong className="text-foreground">Express</strong> — 1–2
              business days ($25)
            </li>
          </ul>
          <h2 className="font-heading text-xl font-light text-foreground">
            Tracking
          </h2>
          <p>
            Once your order ships, you&apos;ll receive a confirmation email with
            a tracking number. Track your package from your account orders page.
          </p>
          <h2 className="font-heading text-xl font-light text-foreground">
            International Shipping
          </h2>
          <p>
            International orders may be subject to customs duties and import
            taxes, which are the responsibility of the recipient.
          </p>
        </div>
      </div>
    </div>
  );
}
