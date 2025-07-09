"use client"

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, createParticipant } from "@/lib/db"
import { createClient } from "@/lib/supabase"

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

function NewParticipantPageInner() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    contact: "",
    email: "",
    address: "",
    program_id: "",
  })
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const fetchPrograms = useCallback(async () => {
    try {
      const programsData = await getPrograms()
      setPrograms(programsData)
    } catch (error) {
      console.error("Error fetching programs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch programs data
    fetchPrograms()

    // Set program_id from URL parameter if available
    const programId = searchParams.get("program")
    if (programId) {
      setFormData((prev) => ({ ...prev, program_id: programId }))
    }
  }, [fetchPrograms, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProgramChange = (programId: number) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.age || !formData.contact || !formData.address) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Prepare participant data
      const participantData: ParticipantInput = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: parseInt(formData.age),
        contact: formData.contact,
        email: formData.email || null,
        address: formData.address,
        program_ids: selectedPrograms.length > 0 ? selectedPrograms : undefined
      };

      // Add program_id from URL if present
      const params = new URLSearchParams(window.location.search);
      const programId = params.get('program');
      if (programId) {
        participantData.program_ids = [parseInt(programId)];
      }

      // Create participant
      const result = await createParticipant(participantData);
      
      toast({
        title: "Success",
        description: "Participant created successfully",
      });

      // If created from program page, redirect back to program
      if (programId) {
        router.push(`/programs/${programId}`);
      } else {
        router.push("/participants");
      }
    } catch (error: any) {
      console.error("Error creating participant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create participant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold">Add New Participant</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Participant Information</CardTitle>
              <CardDescription>Enter the details of the new participant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="0"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter participant's age"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number *</Label>
                    <Input
                      id="contact"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Programs *</Label>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                      {programs.map((program) => (
                        <label key={program.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={program.id}
                            checked={selectedPrograms.includes(program.id)}
                            onChange={() => handleProgramChange(program.id)}
                          />
                          {program.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter participant's address"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Participant"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}