import type { Metadata } from 'next'
import React from "react";
export const metadata: Metadata = {
  title: 'Programs',
}

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
