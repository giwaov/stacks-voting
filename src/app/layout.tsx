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
  other: {
    "talentapp:project_verification": "02d6dba03b22fcbd3b75f6ea919c5b08dc6098a6ad7029a9ee66bbb20b961d5efff9b500b7693240a3001176777f7543bcbea719a38953387abf0ab0ab680501",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
