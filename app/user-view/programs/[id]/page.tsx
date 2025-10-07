"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, LogOut, MapPin, Users } from "lucide-react"

// Sample program data
const programsData = [
  {
    id: 1,
    name: "Youth Leadership Workshop",
    description:
      "A comprehensive workshop focused on developing leadership skills among the youth in our barangay. The program aims to equip young individuals with essential leadership qualities, communication skills, and project management abilities that will help them become effective leaders in their communities.",
    date: "May 15, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "Barangay Hall, Conference Room",
    budget: 15000,
    status: "Active",
    participants: [
      { id: 1, name: "Juan Dela Cruz", age: 18, contact: "09123456789" },
      { id: 2, name: "Maria Santos", age: 19, contact: "09234567890" },
      { id: 3, name: "Pedro Reyes", age: 17, contact: "09345678901" },
      { id: 4, name: "Ana Gonzales", age: 20, contact: "09456789012" },
      { id: 5, name: "Jose Rizal", age: 18, contact: "09567890123" },
    ],
    expenses: [
      { id: 1, description: "Venue Rental", amount: 5000, date: "May 15, 2025" },
      { id: 2, description: "Refreshments", amount: 3000, date: "May 15, 2025" },
      { id: 3, description: "Speaker Honorarium", amount: 4000, date: "May 15, 2025" },
      { id: 4, description: "Materials and Handouts", amount: 2000, date: "May 10, 2025" },
      { id: 5, description: "Certificates", amount: 1000, date: "May 14, 2025" },
    ],
  },
  {
    id: 2,
    name: "Community Clean-up Drive",
    description:
      "A community initiative to clean up public spaces and promote environmental awareness among residents. This program aims to beautify our community spaces while educating participants about proper waste management and environmental conservation.",
    date: "May 10, 2025",
    time: "7:00 AM - 11:00 AM",
    location: "Community Park and Surrounding Streets",
    budget: 8000,
    status: "Active",
    participants: [
      { id: 6, name: "Carlos Magno", age: 22, contact: "09678901234" },
      { id: 7, name: "Sofia Reyes", age: 16, contact: "09789012345" },
      { id: 8, name: "Miguel Santos", age: 18, contact: "09890123456" },
    ],
    expenses: [
      { id: 6, description: "Cleaning Supplies", amount: 3500, date: "May 8, 2025" },
      { id: 7, description: "Refreshments", amount: 2000, date: "May 10, 2025" },
      { id: 8, description: "T-shirts for Volunteers", amount: 2500, date: "May 5, 2025" },
    ],
  },
]

export default function UserProgramDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [program, setProgram] = useState<any>(null)
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

    // Fetch program data
    const programId = Number.parseInt(params.id)
    const foundProgram = programsData.find((p) => p.id === programId)

    if (!foundProgram) {
      toast({
        title: "Program Not Found",
        description: "The requested program could not be found",
        variant: "destructive",
      })
      router.push("/user-view")
      return
    }

    setProgram(foundProgram)
    setIsLoading(false)
  }, [params.id, router, toast])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userRole")
    router.push("/login")
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
              <h1 className="text-3xl font-bold text-white">{program.name}</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Program Details</CardTitle>
                  <CardDescription>Comprehensive information about this program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground mt-1">{program.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Date & Time</h3>
                        <p className="text-muted-foreground">{program.date}</p>
                        <p className="text-muted-foreground">{program.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-muted-foreground">{program.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Budget</h3>
                      <p className="text-muted-foreground">₱{program.budget.toLocaleString()}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Status</h3>
                      <div
                        className={`inline-block text-sm rounded-full px-2 py-1 font-medium mt-1 ${
                          program.status === "Active"
                            ? "bg-emerald-100 text-emerald-800"
                            : program.status === "Planning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {program.status}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <CardDescription>{program.participants.length} registered participants</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {program.participants.slice(0, 5).map((participant: any) => (
                      <Link href={`/user-view/participants/${participant.id}`} key={participant.id}>
                        <div className="flex justify-between items-center py-2 border-b hover:bg-gray-50 transition-colors cursor-pointer">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-muted-foreground">Age: {participant.age}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/user-view?tab=participants&program=${program.id}`)}
                  >
                    View All Participants
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Tabs defaultValue="expenses">
              <TabsList>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value="expenses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Program Expenses</CardTitle>
                    <CardDescription>Financial breakdown for this program</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium">
                        <div>Description</div>
                        <div>Date</div>
                        <div>Amount</div>
                      </div>
                      {program.expenses.map((expense: any) => (
                        <div key={expense.id} className="grid grid-cols-3 items-center gap-4 text-sm border-b pb-2">
                          <div>{expense.description}</div>
                          <div>{expense.date}</div>
                          <div>₱{expense.amount.toLocaleString()}</div>
                        </div>
                      ))}
                      <div className="grid grid-cols-3 items-center gap-4 text-sm font-bold pt-2">
                        <div>Total</div>
                        <div></div>
                        <div>
                          ₱
                          {program.expenses
                            .reduce((total: number, expense: any) => total + expense.amount, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
