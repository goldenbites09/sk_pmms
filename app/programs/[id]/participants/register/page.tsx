"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { createParticipant, getProgram } from "@/lib/db"

interface ParticipantInput {
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string | null;
  address: string;
  user_id?: string | null;
  program_ids?: number[];
}

// Sample program names
const programNames = {
  1: "Youth Leadership Workshop",
  2: "Community Clean-up Drive",
}

export default function RegisterParticipantPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [programName, setProgramName] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    contact: "",
    email: "",
    address: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const program = await getProgram(Number(params.id))
        setProgramName(program.name)
      } catch (error) {
        console.error("Error loading program:", error)
        toast({
          title: "Error",
          description: "Failed to load program details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadProgram()
  }, [params.id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.age || !formData.contact || !formData.address) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      // Create participant with program registration
      const participantData: ParticipantInput = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: parseInt(formData.age),
        contact: formData.contact,
        email: formData.email || null,
        address: formData.address,
        program_ids: [Number(params.id)] // Register directly to the program
      }

      await createParticipant(participantData)

      toast({
        title: "Success",
        description: "Participant registered successfully",
      })
      router.push(`/programs/${params.id}/participants`)
    } catch (error: any) {
      console.error("Error registering participant:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to register participant. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 md:ml-64">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push(`/programs/${params.id}/participants`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Register Participant</h1>
                <p className="text-muted-foreground">{programName}</p>
              </div>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Participant Information</CardTitle>
                  <CardDescription>Enter the details of the participant to register</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input
                        id="contact"
                        placeholder="Enter contact number"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registering..." : "Register Participant"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
