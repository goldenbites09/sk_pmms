import type { Metadata } from 'next'

export const metadata: Metadata = {

export default function NewExpenseLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
