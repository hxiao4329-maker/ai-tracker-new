import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 动态追踪 - 主流 AI 产品更新聚合",
  description: "每天自动追踪 ChatGPT、豆包、Gemini、Claude、Grok 等主流 AI 产品的最新动态、功能更新与发布内容。",
  keywords: ["AI 动态", "ChatGPT", "Claude", "Gemini", "Grok", "豆包", "AI 产品更新"],
  authors: [{ name: "AI Tracker" }],
  openGraph: {
    title: "AI 动态追踪 - 主流 AI 产品更新聚合",
    description: "每天自动追踪 ChatGPT、豆包、Gemini、Claude、Grok 等主流 AI 产品的最新动态、功能更新与发布内容。",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 动态追踪 - 主流 AI 产品更新聚合",
    description: "每天自动追踪 ChatGPT、豆包、Gemini、Claude、Grok 等主流 AI 产品的最新动态、功能更新与发布内容。",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
