import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hemvanda | Förvandlar hem, skapar känsla",
  description:
    "Hemvanda hjälper dig med städ, snickeri, bygg, renovering, handyman, inredning och utvalda övriga tjänster.",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${playfair.variable} ${montserrat.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script src="/booking.js?v=10" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
