import './globals.css'

export default function RootLayout({
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
