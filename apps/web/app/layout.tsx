import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from '@repo/ui/sessionProvider'

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Annotator",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}
