"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Search, UserPlus } from "lucide-react"

// Sample participants data
const participantsData = {
  1: [
    {
      id: 1,
      first_name: "Juan",
      last_name: "Dela Cruz",
      age: 18,
      contact: "09123456789",
      address: "123 Main St, San Francisco",
      email: "juan@example.com",
    },
    {
      id: 2,
      first_name: "Maria",
      last_name: "Santos",
      age: 19,
      contact: "09234567890",
      address: "456 Oak Ave, San Francisco",
      email: "maria@example.com",
    },
    {
      id: 3,
      first_name: "Pedro",
      last_name: "Reyes",
      age: 17,
      contact: "09345678901",
      address: "789 Pine St, San Francisco",
      email: "pedro@example.com",
    },
    {
      id: 4,
      first_name: "Ana",
      last_name: "Gonzales",
      age: 20,
      contact: "09456789012",
      address: "321 Maple Rd, San Francisco",
      email: "ana@example.com",
    },
    {
      id: 5,
      first_name: "Jose",
      last_name: "Rizal",
      age: 18,
      contact: "09567890123",
      address: "654 Cedar Ln, San Francisco",
      email: "jose@example.com",
    },
  ],
  2: [
    {
      id: 6,
      first_name: "Carlos",
      last_name: "Magno",
      age: 22,
      contact: "09678901234",
      address: "987 Elm St, San Francisco",
      email: "carlos@example.com",
    },
    {
      id: 7,
      first_name: "Sofia",
      last_name: "Reyes",
      age: 16,
      contact: "09789012345",
      address: "654 Birch Ave, San Francisco",
      email: "sofia@example.com",
    },
    {
      id: 8,
      first_name: "Miguel",
      last_name: "Santos",
      age: 18,
      contact: "09890123456",
      address: "321 Walnut Rd, San Francisco",
      email: "miguel@example.com",
    },
  ],
}

// Sample program names
const programNames = {
  1: "Youth Leadership Workshop",
  2: "Community Clean-up Drive",
}

export default function ProgramParticipantsPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [participants, setParticipants] = useState<any[]>([])
  const [programName, setProgramName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState(false)

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

    // Fetch participants data
    const programId = parseInt(params.id)
    const foundParticipants = participantsData[programId as keyof typeof participantsData] || []
    const foundProgramName = programNames[programId as keyof typeof programNames] || "Unknown Program"

    setParticipants(foundParticipants)
    setProgramName(foundProgramName)
    setIsLoading(false)
  }, [params.id, router, toast])

  // Filter participants based on search term
  const filteredParticipants = participants.filter((participant) => {
    const fullName = `${participant.first_name} ${participant.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      (participant.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (participant.contact || '').includes(searchTerm)
    )
  })

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push(`/programs/${params.id}`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Program Participants</h1>
                <p className="text-muted-foreground">{programName}</p>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Participants List</CardTitle>
                  <CardDescription>Manage participants for this program</CardDescription>
                </div>
                {isAdmin && (
                  <Link href={`/programs/${params.id}/participants/register`}>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Participant
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search participants..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                      <div>Name</div>
                      <div>Age</div>
                      <div>Contact</div>
                      <div>Email</div>
                      <div>Address</div>
                    </div>
                    {filteredParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="grid grid-cols-5 items-center p-3 text-sm border-t hover:bg-muted/50 transition-colors"
                      >
                        <div>{`${participant.first_name} ${participant.last_name}`}</div>
                        <div>{participant.age}</div>
                        <div>{participant.contact}</div>
                        <div>{participant.email || '-'}</div>
                        <div>{participant.address || '-'}</div>
                      </div>
                    ))}
                    {filteredParticipants.length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">
                        No participants found matching your search
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredParticipants.length} of {participants.length} participants
                    </p>
                    {isAdmin && <Button variant="outline">Export Participants List</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
