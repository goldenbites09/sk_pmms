"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { CalendarDays, FileText, Home, Receipt, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const pathname = usePathname() || ""
  const userRole = typeof window !== 'undefined' ? localStorage.getItem("userRole") : null
  const isViewer = userRole === "viewer"

  const navigationData = [
    { name: "Dashboard", href: "/user-view", icon: Home },
    { name: "Programs", href: "/programs", icon: CalendarDays },
    { name: "Participants", href: "/participants", icon: Users },
    { name: "Expenses", href: "/expenses", icon: Receipt },
    // Reports tab removed as requested
  ]

  const navigation = Array.isArray(navigationData) ? navigationData : []

  if (!mounted) return null

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center justify-center mb-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_4-PNuegjThiFoH8dOdfpyFI2evDaCKSZ.png"
            alt="SK San Francisco Logo"
            className="h-16 w-16"
          />
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-500" : "text-gray-400 group-hover:text-gray-500",
                    "mr-3 flex-shrink-0 h-5 w-5",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t p-4">
        <div className="flex items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">SK Monitor System</p>
            <p className="text-xs text-gray-500">Version 1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
