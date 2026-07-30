import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistration from "./service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "生活重启计划",
  description: "30天暑假生活重启每日计划与习惯打卡",
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
