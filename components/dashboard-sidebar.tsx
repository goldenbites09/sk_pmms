"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { CalendarDays, FileText, Home, Receipt, Users, MessageSquare, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function DashboardSidebar() {
  const [mounted, setMounted] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  
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
    
    // Add Feedback link for admin users only
    if (isAdmin) {
      items.push({ name: "Feedback", href: "/feedback", icon: MessageSquare });
    }

    return items;
  };

  const navigation = getNavItems()

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

  if (!mounted) return null

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-white fixed left-0 top-[57px] bottom-0 z-40 overflow-y-auto">
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
        
        {/* Feedback Popover - Only show for non-admin users */}
        {!isAdmin && (
        <div className="px-2 pb-4">
          <Popover open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <MessageSquare className="mr-3 h-5 w-5 text-gray-400" />
                Send Feedback
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" side="right">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Share Your Feedback</h3>
                  <p className="text-sm text-gray-500">Help us improve your experience</p>
                </div>
                
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
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-2">
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
            </PopoverContent>
          </Popover>
        </div>
        )}
      </div>
    </div>
  )
}
