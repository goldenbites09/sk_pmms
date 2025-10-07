"use client"
import { useEffect, useState, useCallback, use, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  MapPin,
  Plus,
  Trash2,
  Users,
  Check,
  ChevronsUpDown,
  Pencil,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  MapPinIcon,
  Phone,
  User,
  Search,
  X,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  getProgram,
  getParticipantsByProgram,
  getExpensesByProgram,
  deleteProgram,
  deleteParticipant,
  deleteExpense,
  getParticipants,
  getRegistrationsByProgram,
  addProgramParticipant,
} from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface PageParams {
  id: string
}

export default function ProgramDetailPage({ params }: { params: Promise<PageParams> }) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const resolvedParams = use(params)

  useEffect(() => {
    document.body.classList.add("no-scroll")
    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [])

  const [isLoading, setIsLoading] = useState(true)
  const [program, setProgram] = useState<any>(null)
  const [participants, setParticipants] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false)
  const [allParticipants, setAllParticipants] = useState<any[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([])
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)

  // Pagination and Search States
  const [currentParticipantPage, setCurrentParticipantPage] = useState(1)
  const [currentExpensePage, setCurrentExpensePage] = useState(1)
  const [participantSearchQuery, setParticipantSearchQuery] = useState("")
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("")

  const participantsPerPage = 3
  const expensesPerPage = 4

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const programId = Number.parseInt(resolvedParams.id, 10)
      if (isNaN(programId)) {
        throw new Error("Invalid program ID")
      }

      console.log("Fetching program with ID:", programId)
      // Get program details first to check if program exists
      const programData = await getProgram(programId)
      if (!programData) {
        throw new Error("Program not found")
      }

      // After confirming program exists, get other data
      const [participantsData, expensesData, registrationsData] = await Promise.all([
        getParticipantsByProgram(programId).catch((error) => {
          console.error("Error fetching participants:", error)
          return []
        }),
        getExpensesByProgram(programId).catch((error) => {
          console.error("Error fetching expenses:", error)
          return []
        }),
        getRegistrationsByProgram(programId).catch((error) => {
          console.error("Error fetching registrations:", error)
          return []
        }),
      ])

      console.log("Fetched program data:", programData)
      console.log("Fetched participants data:", participantsData)
      console.log("Fetched registrations data:", registrationsData)

      setProgram(programData)
      setParticipants(Array.isArray(participantsData) ? participantsData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setRegistrations(Array.isArray(registrationsData) ? registrationsData : [])
    } catch (error: any) {
      console.error("Error fetching program data:", error)
      toast({
        title: "Error Loading Program",
        description: error.message || "Failed to load program details. Please try again.",
        variant: "destructive",
      })
      router.push("/programs")
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id, toast])

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!isLoggedIn) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Set admin status for conditional rendering
    setIsAdmin(userRole === "admin" || userRole === "skofficial")

    // Fetch program data
    fetchData()
  }, [fetchData, router, toast])

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!participantSearchQuery.trim()) return participants

    const query = participantSearchQuery.toLowerCase()
    return participants.filter((participant) => {
      const fullName = `${participant.first_name} ${participant.last_name}`.toLowerCase()
      const email = participant.email?.toLowerCase() || ""
      const contact = participant.contact?.toLowerCase() || ""
      const address = participant.address?.toLowerCase() || ""

      return fullName.includes(query) || email.includes(query) || contact.includes(query) || address.includes(query)
    })
  }, [participants, participantSearchQuery])

  // Filter expenses based on search query
  const filteredExpenses = useMemo(() => {
    if (!expenseSearchQuery.trim()) return expenses

    const query = expenseSearchQuery.toLowerCase()
    return expenses.filter((expense) => {
      const description = expense.description?.toLowerCase() || ""
      const category = expense.category?.toLowerCase() || ""
      const notes = expense.notes?.toLowerCase() || ""

      return description.includes(query) || category.includes(query) || notes.includes(query)
    })
  }, [expenses, expenseSearchQuery])

  // Pagination calculations for participants
  const totalParticipantPages = Math.ceil(filteredParticipants.length / participantsPerPage)
  const participantStartIndex = (currentParticipantPage - 1) * participantsPerPage
  const participantEndIndex = participantStartIndex + participantsPerPage
  const currentParticipants = filteredParticipants.slice(participantStartIndex, participantEndIndex)

  // Pagination calculations for expenses
  const totalExpensePages = Math.ceil(filteredExpenses.length / expensesPerPage)
  const expenseStartIndex = (currentExpensePage - 1) * expensesPerPage
  const expenseEndIndex = expenseStartIndex + expensesPerPage
  const currentExpenses = filteredExpenses.slice(expenseStartIndex, expenseEndIndex)

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentParticipantPage(1)
  }, [participantSearchQuery])

  useEffect(() => {
    setCurrentExpensePage(1)
  }, [expenseSearchQuery])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program?")) return

    try {
      await deleteProgram(Number.parseInt(resolvedParams.id))
      toast({
        title: "Success",
        description: "Program deleted successfully",
      })
      router.refresh()
      router.push("/programs")
    } catch (error) {
      console.error("Error deleting program:", error)
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      })
    }
  }

  const handleParticipantDelete = async (participantId: number) => {
    if (!confirm("Are you sure you want to delete this participant?")) return

    try {
      await deleteParticipant(participantId)
      // Update participants list immediately
      setParticipants(participants.filter((p) => p.id !== participantId))
      toast({
        title: "Success",
        description: "Participant deleted successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting participant:", error)
      toast({
        title: "Error",
        description: "Failed to delete participant",
        variant: "destructive",
      })
    }
  }

  const handleExpenseDelete = async (expenseId: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await deleteExpense(expenseId)
      // Update expenses list immediately
      setExpenses(expenses.filter((e) => e.id !== expenseId))
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    }
  }

  const openAddParticipantsModal = async () => {
    try {
      const all = await getParticipants()
      const registeredIds = participants.map((p) => p.id)
      const unregisteredParticipants = all.filter((p) => !registeredIds.includes(p.id))
      setAllParticipants(unregisteredParticipants)
      setSelectedToAdd([])
      setShowAddParticipantsModal(true)
    } catch (error) {
      console.error("Error fetching participants:", error)
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      })
    }
  }

  const handleAddParticipants = async () => {
    try {
      await Promise.all(
        selectedToAdd.map(async (participantId) => {
          const result = await addProgramParticipant({
            program_id: Number.parseInt(resolvedParams.id),
            participant_id: participantId,
          })
          if (!result) {
            throw new Error("Failed to add participant to program")
          }
        }),
      )

      toast({
        title: "Success",
        description: "Participants added successfully",
      })
      setShowAddParticipantsModal(false)
      // Refresh both participants and registrations data
      const programId = Number.parseInt(resolvedParams.id)
      const [updatedParticipants, updatedRegistrations] = await Promise.all([
        getParticipantsByProgram(programId),
        getRegistrationsByProgram(programId),
      ])
      setParticipants(updatedParticipants)
      setRegistrations(updatedRegistrations)
      setSelectedToAdd([])
    } catch (error: any) {
      console.error("Error adding participants:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add participants",
        variant: "destructive",
      })
    }
  }

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsExpenseModalOpen(true)
  }

  const handleStatusUpdate = async (participant_id: number, newStatus: string) => {
    try {
      const programId = Number.parseInt(resolvedParams.id, 10)
      if (isNaN(programId)) {
        throw new Error("Invalid program ID")
      }

      console.log("Updating status for:", { programId, participant_id, newStatus })

      // Store the original status for rollback if needed
      const originalParticipant = participants.find((p) => p.id === participant_id)
      const originalStatus = originalParticipant?.registration_status || "Pending"

      // Update the participant in the UI immediately for better UX
      setParticipants((prev) =>
        prev.map((p) => (p.id === participant_id ? { ...p, registration_status: newStatus } : p)),
      )

      try {
        // Direct Supabase call instead of going through the API
        // First check if a registration record exists
        const { data: existingReg, error: checkError } = await supabase
          .from("registrations")
          .select("*")
          .eq("program_id", programId)
          .eq("participant_id", participant_id)
          .maybeSingle()

        if (checkError) {
          console.error("Error checking registration:", checkError)
          throw new Error(checkError.message || "Failed to check registration status")
        }

        let updateResult
        if (existingReg) {
          // Update existing registration
          updateResult = await supabase
            .from("registrations")
            .update({ registration_status: newStatus })
            .eq("program_id", programId)
            .eq("participant_id", participant_id)
        } else {
          // Create new registration with the specified status
          updateResult = await supabase.from("registrations").insert({
            program_id: programId,
            participant_id: participant_id,
            registration_status: newStatus,
            registration_date: new Date().toISOString(),
          })
        }

        if (updateResult.error) {
          throw new Error(updateResult.error.message || "Failed to update registration status")
        }

        console.log("Status update successful:", updateResult)
        toast({
          title: "Status Updated",
          description: `Status changed to ${newStatus}`,
        })
      } catch (apiError: any) {
        console.error("Database update failed:", apiError)
        // Revert the UI change since the update failed
        setParticipants((prev) =>
          prev.map((p) => (p.id === participant_id ? { ...p, registration_status: originalStatus } : p)),
        )
        throw apiError // Rethrow to be caught by the outer catch
      }

      // Manual update to registrations array to keep it in sync
      setRegistrations((prev) => {
        // Check if registration exists in the array
        const regExists = prev.some((reg) => reg.participant_id === participant_id)
        if (regExists) {
          // Update existing registration
          return prev.map((reg) =>
            reg.participant_id === participant_id ? { ...reg, registration_status: newStatus } : reg,
          )
        } else {
          // Add new registration entry
          return [
            ...prev,
            {
              program_id: programId,
              participant_id: participant_id,
              registration_status: newStatus,
              registration_date: new Date().toISOString(),
            },
          ]
        }
      })
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update registration status",
        variant: "destructive",
      })
      // Full refresh only if something went very wrong
      fetchData()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Waitlisted":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4" />
      case "Rejected":
        return <XCircle className="w-4 h-4" />
      case "Waitlisted":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const clearParticipantSearch = () => {
    setParticipantSearchQuery("")
  }

  const clearExpenseSearch = () => {
    setExpenseSearchQuery("")
  }

  const ParticipantDetailsModal = ({ participant }: { participant: any }) => {
    if (!participant) return null

    return (
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-primary/10">
                {participant.first_name?.[0]}
                {participant.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {participant.first_name} {participant.last_name}
              </DialogTitle>
              <p className="text-muted-foreground">Participant Details</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Age:</span>
                <span>{participant.age} years old</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Contact:</span>
                <span>{participant.contact}</span>
              </div>
            </div>
            <div className="space-y-2">
              {participant.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span className="truncate">{participant.email}</span>
                </div>
              )}
            </div>
          </div>

          {participant.address && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPinIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Address:</span>
                  <p className="text-muted-foreground mt-1">{participant.address}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Current Program Registration */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Current Program Registration</h3>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  variant={
                    participant.registration_status === "Approved"
                      ? "default"
                      : participant.registration_status === "Pending"
                        ? "secondary"
                        : participant.registration_status === "Rejected"
                          ? "destructive"
                          : "outline"
                  }
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(participant.registration_status)}
                  {participant.registration_status || "Pending"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Registered on: {format(new Date(participant.registration_date), "PPP")}</span>
              </div>
            </div>
          </div>

          {/* All Programs */}
          {participant.programs && participant.programs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">All Programs Joined</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {participant.programs.map((prog: any) => (
                  <div key={prog.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Link href={`/programs/${prog.id}`}>
                        <h4 className="font-medium hover:underline text-primary">{prog.name}</h4>
                      </Link>
                      <Badge
                        variant={
                          prog.registration_status === "Approved"
                            ? "default"
                            : prog.registration_status === "Pending"
                              ? "secondary"
                              : prog.registration_status === "Rejected"
                                ? "destructive"
                                : "outline"
                        }
                        className="flex items-center gap-1"
                      >
                        {getStatusIcon(prog.registration_status)}
                        {prog.registration_status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{prog.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{prog.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Registered: {format(new Date(prog.registration_date), "PPP")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Program...</p>
        </div>
      </div>
    )
  }
  if (!program) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <DashboardHeader />
        <div className="flex flex-1 pt-[57px]">
          <DashboardSidebar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="mt-4 text-lg font-semibold text-gray-700">Program Not Found</p>
                <p className="text-sm text-gray-500">The program you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => router.push('/programs')} className="mt-4">Go to Programs</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = program.budget - totalExpenses

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b">
        <DashboardHeader />
      </div>
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen md:ml-64">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">{program.name}</h1>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Link href={`/programs/${resolvedParams.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Program
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Program
                  </Button>
                </>
              )}
              {program.file_urls && program.file_urls.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => window.open(program.file_urls, "_blank")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{program.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{program.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{participants.length} Participants</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budget:</span>
                  <span className="font-medium">₱{program.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Expenses:</span>
                  <span className="font-medium">₱{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Budget:</span>
                  <span className={`font-medium ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
                    ₱{remainingBudget.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Program Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      program.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-800"
                        : program.status.toLowerCase() === "planning"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {program.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(program.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{new Date(program.updated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
            {/* Participants Section */}
            <Card className="xl:col-span-1">
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Participants
                    <Badge variant="secondary" className="ml-2">
                      {filteredParticipants.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Manage program participants and their registration status</CardDescription>
                </div>

                {/* Search Bar for Participants */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search participants by name, email, contact..."
                    value={participantSearchQuery}
                    onChange={(e) => setParticipantSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {participantSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearParticipantSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/participants/new?program=${resolvedParams.id}`}>
                      <Button size="sm" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Participant
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openAddParticipantsModal}
                      className="w-full sm:w-auto bg-transparent"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Add Existing Participants
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredParticipants.length > 0 ? (
                  <>
                    {/* Search Results Info */}
                    {participantSearchQuery && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        Found {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? "s" : ""}{" "}
                        matching "{participantSearchQuery}"
                      </div>
                    )}

                    {/* Participants Grid */}
                    <div className="space-y-4">
                      {currentParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                        >
                          {/* Participant Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarFallback className="text-sm font-medium bg-primary/10">
                                  {participant.first_name?.[0]}
                                  {participant.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto font-semibold text-base text-left justify-start"
                                    >
                                      <span className="truncate">
                                        {participant.first_name} {participant.last_name}
                                      </span>
                                    </Button>
                                  </DialogTrigger>
                                  <ParticipantDetailsModal participant={participant} />
                                </Dialog>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <span>{participant.age} years</span>
                                  <span>•</span>
                                  <span>{participant.contact}</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                participant.registration_status === "Approved"
                                  ? "default"
                                  : participant.registration_status === "Pending"
                                    ? "secondary"
                                    : participant.registration_status === "Rejected"
                                      ? "destructive"
                                      : "outline"
                              }
                              className="flex items-center gap-1 flex-shrink-0"
                            >
                              {getStatusIcon(participant.registration_status)}
                              {participant.registration_status || "Pending"}
                            </Badge>
                          </div>

                          {/* Participant Details */}
                          <div className="space-y-2 mb-4">
                            {participant.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="truncate">{participant.email}</span>
                              </div>
                            )}
                            {participant.address && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPinIcon className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">Address:</span>
                                <span className="line-clamp-2 text-sm">{participant.address}</span>
                              </div>
                            )}
                          </div>

                          {/* Admin Controls */}
                          {isAdmin && (
                            <div className="pt-3 border-t space-y-3">
                              <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                                    Update Status:
                                  </label>
                                  <Select
                                    value={participant.registration_status || "Pending"}
                                    onValueChange={(newStatus: string) => handleStatusUpdate(participant.id, newStatus)}
                                    disabled={updatingId === participant.id}
                                  >
                                    <SelectTrigger className="w-full h-9">
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
                                  {updatingId === participant.id && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                      Updating status...
                                    </div>
                                  )}
                                </div>
                                <div className="flex sm:flex-col gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleParticipantDelete(participant.id)}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Pagination for Participants */}
                    {totalParticipantPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {participantStartIndex + 1} to{" "}
                          {Math.min(participantEndIndex, filteredParticipants.length)} of {filteredParticipants.length}{" "}
                          participant{filteredParticipants.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentParticipantPage(1)}
                            disabled={currentParticipantPage === 1}
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentParticipantPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentParticipantPage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const pages = []
                              const totalPages = totalParticipantPages
                              const current = currentParticipantPage

                              let startPage = Math.max(1, current - 2)
                              const endPage = Math.min(totalPages, startPage + 4)

                              if (endPage - startPage < 4) {
                                startPage = Math.max(1, endPage - 4)
                              }

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <Button
                                    key={`participant-page-${i}`}
                                    variant={current === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentParticipantPage(i)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {i}
                                  </Button>,
                                )
                              }

                              return pages
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentParticipantPage((prev) => Math.min(prev + 1, totalParticipantPages))
                            }
                            disabled={currentParticipantPage === totalParticipantPages}
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentParticipantPage(totalParticipantPages)}
                            disabled={currentParticipantPage === totalParticipantPages}
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    {participantSearchQuery ? (
                      <>
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No participants found</h3>
                        <p className="text-muted-foreground mb-4">
                          No participants match your search for "{participantSearchQuery}"
                        </p>
                        <Button variant="outline" onClick={clearParticipantSearch}>
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No participants yet</h3>
                        <p className="text-muted-foreground mb-4">Start by adding participants to this program</p>
                        {isAdmin && (
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Link href={`/participants/new?program=${resolvedParams.id}`}>
                              <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Participant
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={openAddParticipantsModal}>
                              <Users className="mr-2 h-4 w-4" />
                              Add Existing Participants
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expenses Section */}
            <Card className="xl:col-span-1">
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Expenses
                    <Badge variant="secondary" className="ml-2">
                      {filteredExpenses.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Program expenses and transactions</CardDescription>
                </div>

                {/* Search Bar for Expenses */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search expenses by description, category..."
                    value={expenseSearchQuery}
                    onChange={(e) => setExpenseSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {expenseSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearExpenseSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {isAdmin && (
                  <Link href={`/expenses/new?program=${resolvedParams.id}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredExpenses.length > 0 ? (
                  <>
                    {/* Search Results Info */}
                    {expenseSearchQuery && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        Found {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""} matching "
                        {expenseSearchQuery}"
                      </div>
                    )}

                    {/* Expenses List */}
                    <div className="space-y-4">
                      {currentExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium">{expense.description}</h3>
                            <p className="text-sm text-muted-foreground">
                              {expense.category} • {expense.date}
                            </p>
                            <p className="text-sm font-medium mt-1">₱{expense.amount.toLocaleString()}</p>
                            {expense.notes && <p className="text-sm text-muted-foreground mt-1">{expense.notes}</p>}
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                size="icon"
                                variant="outline"
                                title="View"
                                onClick={() => handleViewExpense(expense)}
                              >
                                <span className="sr-only">View</span>
                                <svg
                                  width="18"
                                  height="18"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z" />
                                </svg>
                              </Button>
                              <Link href={`/expenses/${expense.id}/edit`}>
                                <Button size="icon" variant="outline" title="Edit">
                                  <span className="sr-only">Edit</span>
                                  <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M15.232 5.232a3 3 0 0 1 4.243 4.243L7.5 21H3v-4.5l12.232-12.268Z" />
                                  </svg>
                                </Button>
                              </Link>
                              <Button
                                size="icon"
                                variant="destructive"
                                title="Delete"
                                onClick={() => handleExpenseDelete(expense.id)}
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  width="18"
                                  height="18"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                </svg>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Pagination for Expenses */}
                    {totalExpensePages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {expenseStartIndex + 1} to {Math.min(expenseEndIndex, filteredExpenses.length)} of{" "}
                          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExpensePage(1)}
                            disabled={currentExpensePage === 1}
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExpensePage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentExpensePage === 1}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center gap-1">
                            {(() => {
                              const pages = []
                              const totalPages = totalExpensePages
                              const current = currentExpensePage

                              let startPage = Math.max(1, current - 2)
                              const endPage = Math.min(totalPages, startPage + 4)

                              if (endPage - startPage < 4) {
                                startPage = Math.max(1, endPage - 4)
                              }

                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <Button
                                    key={`expense-page-${i}`}
                                    variant={current === i ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentExpensePage(i)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {i}
                                  </Button>,
                                )
                              }

                              return pages
                            })()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExpensePage((prev) => Math.min(prev + 1, totalExpensePages))}
                            disabled={currentExpensePage === totalExpensePages}
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentExpensePage(totalExpensePages)}
                            disabled={currentExpensePage === totalExpensePages}
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    {expenseSearchQuery ? (
                      <>
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No expenses found</h3>
                        <p className="text-muted-foreground mb-4">
                          No expenses match your search for "{expenseSearchQuery}"
                        </p>
                        <Button variant="outline" onClick={clearExpenseSearch}>
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
                          <svg
                            width="48"
                            height="48"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-lg mb-2">No expenses added yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding expenses to track your program budget
                        </p>
                        {isAdmin && (
                          <Link href={`/expenses/new?program=${resolvedParams.id}`}>
                            <Button size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Add Expense
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modals */}
          {showAddParticipantsModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              onClick={() => setShowAddParticipantsModal(false)}
            >
              <div
                className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-4 sm:p-8 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => setShowAddParticipantsModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Add Existing Participants</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between mb-4 bg-transparent">
                      {selectedToAdd.length > 0
                        ? `${selectedToAdd.length} participants selected`
                        : "Select participants..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search participants..." />
                      <CommandList>
                        <CommandEmpty>No participant found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {allParticipants.map((participant) => (
                            <CommandItem
                              key={participant.id}
                              onSelect={() => {
                                setSelectedToAdd((prev) =>
                                  prev.includes(participant.id)
                                    ? prev.filter((id) => id !== participant.id)
                                    : [...prev, participant.id],
                                )
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedToAdd.includes(participant.id) ? "opacity-100" : "opacity-0",
                                )}
                              />
                              {`${participant.first_name} ${participant.last_name}`} ({participant.age} yrs,{" "}
                              {participant.contact})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddParticipantsModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddParticipants} disabled={selectedToAdd.length === 0}>
                    Add Selected
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for expense details */}
          {isExpenseModalOpen && selectedExpense && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              <div
                className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 p-4 sm:p-10 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={() => setIsExpenseModalOpen(false)}
                >
                  &times;
                </button>
                <h2 className="text-3xl font-bold mb-4">{selectedExpense.description}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">₱{selectedExpense.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-lg">{selectedExpense.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg capitalize">{selectedExpense.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="text-lg">{program.name}</p>
                    </div>
                  </div>
                  {selectedExpense.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-lg">{selectedExpense.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
