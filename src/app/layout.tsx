import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
  title: "Transcribe.ai - AI Meeting Transcription & Summarization",
  description: "Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.",
  keywords: "AI transcription, meeting summarization, speech-to-text, action items, Google Meet, Zoom, Teams",
  authors: [{ name: "Transcribe.ai" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Transcribe.ai - AI Meeting Transcription & Summarization",
    description: "Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Transcribe.ai - AI Meeting Transcription & Summarization",
    description: "Transform your meetings into actionable insights with AI-powered transcription, summarization, and action item extraction.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
