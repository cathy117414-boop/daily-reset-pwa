import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistration from "./service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina",
  description: "每日计划与文学相伴",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.svg",
    apple: "/app-icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6ef",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
