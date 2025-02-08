import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AugmentedApplicant - AI-Powered Job Application Assistant",
  description: "Optimize your job applications with AI-powered resume and cover letter enhancement"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geist.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
