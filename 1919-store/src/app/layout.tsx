import type { Metadata } from "next";
import { Archivo_Black, Work_Sans } from "next/font/google";
import { Providers } from "@/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { StorePopup } from "@/components/layout/store-popup";
import { Toaster } from "@/components/ui/sonner";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Made for Originals`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "streetwear",
    "originals",
    "vintage editorial",
    "premium streetwear",
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
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${archivoBlack.variable} ${workSans.variable} min-h-screen bg-background font-body text-primary antialiased`}
      >
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <StorePopup />
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
