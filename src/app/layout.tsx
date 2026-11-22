import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";

/** Partnerkaart UI uses a tight condensed bold sans — match that voice. */
const roboto = Roboto({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tudengirežiim · Partnerkaart",
  description:
    "Selveri tudengirežiim Partnerkaardi äpis — AI nädala menüü ja ostukorv tudengi eelarvele.",
  applicationName: "Tudengirežiim",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tudengirežiim",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="et"
      className={`${roboto.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black font-sans">{children}</body>
    </html>
  );
}
