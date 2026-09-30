import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "POLARA — Polar Outreach, Learning & Research Archive",
  description:
    "An AI-powered polar science knowledge ecosystem that connects expeditions, research, datasets and media into a searchable repository and transforms verified scientific knowledge into educational and multi-channel outreach content.",
  keywords: [
    "polar science",
    "Antarctica",
    "Arctic",
    "NCPOR",
    "research",
    "knowledge repository",
    "polar outreach",
    "education",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
