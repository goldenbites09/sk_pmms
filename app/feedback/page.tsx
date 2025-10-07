"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { MessageSquare, Star, Calendar, Tag, User, Mail, Filter } from "lucide-react"

interface Feedback {
  id: number
  user_id: string | null
  user_email: string | null
  user_name: string | null
  feedback_text: string
  rating: number | null
  category: string
  status: string
  created_at: string
  updated_at: string
}

export default function FeedbackPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
      const userId = localStorage.getItem("userId")
      const userRole = localStorage.getItem("userRole")
      const adminCheck = userRole === 'admin' || userRole === 'skofficial'

      if (!isLoggedIn || !userId) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to view this page",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setIsAdmin(adminCheck)
      await fetchFeedback(userId, adminCheck)
    }

    checkAuth()
  }, [router, toast])

  const fetchFeedback = async (userId: string, isAdminUser: boolean) => {
    try {
      let query = supabase
        .from('feedback')
        .select('*')
      
      // If not admin, only show user's own feedback
      if (!isAdminUser) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setFeedbackList(data || [])
      setFilteredFeedback(data || [])
    } catch (error) {
      console.error('Error fetching feedback:', error)
      toast({
        title: "Error",
        description: "Failed to load your feedback",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = feedbackList

    if (categoryFilter !== "all") {
      filtered = filtered.filter(f => f.category === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(f => f.status === statusFilter)
    }

    setFilteredFeedback(filtered)
  }, [categoryFilter, statusFilter, feedbackList])

  const updateFeedbackStatus = async (feedbackId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', feedbackId)

      if (error) throw error

      // Update local state
      setFeedbackList(prev => 
        prev.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f)
      )

      toast({
        title: "Success",
        description: "Feedback status updated successfully",
      })
    } catch (error) {
      console.error('Error updating feedback status:', error)
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      bug: "bg-red-100 text-red-700 border-red-200",
      feature: "bg-blue-100 text-blue-700 border-blue-200",
      improvement: "bg-purple-100 text-purple-700 border-purple-200",
      general: "bg-gray-100 text-gray-700 border-gray-200",
      other: "bg-orange-100 text-orange-700 border-orange-200",
    }
    return colors[category] || colors.general
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      reviewed: "bg-blue-100 text-blue-700 border-blue-200",
      resolved: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-gray-100 text-gray-700 border-gray-200",
    }
    return colors[status] || colors.pending
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen overflow-auto md:ml-64">
          <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    {isAdmin ? "All User Feedback" : "My Feedback"}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {isAdmin ? "View and manage all user feedback" : "View all your submitted feedback"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{filteredFeedback.length}</span>
                  <span className="text-sm sm:text-base text-gray-500">/ {feedbackList.length}</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {feedbackList.length === 0 ? "No feedback yet" : "No matching feedback"}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    {feedbackList.length === 0 
                      ? "You haven't submitted any feedback. Use the 'Send Feedback' button in the sidebar to share your thoughts!"
                      : "No feedback matches your current filters. Try adjusting the filters above."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFeedback.map((feedback) => (
                  <Card key={feedback.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${getCategoryColor(feedback.category)} text-xs`}>
                              {feedback.category}
                            </Badge>
                            {isAdmin ? (
                              <Select
                                value={feedback.status}
                                onValueChange={(value) => updateFeedbackStatus(feedback.id, value)}
                              >
                                <SelectTrigger className={`w-full sm:w-[140px] h-7 text-xs ${getStatusColor(feedback.status)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge className={`${getStatusColor(feedback.status)} text-xs`}>
                                {feedback.status}
                              </Badge>
                            )}
                          </div>
                          {feedback.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                    i < feedback.rating!
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {isAdmin && feedback.user_name && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">{feedback.user_name}</span>
                              </div>
                              {feedback.user_email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="truncate">{feedback.user_email}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">
                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="sm:hidden">
                            {new Date(feedback.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap break-words">{feedback.feedback_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
