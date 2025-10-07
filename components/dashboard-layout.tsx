"use client"

import { ReactNode } from "react"
import DashboardHeader from "./dashboard-header"
import DashboardSidebar from "./dashboard-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
