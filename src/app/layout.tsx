import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Selver Tudengirežiim",
  description:
    "AI-abiga nädala menüü ja ostukorv tudengi eelarvele — Selveri häkatoni prototüüp.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="et"
      className={`${figtree.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
