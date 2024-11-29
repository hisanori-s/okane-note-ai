import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import Layout from '@/components/Layout'
import Loading from '@/components/Common/Loading'
import '@/styles/globals.css'

// Googleフォントの設定
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

// メタデータの設定
export const metadata: Metadata = {
  title: 'MoneyKids - 子供のための金銭管理アプリ',
  description: '子供たちが楽しく学べる金銭管理・経済教育アプリケーション',
  keywords: ['お小遣い管理', '子供', '金銭教育', '経済教育'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#4F46E5',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

// ルートレイアウトの型定義
interface RootLayoutProps {
  children: React.ReactNode
}

// ルートレイアウトコンポーネント
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <Layout>
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </Layout>
        </AuthProvider>

        {/* パフォーマンス最適化のためのスクリプト */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // パフォーマンス計測
              performance.mark('app-render');
              // アニメーションの最適化
              document.documentElement.style.scrollBehavior = 'smooth';
            `,
          }}
        />
      </body>
    </html>
  )
}

// CSS変数の型定義
declare module 'react' {
  interface CSSProperties {
    '--font-inter'?: string
  }
}

// キャッシュとリバリデーションの設定
export const revalidate = 3600 // 1時間

// 静的生成の最適化
export const dynamic = 'force-static'

// ストリーミングの有効化
export const streaming = true

// セキュリティヘッダーの設定
export const headers = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}