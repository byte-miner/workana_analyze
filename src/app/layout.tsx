import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { MuiProvider } from "@/components/MuiProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-app",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Workana — Platform Research & IT Projects Analyzer",
  description: "Research on the Workana freelance marketplace plus real-time IT programming project analysis",
  icons: {
    icon: "/workana-brand-logo.jpg",
    apple: "/workana-brand-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} min-h-screen antialiased`}>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
