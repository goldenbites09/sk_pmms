"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, LogOut, Mail, Phone, User } from "lucide-react"

// Sample participants data
const allParticipantsData = [
  {
    id: 1,
    first_name: "Juan",
    last_name: "Dela Cruz",
    age: 18,
    contact: "09123456789",
    address: "123 Main St, San Francisco",
    email: "juan@example.com",
    program: "Youth Leadership Workshop",
    programId: 1,
  },
  {
    id: 2,
    first_name: "Maria",
    last_name: "Santos",
    age: 19,
    contact: "09234567890",
    address: "456 Oak Ave, San Francisco",
    email: "maria@example.com",
    program: "Youth Leadership Workshop",
    programId: 1,
  },
  {
    id: 3,
    first_name: "Pedro",
    last_name: "Reyes",
    age: 17,
    contact: "09345678901",
    address: "789 Pine St, San Francisco",
    email: "pedro@example.com",
    program: "Youth Leadership Workshop",
    programId: 1,
  },
  {
    id: 4,
    first_name: "Ana",
    last_name: "Gonzales",
    age: 20,
    contact: "09456789012",
    address: "321 Maple Rd, San Francisco",
    email: "ana@example.com",
    program: "Youth Leadership Workshop",
    programId: 1,
  },
  {
    id: 5,
    first_name: "Jose",
    last_name: "Rizal",
    age: 18,
    contact: "09567890123",
    address: "654 Cedar Ln, San Francisco",
    email: "jose@example.com",
    program: "Youth Leadership Workshop",
    programId: 1,
  },
  {
    id: 6,
    first_name: "Carlos",
    last_name: "Magno",
    age: 22,
    contact: "09678901234",
    address: "987 Elm St, San Francisco",
    email: "carlos@example.com",
    program: "Community Clean-up Drive",
    programId: 2,
  },
  {
    id: 7,
    first_name: "Sofia",
    last_name: "Reyes",
    age: 16,
    contact: "09789012345",
    address: "654 Birch Ave, San Francisco",
    email: "sofia@example.com",
    program: "Community Clean-up Drive",
    programId: 2,
  },
  {
    id: 8,
    first_name: "Miguel",
    last_name: "Santos",
    age: 18,
    contact: "09890123456",
    address: "321 Walnut Rd, San Francisco",
    email: "miguel@example.com",
    program: "Community Clean-up Drive",
    programId: 2,
  },
]

export default function UserParticipantDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [participant, setParticipant] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
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

    // Fetch participant data
    const participantId = Number.parseInt(params.id)
    const foundParticipant = allParticipantsData.find((p) => p.id === participantId)

    if (!foundParticipant) {
      toast({
        title: "Participant Not Found",
        description: "The requested participant could not be found",
        variant: "destructive",
      })
      router.push("/user-view")
      return
    }

    setParticipant(foundParticipant)
    setIsLoading(false)
  }, [params.id, router, toast])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/user-view" className="text-xl font-bold text-emerald-600">
            SK Monitor
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Viewer Account</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative">
          <div className="absolute inset-0 z-0 h-48">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bg_1-gJscCuw8IWiwtUX1bwRD3UR8s8gQvg.png"
              alt="SK San Francisco Background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-emerald-800/90"></div>
          </div>
          <div className="container relative z-10 mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="bg-white" onClick={() => router.push("/user-view")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold text-white">Participant Details</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Detailed information about the participant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                      <User className="h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-bold">{participant.first_name} {participant.last_name}</h3>
                      <p className="text-muted-foreground">Age: {participant.age}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Contact Number</h3>
                        <p className="text-muted-foreground">{participant.contact}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Email Address</h3>
                        <p className="text-muted-foreground">{participant.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">{participant.address}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                  <CardDescription>Program the participant is enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Enrolled Program</h3>
                      <Link
                        href={`/user-view/programs/${participant.programId}`}
                        className="text-emerald-600 hover:underline font-medium"
                      >
                        {participant.program}
                      </Link>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/user-view/programs/${participant.programId}`)}
                      >
                        View Program Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container mx-auto px-4 flex flex-col gap-2 sm:flex-row justify-between">
          <p className="text-sm text-gray-500">© 2025 SK Program Monitoring System. All rights reserved.</p>
          <p className="text-sm text-gray-500">Viewer Access</p>
        </div>
      </footer>
    </div>
  )
}
