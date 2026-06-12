import Script from "next/script";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script src="/booking.js?v=16" strategy="afterInteractive" />
      {children}
    </>
  );
}
