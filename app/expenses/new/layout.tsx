import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Expense',
}

export default function NewExpenseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
