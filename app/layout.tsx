import type { Metadata } from "next";
import { Inter, Geist_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPaletteProvider } from "@/components/providers/command-provider";
import { SearchDialog } from "@/components/certilys-ui/dashboard/search-dialog";
import { QuickCreateDialog } from "@/components/certilys-ui/dashboard/quick-create-dialog";
import { ShortcutsDialog } from "@/components/certilys-ui/dashboard/shortcuts-dialog";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Certilys - Panneau d'administration",
  description:
    "Panneau d'administration moderne avec Next.js 16 et Tailwind v4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <CommandPaletteProvider>
            <TooltipProvider>
              {children}
              <SearchDialog />
              <QuickCreateDialog />
              <ShortcutsDialog />
            </TooltipProvider>
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
