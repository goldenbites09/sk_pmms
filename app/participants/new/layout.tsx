import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Participant',
}

export default function NewParticipantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
