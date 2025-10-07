"use client"

import { useEffect, useState, useCallback, type ChangeEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Mail, Phone, MapPin, User, Calendar, X } from "lucide-react"
import { getParticipants, getPrograms, getProgramsByParticipant } from "@/lib/db"

export default function ParticipantsPage() {
  useEffect(() => {
    document.body.classList.add("no-scroll")

    return () => {
      document.body.classList.remove("no-scroll")
    }
  }, [])

  const [isLoading, setIsLoading] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [programs, setPrograms] = useState<Array<{ id: number; name: string; status: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("all")
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
      const [participantsData, programsData] = await Promise.all([getParticipants(), getPrograms()])

      if (Array.isArray(participantsData)) {
        setParticipants(participantsData)
      } else {
        console.error("Invalid participants data format:", participantsData)
        setParticipants([])
      }

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
      setParticipants([])
      setPrograms([])
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
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

    setIsAdmin(userRole === "admin" || userRole === "skofficial")

    fetchData()
  }, [fetchData, router, toast])

  useEffect(() => {
    if (isAdmin === false && searchField !== "name") {
      setSearchField("name")
    }
  }, [isAdmin, searchField])

  const fetchParticipantPrograms = async (participantId: number) => {
    try {
      const programs = await getProgramsByParticipant(participantId)
      setParticipantPrograms(programs)
    } catch (error) {
      console.error("Error fetching participant programs:", error)
      toast({
        title: "Error",
        description: "Failed to load participant programs",
        variant: "destructive",
      })
    }
  }

  const handleViewParticipant = async (participant: any) => {
    setSelectedParticipant(participant)
    await fetchParticipantPrograms(participant.id)
    setIsModalOpen(true)
  }

  const filteredParticipants = participants
    .filter((participant) => {
      if (isAdmin) {
        return true
      }
      return !participant.role || participant.role === "user"
    })
    .filter((participant) => {
      let matchesSearch = false

      if (isAdmin) {
        if (searchField === "all") {
          matchesSearch =
            `${participant.first_name} ${participant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.age?.toString().includes(searchTerm) ||
            participant.contact?.includes(searchTerm) ||
            participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            participant.address?.toLowerCase().includes(searchTerm.toLowerCase())
        } else if (searchField === "name") {
          matchesSearch = `${participant.first_name} ${participant.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        } else if (searchField === "age") {
          matchesSearch = participant.age?.toString().includes(searchTerm)
        } else if (searchField === "contact") {
          matchesSearch = participant.contact?.includes(searchTerm)
        } else if (searchField === "email") {
          matchesSearch = participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
        } else if (searchField === "address") {
          matchesSearch = participant.address?.toLowerCase().includes(searchTerm.toLowerCase())
        }
      } else {
        matchesSearch = `${participant.first_name} ${participant.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      }

      const matchesProgram =
        programFilter === "all" || 
        (participant.program_ids && participant.program_ids.includes(Number.parseInt(programFilter)))

      return matchesSearch && matchesProgram
    })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Participants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-64">
          <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">Participants Directory</h1>
                <p className="text-sm sm:text-base text-gray-600">Comprehensive participant management and program enrollment tracking.</p>
              </div>
              {isAdmin && (
                <Link href="/participants/new" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Participant
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 bg-white px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder={`Search ${searchField === "all" ? "all fields" : searchField}...`}
                    className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 bg-white shadow-sm"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-full md:w-[200px] h-12 border-gray-300 bg-white shadow-sm">
                    <SelectValue placeholder="Search field" />
                  </SelectTrigger>
                  <SelectContent>
                    {isAdmin ? (
                      <>
                        <SelectItem value="all">All Fields</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="age">Age</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="address">Address</SelectItem>
                      </>
                    ) : (
                      <SelectItem value="name">Name</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-full md:w-[220px] h-12 border-gray-300 bg-white shadow-sm">
                    <SelectValue placeholder="Program filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {filteredParticipants.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="text-center py-20 px-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-5">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No participants found</h3>
                    <p className="text-gray-600">
                      Adjust your search criteria or add a new participant to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredParticipants.map((participant) => {
                const programCount = participant.program_ids ? participant.program_ids.length : 0
                return (
                  <Card
                    key={participant.id}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:border-gray-300"
                    onClick={() => handleViewParticipant(participant)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-5 flex-1 min-w-0">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                            {participant.first_name[0]}
                            {participant.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-xl text-gray-900">
                                {participant.first_name} {participant.last_name}
                              </h3>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                {programCount} {programCount === 1 ? "Program" : "Programs"}
                              </span>
                            </div>
                            {isAdmin && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
                                <div className="flex items-center gap-2.5 text-sm">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Age</p>
                                    <p className="text-sm font-semibold text-gray-900">{participant.age}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                                    <Phone className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                    <p className="text-sm font-semibold text-gray-900">{participant.contact}</p>
                                  </div>
                                </div>
                                {participant.email && (
                                  <div className="flex items-center gap-2.5 text-sm">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                                      <Mail className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs text-gray-500 font-medium">Email</p>
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {participant.email}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {participant.address && (
                                  <div className="flex items-center gap-2.5 text-sm sm:col-span-2 lg:col-span-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                                      <MapPin className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs text-gray-500 font-medium">Address</p>
                                      <p className="text-sm font-semibold text-gray-900">{participant.address}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {!isAdmin && (
                              <p className="text-sm text-gray-600">
                                Enrolled in {programCount} {programCount === 1 ? "program" : "programs"}
                              </p>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-3 md:ml-4 flex-shrink-0">
                            <Link href={`/participants/${participant.id}/edit`} onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="default"
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-semibold shadow-sm bg-transparent"
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              size="default"
                              variant="destructive"
                              className="font-semibold shadow-sm"
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm("Are you sure you want to delete this participant?")) {
                                  await import("@/lib/db").then(({ deleteParticipant }) =>
                                    deleteParticipant(participant.id),
                                  )
                                  fetchData()
                                  toast({ title: "Success", description: "Participant deleted successfully." })
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {isModalOpen && selectedParticipant && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-gray-200 px-8 py-6 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-5">
                      <div className="h-20 w-20 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-md">
                        {selectedParticipant.first_name[0]}
                        {selectedParticipant.last_name[0]}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">
                          {selectedParticipant.first_name} {selectedParticipant.last_name}
                        </h2>
                        <p className="text-gray-600 font-medium">Participant Profile</p>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-200"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto p-8 flex-1 bg-white">
                  {isAdmin && (
                    <div className="mb-8">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5 pb-2 border-b border-gray-200">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="h-11 w-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Age</p>
                            <p className="text-xl font-bold text-gray-900">{selectedParticipant.age}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="h-11 w-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-5 w-5 text-gray-700" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Phone Number
                            </p>
                            <p className="text-xl font-bold text-gray-900">{selectedParticipant.contact}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50 md:col-span-2">
                          <div className="h-11 w-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Email Address
                            </p>
                            <p className="text-xl font-bold text-gray-900 truncate">
                              {selectedParticipant.email || (
                                <span className="text-gray-400 font-normal italic text-base">Not provided</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50 md:col-span-2">
                          <div className="h-11 w-11 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                            <p className="text-xl font-bold text-gray-900">
                              {selectedParticipant.address || (
                                <span className="text-gray-400 font-normal italic text-base">Not provided</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5 pb-2 border-b border-gray-200">
                      Program Enrollment
                    </h3>
                    {participantPrograms.length > 0 ? (
                      <div className="space-y-4">
                        {participantPrograms.map((program) => (
                          <div
                            key={program.id}
                            className="flex items-center justify-between p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-lg mb-2">{program.name}</p>
                              <div className="flex items-center gap-5 text-sm text-gray-600">
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">
                                    {new Date(program.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </span>
                                <span className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{program.location}</span>
                                </span>
                              </div>
                            </div>
                            <Link href={`/programs/${program.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-4 border-gray-300 hover:bg-white hover:border-gray-400 font-medium bg-transparent"
                              >
                                View Program
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border border-gray-200 mb-4">
                          <Calendar className="h-7 w-7 text-gray-400" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1">No Program Enrollment</h4>
                        <p className="text-gray-600 text-sm">This participant has not enrolled in any programs yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}