"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Search, MapPin, Plus, Users, Check, ChevronsUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "../hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { getPrograms, getParticipantsByProgram, getProgramParticipants, getParticipants } from "@/lib/db"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProgramsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("all") // Add field-specific search
  const [statusFilter, setStatusFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAddParticipantsModal, setShowAddParticipantsModal] = useState(false)
  const [joiningProgram, setJoiningProgram] = useState<number | null>(null)
  const [showProfileWarning, setShowProfileWarning] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  // Track registration status for each program
  const [registrationStatuses, setRegistrationStatuses] = useState<Record<number, string>>({})

  // Fetch registration statuses for the current user
  const fetchRegistrationStatuses = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated');
        return;
      }

      // First get the participant ID for the current user
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (participantError) {
        console.error('Error fetching participant:', participantError);
        return;
      }

      if (!participant) {
        console.log('No participant found for user');
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

      setRegistrationStatuses(statusMap);
    } catch (error) {
      console.error('Error in fetchRegistrationStatuses:', error);
    }
  };

  useEffect(() => {
    fetchRegistrationStatuses();
  }, [])
  const [allParticipants, setAllParticipants] = useState<any[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([])
  const [selectedProgram, setSelectedProgram] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const programsData = await getPrograms();
      console.log('Fetched Programs:', programsData);

      if (!programsData) {
        throw new Error('No programs data received');
      }
      
      // Get participant counts for each program
      const programsWithParticipants = await Promise.all(
        programsData.map(async (program) => {
          try {
            const participants = await getParticipantsByProgram(program.id);
            return {
              ...program,
              participants: participants ? participants.length : 0,
            };
          } catch (participantError) {
            console.error(`Error fetching participants for program ${program.id}:`, participantError);
          return {
            ...program,
              participants: 0,
            };
          }
        })
      );

      console.log('Programs with participants:', programsWithParticipants);
      setPrograms(programsWithParticipants);
    } catch (error) {
      console.error("Error fetching programs:", error);
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

    // Fetch programs data
    fetchData()
  }, [fetchData, router, toast])

  useEffect(() => {
    async function fetchProgramParticipants() {
      const participants = await getProgramParticipants(1); // Example program ID
      console.log(participants);
    }
    fetchProgramParticipants();
  }, []);

  const filteredPrograms = programs.filter((program) => {
    // Field-specific search based on selected search field
    let matchesSearch = false;
    
    if (searchField === "all") {
      // Search across all fields
      matchesSearch = (
        program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.budget?.toString().includes(searchTerm) ||
        program.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchField === "name") {
      matchesSearch = program.name?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "location") {
      matchesSearch = program.location?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "date") {
      matchesSearch = program.date?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "budget") {
      matchesSearch = program.budget?.toString().includes(searchTerm);
    } else if (searchField === "status") {
      matchesSearch = program.status?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "description") {
      matchesSearch = program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    }

    const matchesStatus = statusFilter === "all" || program.status === statusFilter

    // Add date filtering
    const programDate = new Date(program.date)
    const matchesMonth = monthFilter === "all" || programDate.getMonth() + 1 === parseInt(monthFilter)
    const matchesYear = yearFilter === "all" || programDate.getFullYear().toString() === yearFilter

    return matchesSearch && matchesStatus && matchesMonth && matchesYear
  })

  // Get unique years from programs
  const years = [...new Set(programs.map(program => new Date(program.date).getFullYear()))].sort((a, b) => b - a)

  const openAddParticipantsModal = async (program: any) => {
    try {
      const all = await getParticipants();
      const registeredParticipants = await getParticipantsByProgram(program.id);
      const registeredIds = registeredParticipants.map((p: any) => p.id);
      const unregisteredParticipants = all.filter(
        (p) => !registeredIds.includes(p.id)
      );
      setAllParticipants(unregisteredParticipants);
      setSelectedToAdd([]);
      setSelectedProgram(program);
      setShowAddParticipantsModal(true);
    } catch (error) {
      console.error("Error fetching participants:", error);
      toast({
        title: "Error",
        description: "Failed to load participants",
        variant: "destructive",
      });
    }
  }

  const handleJoinProgram = async (program: any) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to join a program",
        variant: "destructive",
      });
      return;
    }

    setJoiningProgram(program.id);
    try {
      // First check if the user already has a complete participant profile
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('id, first_name, last_name, age, contact, email, address')
        .eq('user_id', userId)
        .single();

      if (participantError || !participant) {
        toast({
          title: "Profile Required",
          description: "Please complete your participant profile before joining programs",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/profile')}
              className="mt-2"
            >
              Complete Profile
            </Button>
          )
        });
        setJoiningProgram(null);
        return;
      }

      // Check if all required profile fields are filled out
      const requiredFields = ['first_name', 'last_name', 'age', 'contact'];
      const missingFields = requiredFields.filter(field => !participant[field as keyof typeof participant]);
      
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(field => 
          field.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())
        );
        setMissingFields(fieldNames);
        setShowProfileWarning(true);
        setJoiningProgram(null);
        return;
      }

      // Check if already a participant in this program
      const { data: existingParticipant } = await supabase
        .from('program_participants')
        .select('*')
        .eq('program_id', program.id)
        .eq('participant_id', participant.id)
        .maybeSingle();

      // Also check if there is an existing registration record
      const { data: existingRegistration } = await supabase
        .from('registrations')
        .select('*')
        .eq('program_id', program.id)
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

      // Transaction to add both program_participants and registration record
      // First, add to program_participants table
      const { error: joinError } = await supabase
        .from('program_participants')
        .insert({
          program_id: program.id,
          participant_id: participant.id
        });

      if (joinError) {
        console.error('Error joining program:', joinError);
        toast({
          title: "Error",
          description: joinError?.message || "Failed to join the program.",
          variant: "destructive",
        });
        setJoiningProgram(null);
        return;
      }

      // Then, add to registrations table with "Pending" status
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          program_id: program.id,
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
          .eq('program_id', program.id)
          .eq('participant_id', participant.id);

        toast({
          title: "Error",
          description: registrationError?.message || "Failed to register for the program.",
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
      await fetchData();
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

  const handleAddParticipants = async () => {
    try {
      if (!selectedProgram || selectedToAdd.length === 0) {
        toast({
          title: "Error",
          description: "Please select a program and at least one participant",
          variant: "destructive",
        });
        return;
      }

      // Add each participant one by one and collect any errors
      const errors: string[] = [];
      const successfulAdds: number[] = [];
      
      for (const participantId of selectedToAdd) {
        try {
          // Check if the participant is already in the program
          const { data: existing } = await supabase
            .from("program_participants")
            .select()
            .eq("program_id", selectedProgram.id)
            .eq("participant_id", participantId)
            .single();

          if (existing) {
            errors.push(`Participant ${participantId} is already in the program.`);
            continue;
          }

          // Add the participant to the program
          const { error } = await supabase
            .from("program_participants")
            .insert({
              program_id: selectedProgram.id,
              participant_id: participantId,
            });
            
          if (error) {
            errors.push(`Failed to add participant ${participantId}: ${error.message}`);
          } else {
            successfulAdds.push(participantId);
          }
        } catch (participantError: any) {
          errors.push(`Error adding participant ${participantId}: ${participantError.message || 'Unknown error'}`);
        }
      }
      
      // Show appropriate toast messages
      if (errors.length > 0) {
        toast({
          title: successfulAdds.length > 0 ? "Partial Success" : "Error",
          description: `${successfulAdds.length > 0 ? `Successfully added ${successfulAdds.length} participant(s).\n` : ''}${errors.join('\n')}`,
          variant: successfulAdds.length > 0 ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Successfully added ${successfulAdds.length} participant(s) to the program`,
        });
      }
      
      setShowAddParticipantsModal(false);
      setSelectedToAdd([]);
      fetchData();
    } catch (error) {
      console.error("Error adding participants:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add participants",
        variant: "destructive",
      });
    }
  };

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

  return (
 <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Programs</h1>
            {isAdmin && (
              <Link href="/programs/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Program
                </Button>
              </Link>
            )}
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${searchField === 'all' ? 'programs' : searchField}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={searchField}
                onValueChange={setSearchField}
              >
                <SelectTrigger className="w-full md:w-[180px] bg-white">
                  <SelectValue placeholder="Search in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="name">Program Name</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-white">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={monthFilter} 
                onValueChange={setMonthFilter}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-white">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="1">January</SelectItem>
                  <SelectItem value="2">February</SelectItem>
                  <SelectItem value="3">March</SelectItem>
                  <SelectItem value="4">April</SelectItem>
                  <SelectItem value="5">May</SelectItem>
                  <SelectItem value="6">June</SelectItem>
                  <SelectItem value="7">July</SelectItem>
                  <SelectItem value="8">August</SelectItem>
                  <SelectItem value="9">September</SelectItem>
                  <SelectItem value="10">October</SelectItem>
                  <SelectItem value="11">November</SelectItem>
                  <SelectItem value="12">December</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={yearFilter} 
                onValueChange={setYearFilter}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-white">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fixed size container for program cards */}
          <div className="w-full">
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:bg-gray-50 transition-colors h-72 w-full flex flex-col overflow-hidden">
                    <CardHeader className="flex-1 overflow-hidden">
                      <CardTitle>{program.name}</CardTitle>
                      <CardDescription>
                        <span className="line-clamp-3 block overflow-y-auto hover:overflow-auto" title={program.description}>{program.description}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
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
                          <span>{program.participants} Participants</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-medium">Budget: ₱{program.budget.toLocaleString()}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            program.status.toLowerCase() === "active"
                              ? "bg-green-100 text-green-800"
                              : program.status.toLowerCase() === "planning"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {program.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between gap-2 mt-2">
                        <Link href={`/programs/${program.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">View Details</Button>
                        </Link>
                        {!isAdmin && (
                          <div className="flex justify-between gap-2">
                            {/* Check if this program has a registration status */}
                            {registrationStatuses[program.id] ? (
                              <Button 
                                variant={registrationStatuses[program.id] === "Pending" ? "outline" : "default"}
                                disabled={true} 
                                className={`w-32 ${registrationStatuses[program.id] === "Accepted" ? "bg-green-600 hover:bg-green-700" : ""}`}
                              >
                                {registrationStatuses[program.id]}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleJoinProgram(program)}
                                disabled={joiningProgram === program.id || program.status !== 'Active'}
                                className="w-32"
                                title={program.status !== 'Active' ? `Program is ${program.status.toLowerCase()}` : ''}
                              >
                                {joiningProgram === program.id ? (
                                  "Applying..."
                                ) : (
                                  <>
                                    <Plus className="mr-1 h-4 w-4" />
                                    Join
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          </div>

          {showAddParticipantsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowAddParticipantsModal(false)}>
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowAddParticipantsModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4">Add Participants to {selectedProgram?.name}</h2>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between mb-4"
                    >
                      {selectedToAdd.length > 0
                        ? `${selectedToAdd.length} participants selected`
                        : "Select participants..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search participants..." />
                      <CommandEmpty>No participant found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {allParticipants.map((participant) => (
                          <CommandItem
                            key={participant.id}
                            onSelect={() => {
                              setSelectedToAdd((prev) =>
                                prev.includes(participant.id)
                                  ? prev.filter((id) => id !== participant.id)
                                  : [...prev, participant.id]
                              );
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedToAdd.includes(participant.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {`${participant.first_name} ${participant.last_name}`} ({participant.age} yrs, {participant.contact})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddParticipantsModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddParticipants} 
                    disabled={selectedToAdd.length === 0}
                  >
                    Add Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      {/* Profile Warning Dialog */}
      <Dialog open={showProfileWarning} onOpenChange={setShowProfileWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-warning">⚠️</span>
              Profile Incomplete
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-muted-foreground">
              Please complete your profile information before joining programs.
            </p>
            <div className="flex flex-col gap-2">
              <p className="font-medium">Missing Information:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                Complete Profile
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowProfileWarning(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
