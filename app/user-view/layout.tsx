import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User View',
}

export default function UserViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
