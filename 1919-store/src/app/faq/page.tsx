import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about orders, shipping, returns, and the 1990 platform.",
};

const faqSections = [
  {
    title: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping takes 3–5 business days. Express shipping delivers within 1–2 business days. You'll receive tracking information once your order ships.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes. Orders over $200 qualify for free standard shipping within the United States.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can be modified or cancelled within 1 hour of placement. Contact our support team immediately at hello@1990.com.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 30 days of delivery for unworn items with original tags attached. Refunds are processed within 5–7 business days.",
      },
      {
        q: "How do I start a return?",
        a: "Email hello@1990.com with your order number and items you wish to return.",
      },
      {
        q: "Are partner brand items returnable?",
        a: "Yes. All partner brand products follow the same 30-day return policy as 1990 Originals.",
      },
    ],
  },
  {
    title: "Products & Sizing",
    items: [
      {
        q: "What's the difference between Originals and Partner Brands?",
        a: "Originals are official 1990 products designed in-house. Partner Brands are curated premium local brands, each with their own dedicated brand page on our platform.",
      },
      {
        q: "How do I find my size?",
        a: "Each product page includes detailed size information and fabric composition. When in doubt, size up for oversized silhouettes.",
      },
    ],
  },
  {
    title: "Account & Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit and debit cards, Apple Pay, Google Pay, and cash on delivery in select regions.",
      },
      {
        q: "Is my payment information secure?",
        a: "All transactions are encrypted and processed through PCI-compliant payment providers. We never store full card details.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="luxury-container luxury-section">
      <PageBreadcrumb items={[{ label: "FAQ" }]} />

      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="luxury-subheading">Support</p>
        <h1 className="luxury-heading mt-2">Frequently Asked Questions</h1>
        <p className="mt-4 text-muted-foreground">
          Everything you need to know about shopping at 1990.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-10">
        {faqSections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-4 font-heading text-xl font-light">
              {section.title}
            </h2>
            <Accordion className="rounded-2xl border px-4">
              {section.items.map((item, index) => (
                <AccordionItem key={item.q} value={`${section.title}-${index}`}>
                  <AccordionTrigger className="text-left text-sm hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
