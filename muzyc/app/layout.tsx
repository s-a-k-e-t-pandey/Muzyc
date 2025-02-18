import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers, ThemeProvider } from "../components/providers";
import { Toaster } from "sonner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

const inter = Inter({ subsets: ["latin"] });

type ToasterProps = React.ComponentProps<typeof Toaster>;

const toastOptions: ToasterProps = {
  theme: "dark",
  richColors: true,
  closeButton: true,
  pauseWhenPageIsHidden: true,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  keywords: "music stream, fan interaction, live streaming, high-quality audio, curate music, Muzyc",
  title: "MUZYC | Music Streaming",
  description: "Live fan-curated music streaming. High-quality audio, real-time engagement.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: `${process.env.NEXTAUTH_URL}/opengraph-image.png`,
    images: "/opengraph-image.png",
    siteName: "Infra",
  },
  icons: [
    {
      url: `${process.env.NEXTAUTH_URL}/favicon.ico`,
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#1b1934b2]`}>
        <Toaster {...toastOptions} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Providers session={session}>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}