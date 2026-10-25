import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav, MobileHeader, Sidebar } from "@/components/Nav";
import { ProgressProvider } from "@/components/ProgressProvider";
import { StorageNotice } from "@/components/StorageNotice";

export const metadata: Metadata = {
  title: { default: "Türkçem — everyday Turkish", template: "%s · Türkçem" },
  description: "Practise real-life Turkish conversations: work, university, shopping, friends and more.",
};

export const viewport: Viewport = {
  themeColor: "#1f5238",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <Sidebar />
          <MobileHeader />
          <main id="main" className="mx-auto max-w-4xl px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:max-w-none lg:px-10 lg:pb-12 lg:pt-10">
            <div className="mx-auto max-w-4xl">
              <StorageNotice />
              {children}
            </div>
          </main>
          <BottomNav />
        </ProgressProvider>
      </body>
    </html>
  );
}
