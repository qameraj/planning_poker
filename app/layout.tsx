import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Path updated to match your folder: app/component/providers/ThemeProvider.tsx
import { ThemeProvider } from "@/app/component/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Planning Poker - Agile Estimation Tool",
  description: "Premium planning poker application for agile teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}