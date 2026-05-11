import type { Metadata } from "next";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-press-start",
  weight: "400",
});

export const metadata: Metadata = {
  title: "MIC Workshop Registration Portal",
  description:
    "Arcade-inspired Microsoft Innovations Club workshop and hackathon registration portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${jetBrainsMono.variable} ${pressStart.variable} dark`} lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
