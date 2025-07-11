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
  const isAdmin = userRole === 'admin' || userRole === 'skofficial'
  const isViewer = userRole === 'viewer'

  const getNavItems = () => {
    const items = [];
    const dashboardHref = isAdmin ? '/dashboard' : '/user-dashboard';

    // Always show the Dashboard link
    items.push({ name: "Dashboard", href: dashboardHref, icon: Home });
    items.push({ name: "Programs", href: "/programs", icon: CalendarDays });
    items.push({ name: "Participants", href: "/participants", icon: Users });
    if (isAdmin) {
      items.push({ name: "Requests", href: "/progrequest", icon: FileText });
    }
    items.push({ name: "Expenses", href: "/expenses", icon: Receipt });

    return items;
  };

  const navigation = getNavItems()

  if (!mounted) return null

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
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
      
    </div>
  )
}
