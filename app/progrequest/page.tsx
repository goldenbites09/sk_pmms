"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { Search, CheckCircle, XCircle, Calendar, Filter, Users, Clock } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"

// Helper to get badge by status
function getStatusBadge(status: string) {
  const statusConfig = {
    Approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    Waitlisted: { color: "bg-blue-100 text-blue-800", icon: Calendar },
    Rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  )
}

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

interface Program {
  id: number;
  name: string;
}

interface RegistrationRequest {
  id: number;
  registration_status: string;
  registration_date: string;
  participant_id: number;
  program_id: number;
  participants: Participant | null;
  programs: Program | null;
}

export default function AdminRequestsPage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [programFilter, setProgramFilter] = useState("all")
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("userRole")
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (userRole !== "admin" && userRole !== "skofficial") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    fetchRequests()
    fetchPrograms()
  }, [router, toast])

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          id, 
          registration_status,
          registration_date,
          participant_id,
          program_id,
          participants:participants(*),
          programs:programs(*)
        `)
        .order("registration_date", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load requests",
          variant: "destructive",
        })
        return
      }

      const transformedData = data?.map(req => ({...req, participants: Array.isArray(req.participants) ? req.participants[0] : req.participants, programs: Array.isArray(req.programs) ? req.programs[0] : req.programs,})) || [];
      setRequests(transformedData);
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast({
        title: "Error",
        description: "Failed to load requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchPrograms() {
    try {
      const { data, error } = await supabase.from("programs").select("id, name")
      if (!error && data) {
        setPrograms(data)
      }
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  async function handleStatusChange(request: RegistrationRequest, newStatus: string) {
    setUpdatingId(request.id)
    try {
      const { data: existing, error: fetchError } = await supabase
        .from("registrations")
        .select("*")
        .eq("program_id", request.program_id)
        .eq("participant_id", request.participant_id)

      if (!existing || existing.length === 0) {
        toast({
          title: "Error",
          description: "No registration row found for this participant and program. Cannot update status.",
          variant: "destructive",
        })
        setUpdatingId(null)
        return
      }

      const { error } = await supabase
        .from("registrations")
        .update({ registration_status: newStatus })
        .eq("program_id", request.program_id)
        .eq("participant_id", request.participant_id)

      if (error) {
        console.error("Supabase error updating registration_status:", error)
        toast({
          title: "Error",
          description: error.message || `Failed to update status to ${newStatus}.`,
          variant: "destructive",
        })
        setUpdatingId(null)
        return
      }

      toast({ title: "Success", description: `Status updated to ${newStatus}.` })
      await fetchRequests()
    } catch (err: any) {
      console.error("Exception in handleStatusChange:", err)
      toast({
        title: "Error",
        description: err?.message || "Failed to update status.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredRequests = requests.filter((request: RegistrationRequest) => {
    const matchesSearch =
      request.participants?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.participants?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.participants?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.registration_status.toLowerCase() === statusFilter
    const matchesProgram = programFilter === "all" || request.programs?.name === programFilter
    return matchesSearch && matchesStatus && matchesProgram
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-4 lg:p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-4 lg:p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Program Join Requests</h2>
              <p className="text-sm lg:text-base text-gray-600">
                Review and manage program join requests from participants.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-lg lg:text-2xl font-bold text-gray-900">{requests.length}</div>
                      <div className="text-xs lg:text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <div>
                      <div className="text-lg lg:text-2xl font-bold text-yellow-600">
                        {requests.filter((r) => r.registration_status === "Pending").length}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-lg lg:text-2xl font-bold text-green-600">
                        {requests.filter((r) => r.registration_status === "Approved").length}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">Approved</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <div>
                      <div className="text-lg lg:text-2xl font-bold text-red-600">
                        {requests.filter((r) => r.registration_status === "Rejected").length}
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500">Rejected</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:w-auto flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="waitlisted">Waitlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                      <Select value={programFilter} onValueChange={setProgramFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Programs</SelectItem>
                          {programs.map((program: any) => (
                            <SelectItem key={program.id} value={program.name}>
                              {program.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">No requests found.</CardContent>
                </Card>
              ) : (
                filteredRequests.map((request: any) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {request.participants?.first_name} {request.participants?.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{request.participants?.email}</p>
                        </div>
                        {getStatusBadge(request.registration_status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Program:</span>
                          <span className="font-medium text-gray-900 text-right">{request.programs?.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">
                            {request.registration_date
                              ? new Date(request.registration_date).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex flex-col space-y-2">
                          <label className="text-xs font-medium text-gray-700">Update Status:</label>
                          <Select
                            value={request.registration_status || "Pending"}
                            onValueChange={(newStatus) => handleStatusChange(request, newStatus)}
                            disabled={updatingId === request.id}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Approved">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Approved
                                </div>
                              </SelectItem>
                              <SelectItem value="Pending">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-yellow-600" />
                                  Pending
                                </div>
                              </SelectItem>
                              <SelectItem value="Waitlisted">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  Waitlisted
                                </div>
                              </SelectItem>
                              <SelectItem value="Rejected">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  Rejected
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingId === request.id && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                              Updating...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Card>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Program
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No requests found.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request: any) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {request.participants?.first_name} {request.participants?.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{request.participants?.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{request.programs?.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(request.registration_status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.registration_date
                                ? new Date(request.registration_date).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex flex-col items-end gap-2">
                                <Select
                                  value={request.registration_status || "Pending"}
                                  onValueChange={(newStatus) => handleStatusChange(request, newStatus)}
                                  disabled={updatingId === request.id}
                                >
                                  <SelectTrigger className="w-36">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Approved">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Approved
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Pending">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-600" />
                                        Pending
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Waitlisted">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        Waitlisted
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="Rejected">
                                      <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        Rejected
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {updatingId === request.id && (
                                  <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
                                    Updating...
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
