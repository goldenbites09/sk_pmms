import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Dashboard',
}

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
