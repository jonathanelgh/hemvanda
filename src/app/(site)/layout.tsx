import Script from "next/script";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Script src="/booking.js?v=19" strategy="afterInteractive" />
      {children}
    </>
  );
}
