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
  const [displayName, setDisplayName] = useState("")
  const [fullName, setFullName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)
    
    const storedFirstName = localStorage.getItem("firstName") || ""
    const storedLastName = localStorage.getItem("lastName") || ""
    
    if (role === "admin") {
      setDisplayName("Admin User")
      setFullName("Admin User")
    } else if (role === "skofficial") {
      setDisplayName("SK Official")
      setFullName("SK Official")
    } else {
      const name = storedFirstName || storedLastName 
        ? `${storedFirstName} ${storedLastName}`.trim()
        : "User"
      setDisplayName(name)
      setFullName(name)
    }
  }, [])

  const getInitials = (name: string): string => {
    if (!name) return '';
    const nameParts = name.trim().split(' ').filter(part => part);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    }
    return '';
  };

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
    <header className="bg-white border-b sticky top-0 z-30">
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
          <span className="text-sm text-muted-foreground hidden md:inline-block">{displayName}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt={fullName} />
                  <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
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
            <Link href={userRole === 'admin' || userRole === 'skofficial' ? "/dashboard" : "/user-dashboard"} className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/programs" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Programs
            </Link>
            <Link href="/participants" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Participants
            </Link>
            {(userRole === 'admin' || userRole === 'skofficial') && (
              <Link href="/progrequest" className="px-4 py-2 hover:bg-gray-100 rounded-md">
                Requests
              </Link>
            )}
            <Link href="/expenses" className="px-4 py-2 hover:bg-gray-100 rounded-md">
              Expenses
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}