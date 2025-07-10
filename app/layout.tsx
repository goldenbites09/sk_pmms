import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SK Monitoring',
  description: 'SK Monitoring Application',
  // Disable any potential authentication middleware
  // that might be added by templates or frameworks
  // This ensures the site remains fully public
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No authentication checks - this makes all pages public
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        {/* No authentication wrapper */}
        {children}
      </body>
    </html>
  )
}
