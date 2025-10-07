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
import { LogOut, Menu, User, MessageSquare, Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function DashboardHeader() {
  const [displayName, setDisplayName] = useState("")
  const [fullName, setFullName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.log('No authenticated user found')
          return
        }

        // Fetch participant data from database
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .select('first_name, last_name, profile_picture_url')
          .eq('user_id', user.id)
          .maybeSingle()

        if (participantError) {
          console.error('Error fetching participant:', participantError)
        }

        // Update state with database values
        const role = localStorage.getItem("userRole") || ""
        setUserRole(role)

        if (participant) {
          const firstName = participant.first_name || ""
          const lastName = participant.last_name || ""
          const profilePic = participant.profile_picture_url || null

          // Update localStorage with fresh data
          if (firstName) localStorage.setItem("firstName", firstName)
          if (lastName) localStorage.setItem("lastName", lastName)
          if (profilePic) {
            localStorage.setItem("profilePictureUrl", profilePic)
          } else {
            localStorage.removeItem("profilePictureUrl")
          }

          setProfilePictureUrl(profilePic)

          if (role === "admin") {
            setDisplayName("Admin User")
            setFullName("Admin User")
          } else if (role === "skofficial") {
            setDisplayName("SK Official")
            setFullName("SK Official")
          } else {
            const name = firstName || lastName 
              ? `${firstName} ${lastName}`.trim()
              : "User"
            setDisplayName(name)
            setFullName(name)
          }
        } else {
          // Fallback to localStorage if no participant found
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
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error)
      }
    }

    // Initial load - fetch from database
    fetchUserProfile()

    // Listen for storage changes (from profile page updates)
    const handleStorageChange = () => {
      fetchUserProfile()
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
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

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear all localStorage data
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    localStorage.removeItem("firstName")
    localStorage.removeItem("lastName")
    localStorage.removeItem("profilePictureUrl")
    
    router.push("/login")
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem("userEmail") : null
      const userName = typeof window !== 'undefined' ? 
        `${localStorage.getItem("firstName") || ""} ${localStorage.getItem("lastName") || ""}`.trim() : null

      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: userId,
            user_email: userEmail,
            user_name: userName,
            feedback_text: feedbackText,
            rating: rating > 0 ? rating : null,
            category: category,
            status: 'pending'
          }
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      })

      // Reset form
      setFeedbackText("")
      setRating(0)
      setCategory("general")
      setFeedbackOpen(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <header className="bg-white border-b fixed top-0 left-0 right-0 z-50">
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
                  <AvatarImage src={profilePictureUrl || undefined} alt={fullName} />
                  <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profilePictureUrl || undefined} alt={fullName} />
                    <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userRole}</p>
                  </div>
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
            {(userRole === 'admin' || userRole === 'skofficial') && (
              <Link href="/feedback" className="px-4 py-2 hover:bg-gray-100 rounded-md">
                Feedback
              </Link>
            )}
            {!(userRole === 'admin' || userRole === 'skofficial') && (
              <button
                onClick={() => {
                  setFeedbackOpen(true)
                  setIsMobileMenuOpen(false)
                }}
                className="px-4 py-2 hover:bg-gray-100 rounded-md text-left flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send Feedback
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Feedback Dialog for non-admin users */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
            <DialogDescription>
              Help us improve your experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Rating (Optional)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="general">General</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="improvement">Improvement</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Feedback</label>
              <Textarea
                placeholder="Tell us what you think..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFeedbackOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}