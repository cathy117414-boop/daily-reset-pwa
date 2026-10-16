import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistration from "./service-worker-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina",
  description: "每日计划与文学相伴",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/lumina-flower-v1.ico", sizes: "16x16 32x32 48x48" },
      { url: "/icons/lumina-flower-v1-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/lumina-flower-v1-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/icons/lumina-flower-v1-180.png", sizes: "180x180", type: "image/png" },
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
