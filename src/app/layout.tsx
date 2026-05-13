import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query/provider";
import "@/app/globals.css";

// Plex for the working UI: open counters and tabular figures read well in
// dense schedules. Fraunces gives page titles a hospitality voice without
// spilling into the data.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "ShiftSync",
  description: "Multi-location staff scheduling platform",
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
