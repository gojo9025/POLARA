import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://polara.ncpor.res.in'),
  title: {
    default: "POLARA — Polar Outreach, Learning & Research Archive",
    template: "%s | POLARA",
  },
  description:
    "Autonomous AI-powered polar science knowledge ecosystem that connects Indian Antarctic and Arctic expeditions, datasets, research publications, and interactive learning into an accessible scientific repository (NCPOR, Ministry of Earth Sciences).",
  keywords: [
    "polar science",
    "Antarctica",
    "Arctic",
    "NCPOR",
    "ISEA-44",
    "Bharati Station",
    "Maitri Station",
    "Himadri Station",
    "IndARC",
    "Southern Ocean",
    "sea ice variability",
    "glaciology",
    "climate science",
    "knowledge repository",
    "polar outreach",
    "open science data",
  ],
  authors: [{ name: "National Centre for Polar and Ocean Research (NCPOR)" }],
  creator: "National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Govt. of India",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://polara.ncpor.res.in",
    siteName: "POLARA",
    title: "POLARA — Polar Outreach, Learning & Research Archive",
    description:
      "Explore India's scientific expeditions, cryosphere research, real-time station telemetry, and source-grounded polar AI intelligence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "POLARA — Polar Science Knowledge Ecosystem",
    description:
      "Connecting India's polar research expeditions, datasets, and discoveries through an autonomous knowledge portal.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
