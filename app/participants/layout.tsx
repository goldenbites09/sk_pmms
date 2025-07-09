import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Participants',
}

export default function ParticipantsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
