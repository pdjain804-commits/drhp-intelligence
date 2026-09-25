import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DRHP Intelligence",
  description: "Live SEBI DRHP monitoring and AI-assisted IPO research workflow"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
