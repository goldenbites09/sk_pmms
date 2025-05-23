"use client"

import { useEffect, useState, useCallback, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"
import { getParticipants, getPrograms, getProgramParticipants, getProgramsByParticipant } from "@/lib/db"
import type { ProgramParticipant } from "@/lib/schema"

export default function ParticipantsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [programs, setPrograms] = useState<Array<{ id: number; name: string; status: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("all") // Add field-specific search
  const [programFilter, setProgramFilter] = useState("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [participantPrograms, setParticipantPrograms] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [participantsData, programsData] = await Promise.all([
        getParticipants(),
        getPrograms(),
      ])

      // Handle participants data
      if (Array.isArray(participantsData)) {
      setParticipants(participantsData)
      } else {
        console.error("Invalid participants data format:", participantsData)
        setParticipants([])
      }

      // Handle programs data
      if (Array.isArray(programsData)) {
      setPrograms(programsData)
      } else {
        console.error("Invalid programs data format:", programsData)
        setPrograms([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load participants data. Please try again later.",
        variant: "destructive",
      })
      // Set empty arrays to prevent undefined errors
      setParticipants([])
      setPrograms([])
    } finally {
      setIsLoading(false)
    }
  }, [toast])

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

    // Fetch participants and programs data
    fetchData()
  }, [fetchData, router, toast])

  const fetchParticipantPrograms = async (participantId: number) => {
    try {
      const programs = await getProgramsByParticipant(participantId);
      setParticipantPrograms(programs);
    } catch (error) {
      console.error("Error fetching participant programs:", error);
      toast({
        title: "Error",
        description: "Failed to load participant programs",
        variant: "destructive",
      });
    }
  };

  const handleViewParticipant = async (participant: any) => {
    setSelectedParticipant(participant);
    await fetchParticipantPrograms(participant.id);
    setIsModalOpen(true);
  };

  const filteredParticipants = participants.filter((participant) => {
    // Field-specific search based on selected search field
    let matchesSearch = false;
    
    if (searchField === "all") {
      // Search across all fields
      matchesSearch = (
        `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.age?.toString().includes(searchTerm) ||
        participant.contact?.includes(searchTerm) ||
        participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchField === "name") {
      matchesSearch = `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "age") {
      matchesSearch = participant.age?.toString().includes(searchTerm);
    } else if (searchField === "contact") {
      matchesSearch = participant.contact?.includes(searchTerm);
    } else if (searchField === "email") {
      matchesSearch = participant.email?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "address") {
      matchesSearch = participant.address?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Fix program filtering
    const matchesProgram = programFilter === "all" || 
      (participant.program_ids && 
       participant.program_ids.includes(parseInt(programFilter)))

    return matchesSearch && matchesProgram
  })

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 overflow-y-auto">
          <DashboardHeader />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Participants</h1>
            {isAdmin && (
              <Link href="/participants/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Participant
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Participant Management</CardTitle>
              <CardDescription>View and manage all program participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${searchField === 'all' ? 'participants' : searchField}...`}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="age">Age</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="address">Address</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={programFilter} 
                  onValueChange={setProgramFilter}
                >
                  <SelectTrigger className="w-full md:w-[200px] bg-white">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem 
                        key={program.id} 
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4">
                {filteredParticipants.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No participants found matching your criteria</p>
                  </div>
                )}
                {filteredParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg truncate">
                        {participant.last_name}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                        <span>Age: {participant.age}</span>
                        <span>Contact: {participant.contact}</span>
                        {participant.email && <span>Email: {participant.email}</span>}
                        {participant.address && <span>Address: {participant.address}</span>}
                        <span>Programs: {participant.program_ids?.map((id: number) => 
                          programs.find(p => p.id === id)?.name
                        ).filter(Boolean).join(", ") || "No programs"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button size="icon" variant="outline" title="View" onClick={() => handleViewParticipant(participant)}>
                        <span className="sr-only">View</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z"/></svg>
                      </Button>
                      {isAdmin && <Link href={`/participants/${participant.id}/edit`}><Button size="icon" variant="outline" title="Edit"><span className="sr-only">Edit</span><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232a3 3 0 0 1 4.243 4.243L7.5 21H3v-4.5l12.232-12.268Z"/></svg></Button></Link>}
                      {isAdmin && <Button size="icon" variant="destructive" title="Delete" onClick={async () => {if(confirm('Are you sure you want to delete this participant?')){await import('@/lib/db').then(({deleteParticipant})=>deleteParticipant(participant.id));router.refresh();}}}><span className="sr-only">Delete</span><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg></Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modal for participant details */}
          {isModalOpen && selectedParticipant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setIsModalOpen(false)}>
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-10 relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setIsModalOpen(false)}>&times;</button>
                <h2 className="text-3xl font-bold mb-4">{selectedParticipant.first_name} {selectedParticipant.last_name}</h2>
                <div className="mb-4 text-lg text-muted-foreground">Age: {selectedParticipant.age} | Contact: {selectedParticipant.contact}</div>
                <div className="mb-4 text-lg text-muted-foreground"><span className="font-semibold">Email:</span> {selectedParticipant.email || <span className="italic text-gray-400">N/A</span>}</div>
                <div className="mb-4 text-lg text-muted-foreground"><span className="font-semibold">Address:</span> {selectedParticipant.address || <span className="italic text-gray-400">N/A</span>}</div>
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-3">Programs Joined</h3>
                  {participantPrograms.length > 0 ? (
                    <div className="space-y-2">
                      {participantPrograms.map((program) => (
                        <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-emerald-700">{program.name}</p>
                            <p className="text-sm text-muted-foreground">{program.date} | {program.location}</p>
                          </div>
                          <Link href={`/programs/${program.id}`}>
                            <Button variant="outline" size="sm">View Program</Button>
                          </Link>
                        </div>
                      ))}
                  </div>
                  ) : (
                    <p className="text-muted-foreground italic">No programs joined yet</p>
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
