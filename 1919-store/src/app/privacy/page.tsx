import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>
        At {SITE_NAME}, we respect your privacy and are committed to protecting
        your personal data. This policy explains how we collect, use, and
        safeguard your information when you shop on our platform.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We collect information you provide directly — such as name, email,
        shipping address, and payment details — as well as usage data including
        browsing behavior and device information.
      </p>
      <h2>How We Use Your Data</h2>
      <p>
        Your data is used to process orders, provide customer support, improve
        our services, and — with your consent — send marketing communications
        about new collections and offers.
      </p>
      <h2>Data Security</h2>
      <p>
        All payment transactions are encrypted and processed through
        PCI-compliant providers. We never store full credit card numbers on our
        servers.
      </p>
    </LegalPageLayout>
  );
}

function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: title }]} />
      <div className="mx-auto max-w-3xl">
        <h1 className="luxury-heading">{title}</h1>
        <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-muted-foreground [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-light [&_h2]:text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
