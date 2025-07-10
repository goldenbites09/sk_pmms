"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Search, LogOut, User, Plus } from "lucide-react"
import { getPrograms, getParticipants, getExpenses, joinProgram, getParticipantByUserId, updateParticipant } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

export default function UserViewPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("programs")
  const [joiningProgram, setJoiningProgram] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  // Track registration status for each program
  const [registrationStatuses, setRegistrationStatuses] = useState<Record<number, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Fetch registration statuses for the current user
  const fetchRegistrationStatuses = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      // First get the participant ID for the current user
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (participantError || !participant) {
        console.error('Error fetching participant:', participantError);
        return;
      }

      // Get all registrations for this participant
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select('program_id, registration_status')
        .eq('participant_id', participant.id);

      if (registrationsError) {
        console.error('Error fetching registrations:', registrationsError);
        return;
      }

      // Build a map of program ID to registration status
      const statusMap: Record<number, string> = {};
      if (registrations && Array.isArray(registrations)) {
        registrations.forEach(reg => {
          if (reg.program_id && reg.registration_status) {
            statusMap[reg.program_id] = reg.registration_status;
          }
        });
      }

      console.log('Registration statuses:', statusMap);
      setRegistrationStatuses(statusMap);
    } catch (error) {
      console.error('Error in fetchRegistrationStatuses:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    const userId = localStorage.getItem("userId")

    if (!isLoggedIn || !userId) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Check if user is a viewer
    if (userRole !== "viewer") {
      router.push("/dashboard")
      return
    }

    // Set active tab from URL parameter
    const tab = searchParams.get("tab")
    if (tab && ["programs", "participants", "expenses"].includes(tab)) {
      setActiveTab(tab)
    }

    // Fetch data
    const fetchData = async () => {
      try {
        const [programsData, participantsData, expensesData] = await Promise.all([
          getPrograms(),
          getParticipants(),
          getExpenses()
        ])

        setPrograms(programsData)
        setParticipants(participantsData)
        setExpenses(expensesData)
        
        // Fetch registration statuses after we have the programs data
        await fetchRegistrationStatuses();
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, toast, searchParams])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/user-view?tab=${value}`)
  }

  // Handle joining a program
  const handleJoinProgram = async (programId: number) => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to join a program",
        variant: "destructive",
      })
      return
    }

    setJoiningProgram(programId)
    try {
      // First check if the user already has a participant profile
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        toast({
          title: "Profile Required",
          description: "Please complete your participant profile before joining programs",
          variant: "destructive",
        });
        router.push('/user-view/profile');
        setJoiningProgram(null);
        return;
      }

      // Check if already a participant in this program (program_participants table)
      const { data: existingParticipant } = await supabase
        .from('program_participants')
        .select('*')
        .eq('program_id', programId)
        .eq('participant_id', participant.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

      // Also check if there is an existing registration record
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('*')
        .eq('program_id', programId)
        .eq('participant_id', participant.id)
        .maybeSingle();

      if (existingParticipant || existingRegistration) {
        toast({
          title: "Already Applied",
          description: existingRegistration ? 
            `You have already applied to this program (Status: ${existingRegistration.registration_status})` : 
            "You are already a participant in this program",
          variant: "default",
        });
        setJoiningProgram(null);
        return;
      }

      // Transaction to add both program_participant and registration record
      // First, add to program_participants table
      const { error: joinError } = await supabase
        .from('program_participants')
        .insert({
          program_id: programId,
          participant_id: participant.id,
        });

      if (joinError) {
        console.error('Error adding to program_participants:', joinError);
        toast({
          title: "Error",
          description: joinError.message || "Failed to join the program.",
          variant: "destructive",
        });
        setJoiningProgram(null);
        return;
      }

      // Then, add to registrations table with "Pending" status
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          program_id: programId,
          participant_id: participant.id,
          registration_status: 'Pending',
          registration_date: new Date().toISOString()
        });

      if (registrationError) {
        console.error('Error adding to registrations:', registrationError);
        // Try to rollback the program_participants insert
        await supabase
          .from('program_participants')
          .delete()
          .eq('program_id', programId)
          .eq('participant_id', participant.id);

        toast({
          title: "Error",
          description: registrationError.message || "Failed to register for the program.",
          variant: "destructive",
        });
        setJoiningProgram(null);
        return;
      }

      toast({
        title: "Success",
        description: "You have successfully applied to the program. Your status is pending approval.",
      });

      // Refresh the data to get the updated state
      const [programsData, participantsData] = await Promise.all([
        getPrograms(),
        getParticipants(),
      ]);
      setPrograms(programsData);
      setParticipants(participantsData);
      
      // Force refresh to ensure UI reflects latest registration status
      fetchRegistrationStatuses();
    } catch (error) {
      console.error('Join program error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join the program.",
        variant: "destructive",
      });
    } finally {
      setJoiningProgram(null);
    }
  };

  // Get unique years from programs
  const programYears = [...new Set(programs.map(program => 
    new Date(program.date).getFullYear()
  ))].sort((a, b) => b - a)
  
  // Get unique statuses from programs and ensure proper capitalization
  const VALID_STATUSES = ["Planning", "Active", "Completed"];
  
  // Filter programs based on search term, year and status
  const filteredPrograms = programs.filter((program) => {
    const programYear = new Date(program.date).getFullYear().toString()
    const matchesYear = selectedYear === "all" || programYear === selectedYear
    const matchesStatus = selectedStatus === "all" || program.status === selectedStatus
    
    const searchTermLower = searchTerm.toLowerCase()
    const matchesSearch = 
      program.name.toLowerCase().includes(searchTermLower) ||
      program.location.toLowerCase().includes(searchTermLower) ||
      program.date.toLowerCase().includes(searchTermLower) ||
      program.time.toLowerCase().includes(searchTermLower) ||
      program.budget.toString().includes(searchTermLower) ||
      program.status.toLowerCase().includes(searchTermLower)

    return matchesYear && matchesStatus && matchesSearch
  })

  // Filter participants based on search term
  const filteredParticipants = participants.filter((participant) => {
    const fullName = `${participant.first_name} ${participant.last_name}`.toLowerCase()
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      participant.age?.toString().includes(searchTerm) ||
      participant.contact?.includes(searchTerm) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Calculate total budget
  const totalBudget = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Add a handler for program checkbox changes
  const handleProgramCheckboxChange = (programId: number) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    )
  }

  // Add a handler for saving program participation
  const handleSavePrograms = async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to update your programs",
        variant: "destructive",
      })
      return
    }
    try {
      const participant = await getParticipantByUserId(userId)
      if (!participant) {
        toast({
          title: "Error",
          description: "Participant profile not found.",
          variant: "destructive",
        })
        return
      }
      await updateParticipant(participant.id, {
        ...participant,
        program_ids: selectedPrograms
      })
      toast({
        title: "Success",
        description: "Your program participation has been updated.",
      })
      // Refresh data
      const [programsData, participantsData] = await Promise.all([
        getPrograms(),
        getParticipants(),
      ])
      setPrograms(programsData)
      setParticipants(participantsData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update programs.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1">
          <DashboardSidebar />
          <main className="flex-1 p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const userId = localStorage.getItem("userId")

  // Get the current user's participant record
  const participant = participants.find(
    (p) => String(p.user_id) === String(userId)
  );

  return (
    <div className="flex min-h-screen flex-col">
    <DashboardHeader />
    <div className="flex flex-1">
      <DashboardSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="programs" className="space-y-4">
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                  <CardTitle>SK Programs</CardTitle>
                  <CardDescription>View all programs organized by the SK</CardDescription>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex justify-end mb-2">
                          <div className="bg-muted/50 rounded-md px-4 py-2 font-bold">
                            Total Amount: ₱{totalBudget.toLocaleString()}
                          </div>
                        </div>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="w-[120px] bg-white">
                            <SelectValue placeholder="Filter by Year" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            <SelectItem value="all">All Years</SelectItem>
                            {programYears.map((year) => (
                              <SelectItem 
                                key={year} 
                                value={year.toString()}
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-[140px] bg-white">
                            <SelectValue placeholder="Filter by Status" />
                          </SelectTrigger>
                          <SelectContent className="z-[100]">
                            <SelectItem value="all">All Status</SelectItem>
                            {VALID_STATUSES.map((status) => (
                              <SelectItem 
                                key={status} 
                                value={status}
                              >
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 bg-muted/50 p-3 text-sm font-medium">
                      <div>Program Name</div>
                      <div>Date</div>
                      <div>Location</div>
                      <div>Budget</div>
                      <div>Status</div>
                      <div className="text-center">Action</div>
                    </div>
                    {filteredPrograms.map((program: any) => {
                      const isParticipant = participant && participant.program_ids && participant.program_ids.includes(program.id);
                      return (
                      <div
                        key={program.id}
                          className="grid grid-cols-6 items-center p-3 text-sm border-t hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium">{program.name}</div>
                        <div>{program.date}</div>
                        <div>{program.location}</div>
                          <div>₱{program.budget.toLocaleString()}</div>
                        <div
                          className={`inline-block text-sm rounded-full px-2 py-1 font-medium ${
                            program.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : program.status === "Planning"
                                ? "bg-yellow-100 text-yellow-800"
                                  : program.status === "Completed"
                                    ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {program.status}
                        </div>
                          <div className="flex justify-center">
                            {/* Check if this program has a registration status */}
                            {registrationStatuses[program.id] ? (
                              <Button 
                                variant={registrationStatuses[program.id] === "Pending" ? "outline" : "default"}
                                disabled={true} 
                                className={`w-32 ${registrationStatuses[program.id] === "Accepted" ? "bg-green-600 hover:bg-green-700" : ""}`}
                              >
                                {registrationStatuses[program.id]}
                              </Button>
                            ) : isParticipant ? (
                              <Button variant="outline" disabled className="w-32">
                                Joined
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleJoinProgram(program.id)}
                                disabled={joiningProgram === program.id}
                                className="w-32"
                              >
                                {joiningProgram === program.id ? (
                                  "Applying..."
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Join
                                  </>
                                )}
                              </Button>
                            )}
                        </div>
                      </div>
                      )
                    })}
                    {filteredPrograms.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">No programs found matching your criteria</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Program Participants</CardTitle>
                  <CardDescription>View all participants in SK programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
                      <div>Name</div>
                      <div>Age</div>
                      <div>Contact</div>
                      <div>Program</div>
                    </div>
                    {filteredParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="grid grid-cols-4 items-center p-3 text-sm border-t hover:bg-muted/50 transition-colors"
                      >
                          <div className="font-medium">{participant.first_name} {participant.last_name}</div>
                        <div>{participant.age}</div>
                        <div>{participant.contact}</div>
                        <div>
                          {programs.find((p) => p.id === participant.program_id)?.name || "Unknown Program"}
                        </div>
                      </div>
                    ))}
                    {filteredParticipants.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">
                        No participants found matching your search
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SK Expenses</CardTitle>
                  <CardDescription>View all expenses recorded by the SK</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 bg-muted/50 p-3 text-sm font-medium">
                      <div>Description</div>
                      <div>Program</div>
                      <div>Date</div>
                      <div className="text-right">Amount</div>
                    </div>
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="grid grid-cols-4 items-center p-3 text-sm border-t hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium">{expense.description}</div>
                        <div>{programs.find((p) => p.id === expense.program_id)?.name || "Unknown Program"}</div>
                        <div>{expense.date}</div>
                        <div className="text-right">₱{expense.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    <div className="grid grid-cols-4 items-center p-3 text-sm border-t bg-muted/50 font-bold">
                      <div className="col-span-3 text-right">Total:</div>
                      <div className="text-right">₱{totalBudget.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>
    </div>
  )
}
