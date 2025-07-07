"use client"

import { useEffect, useState, useCallback, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Plus, Trash2, Users, Check, ChevronsUpDown, Pencil } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

interface PageParams {
  id: string
}

export default function ProgramDetailPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params)

  useEffect(() => {
    document.body.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);
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
  const [currentPage, setCurrentPage] = useState(1)
  const participantsPerPage = 7

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

  const ParticipantDetailsModal = ({ participant }: { participant: any }) => {
    if (!participant) return null

    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{participant.last_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm">
            <p>
              Age: {participant.age} | Contact: {participant.contact}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm text-muted-foreground">{participant.email || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Address:</p>
            <p className="text-sm text-muted-foreground">{participant.address || "-"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Current Program Registration:</p>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                Status:
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
                  className="ml-2"
                >
                  {participant.registration_status}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Registered on: {format(new Date(participant.registration_date), "PPP")}
              </p>
            </div>
          </div>
          {participant.programs && participant.programs.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">All Programs Joined:</p>
              <div className="space-y-2">
                {participant.programs.map((prog: any) => (
                  <div key={prog.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <Link href={`/programs/${prog.id}`}>
                        <p className="text-sm font-medium hover:underline">{prog.name}</p>
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
                      >
                        {prog.registration_status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{prog.date}</span>
                      <MapPin className="h-3 w-3 ml-2" />
                      <span>{prog.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
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
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Program not found</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = program.budget - totalExpenses

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">{program.name}</h1>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <>
                  <Link href={`/programs/${resolvedParams.id}/edit`}>
                    <Button variant="outline">Edit Program</Button>
                  </Link>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Program
                  </Button>
                </>
              )}
              {program.file_urls && program.file_urls.length > 0 && (
                <Button variant="outline" onClick={() => window.open(program.file_urls, "_blank")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{program.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{program.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{participants.length} Participants</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="font-medium">₱{program.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Expenses:</span>
                    <span className="font-medium">₱{totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Budget:</span>
                    <span className={`font-medium ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
                      ₱{remainingBudget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(program.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{new Date(program.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle>Participants</CardTitle>
                  <CardDescription>List of program participants</CardDescription>
                </div>
                {isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/participants/new?program=${resolvedParams.id}`}>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Participant
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={openAddParticipantsModal}>
                      Add Existing Participants
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {participants
                        .slice((currentPage - 1) * participantsPerPage, currentPage * participantsPerPage)
                        .map((participant) => (
                          <div key={participant.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="link" className="p-0 h-auto font-semibold text-base">
                                      {participant.last_name}
                                    </Button>
                                  </DialogTrigger>
                                  <ParticipantDetailsModal participant={participant} />
                                </Dialog>
                                <p className="text-sm text-muted-foreground">
                                  Age: {participant.age} • Contact: {participant.contact}
                                </p>
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
                                className="ml-2"
                              >
                                {participant.registration_status || "Pending"}
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-3">
                              {participant.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Email:</span>
                                  <span className="truncate">{participant.email}</span>
                                </div>
                              )}
                              {participant.address && (
                                <div className="flex items-start gap-2 text-sm">
                                  <span className="text-muted-foreground flex-shrink-0">Address:</span>
                                  <span className="line-clamp-2">{participant.address}</span>
                                </div>
                              )}
                            </div>

                            {isAdmin && (
                              <div className="flex justify-end gap-2 pt-2 border-t">
                                <Link href={`/participants/${participant.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Pencil className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                </Link>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleParticipantDelete(participant.id)}
                                >
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {participants.length > participantsPerPage && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing {(currentPage - 1) * participantsPerPage + 1} to{" "}
                          {Math.min(currentPage * participantsPerPage, participants.length)} of {participants.length}{" "}
                          participants
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, Math.ceil(participants.length / participantsPerPage)),
                              )
                            }
                            disabled={currentPage === Math.ceil(participants.length / participantsPerPage)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No participants found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-4">
                <div>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>Program expenses and transactions</CardDescription>
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
              <CardContent>
                <div className="space-y-4">
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50"
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
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No expenses added yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <Button variant="outline" role="combobox" className="w-full justify-between mb-4">
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
