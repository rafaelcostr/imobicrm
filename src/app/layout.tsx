import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import { AuthProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ImobiCRM — CRM Imobiliário",
    template: "%s | ImobiCRM",
  },
  description:
    "Plataforma SaaS de gestão imobiliária para corretores e imobiliárias. Leads, funil de vendas, imóveis, comissões e relatórios em um só lugar.",
  keywords: ["CRM imobiliário", "corretor de imóveis", "gestão de leads", "ImobiCRM"],
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
