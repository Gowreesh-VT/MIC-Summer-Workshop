import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    "Level up at MIC workshops and hackathons. Register your interest to receive updates and secure your spot in our upcoming events.",
  icons: {
    icon: "/mic-logo-removedbg.png",
    apple: "/mic-logo-removedbg.png",
  },
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
