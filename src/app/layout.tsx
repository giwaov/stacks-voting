import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stacks Voting",
  description: "Decentralized polls on Bitcoin via Stacks blockchain",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Stacks Voting",
    description: "Create and vote on decentralized polls secured by Bitcoin",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Stacks Voting",
    description: "Create and vote on decentralized polls secured by Bitcoin",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
