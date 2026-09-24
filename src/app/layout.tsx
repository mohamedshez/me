import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { BuildVersion } from "@/components/build-version";
import { Shell } from "@/components/shell";
import { DailyRefresh } from "@/components/daily-refresh";
import "./globals.css";

const sans = localFont({ src: "../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff2", variable: "--font-sans", display: "swap" });
const mono = localFont({ src: "../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2", variable: "--font-mono", display: "swap" });
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.shez.app"),
  title: { default: "Mohamed Shez - Senior Full-Stack Engineer", template: "%s | Mohamed Shez" },
  description: "The personal portfolio of Mohamed Shez. Explore applications, public repositories, and the engineering behind KASH.lv, OSINT, WorldviewOS, and more.",
  openGraph: { type: "website", locale: "en_GB", siteName: "Mohamed Shez", title: "Mohamed Shez - Senior Full-Stack Engineer", description: "Applications, public projects, and the engineering behind them." },
  robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}><head><script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('shez-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}" }} /></head><body><DailyRefresh /><Shell buildVersion={<BuildVersion />}>{children}</Shell><Analytics /></body></html>;
}
