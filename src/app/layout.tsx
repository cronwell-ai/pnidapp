import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider"
import QueryProvider from "@/lib/reactquery/provider"
import { Toaster } from "@/components/ui/toaster"

import { cn } from "@/lib/utils"
 
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "P&ID App | Label P&ID diagrams",
  description: "Label P&ID diagrams for better understanding"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
          "font-sans antialiased overflow-hidden",
          fontSans.variable
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
            </QueryProvider>
          </ThemeProvider>
          <Toaster />
        </body>
    </html>
  );
}
