import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { StorePopup } from "@/components/layout/store-popup";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Made for Originals`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "luxury fashion",
    "streetwear",
    "originals",
    "premium brands",
    "1990",
  ],
  openGraph: {
    title: `${SITE_NAME} — Made for Originals`,
    description: SITE_DESCRIPTION,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} min-h-screen antialiased`}
      >
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen pt-16 md:pt-20">{children}</main>
          <Footer />
          <StorePopup />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
