"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Menu, User } from "lucide-react"

export default function DashboardHeader() {
  const [username, setUsername] = useState("")
  const [userRole, setUserRole] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // In a real app, this would come from the authenticated user session
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)

    // Set a default username based on role
    if (role === "admin") {
      setUsername("SK Official")
    } else if (role === "skofficial") {
      setUsername("SK Official")
    } else {
      const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : '';
      setUsername(userName || "Viewer")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    router.push("/login")
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame_2-lOeKuJzXYmZy6Kdr9KVjRiinmcMExo.png"
              alt="PMMS Logo"
              className="h-8"
            />
            <span className="text-xl font-bold text-emerald-600">SK Monitor</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">{username}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={username} />
                  <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-2">
            <Link href="/dashboard" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/programs" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Programs
            </Link>
            <Link href="/participants" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Participants
            </Link>
            <Link href="/expenses" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Expenses
            </Link>
            <Link href="/reports" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Reports
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
