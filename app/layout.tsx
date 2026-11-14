import type { Metadata } from "next";
import { Instrument_Serif, Newsreader, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import { lotusBootstrap } from "@/components/lotus-lifecycle";
import { siteUrl } from "@/data/site";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-display", display: "swap", fallback: ["Georgia", "Times New Roman"] });
const body = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-body", display: "swap", fallback: ["Georgia", "Times New Roman"] });
const bengali = Noto_Serif_Bengali({ subsets: ["bengali"], weight: "400", variable: "--font-bengali", display: "swap", preload: false, fallback: ["Nirmala UI", "serif"] });

const title = "Bedantika Mondal — Intelligence × Expression";
const description = "B.Tech Computer Science student specializing in AI. Exploring artificial intelligence, creative technology, and expressive digital experiences.";
const socialImage = { url: "/images/social-card.png", width: 1200, height: 630, alt: title };

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, url: "/", type: "website", images: [socialImage] },
  twitter: { card: "summary_large_image", title, description, images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${bengali.variable}`}><head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem('bedantika-theme');document.documentElement.dataset.theme=p==='light'||p==='dark'?p:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()` }} /><script dangerouslySetInnerHTML={{ __html: lotusBootstrap }} /></head><body>{children}</body></html>;
}
