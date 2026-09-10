import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "Terms of Service" }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="luxury-heading">Terms of Service</h1>
        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>
            By accessing and using {SITE_NAME}, you agree to these terms. Please
            read them carefully before making a purchase.
          </p>
          <h2 className="font-heading text-xl font-light text-foreground">
            Use of Service
          </h2>
          <p>
            You must be at least 18 years old to purchase on our platform. You
            agree to provide accurate information and maintain the security of
            your account credentials.
          </p>
          <h2 className="font-heading text-xl font-light text-foreground">
            Products & Pricing
          </h2>
          <p>
            All prices are listed in USD unless otherwise stated. We reserve the
            right to modify prices and product availability without prior notice.
            Product images are representative and colors may vary slightly.
          </p>
          <h2 className="font-heading text-xl font-light text-foreground">
            Limitation of Liability
          </h2>
          <p>
            {SITE_NAME} shall not be liable for indirect, incidental, or
            consequential damages arising from the use of our platform or
            products purchased through it.
          </p>
        </div>
      </div>
    </div>
  );
}
