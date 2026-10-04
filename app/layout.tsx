import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "./workspace-theme.css";
import "./showcase.css";

const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "Voice AI Sales Showcase | Independent Portfolio",
  description:
    "Hear what’s possible. Explore voice AI for learning, localization, and customer conversations across MENA.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
