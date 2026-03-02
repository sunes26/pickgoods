import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "PickGoods - 상황 맞춤형 쇼핑 큐레이션",
    template: "%s | PickGoods"
  },
  description: "당신의 상황에 딱 맞는 물건을 지마켓에서 픽(Pick)해드립니다. AI 기반 979개 상품 추천 서비스",
  keywords: ["지마켓", "쇼핑", "큐레이션", "AI 추천", "위탁판매", "상품 추천"],
  authors: [{ name: "PickGoods Team" }],
  creator: "PickGoods",
  publisher: "PickGoods",

  // OpenGraph
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://pickgoods.com",
    siteName: "PickGoods",
    title: "PickGoods - 상황 맞춤형 쇼핑 큐레이션",
    description: "당신의 상황에 딱 맞는 물건을 지마켓에서 픽(Pick)해드립니다. AI 기반 979개 상품 추천 서비스",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "PickGoods - AI 기반 쇼핑 큐레이션"
      }
    ]
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "PickGoods - 상황 맞춤형 쇼핑 큐레이션",
    description: "당신의 상황에 딱 맞는 물건을 지마켓에서 픽(Pick)해드립니다",
    images: ["/og-image.svg"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },

  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PickGoods",
    "url": "https://pickgoods.com",
    "logo": "https://pickgoods.com/icon.svg",
    "description": "AI 기반 상황 맞춤형 쇼핑 큐레이션 서비스",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PickGoods",
    "url": "https://pickgoods.com",
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://pickgoods.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
