import { AppNavigation } from "@/components/AppNavigation";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import "@libitu/ui/tokens.css";
import "./globals.css";
import "@/components/ui/button.css";
import "@/components/ui/field.css";
import "@/components/ui/motion.css";
import "@/features/learning-workspace/practice-theme.css";
import { PracticePersistence } from "@/features/stage-two/persistence/PracticePersistence";

const inter = localFont({
  src: [
    { path: "./fonts/InterVariable.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/InterVariable-Italic.woff2", weight: "100 900", style: "italic" }
  ],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: "Arial"
});

export const metadata: Metadata = {
  title: "Libitu",
  description: "Turn real English input into speaking practice"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ClerkProvider><PracticePersistence><AppNavigation>{children}</AppNavigation></PracticePersistence></ClerkProvider>
      </body>
    </html>
  );
}
