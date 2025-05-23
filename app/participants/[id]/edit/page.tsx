"use client"

import type React from "react"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { getParticipant, updateParticipant, getPrograms, updateRegistrationStatus } from "@/lib/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"

export default function EditParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    contact: "",
    email: "",
    address: "",
    programId: "",
  })
  const [programStatuses, setProgramStatuses] = useState<{[key: number]: string}>({})
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching data for participant ID:', resolvedParams.id);
      const participantId = Number.parseInt(resolvedParams.id)
      const [participantData, programsData] = await Promise.all([
        getParticipant(participantId),
        getPrograms(),
      ])
      
      console.log('Participant data received:', participantData);
      
      if (!participantData) {
        throw new Error("Participant data not found")
      }
      
      // Get program statuses from the improved getParticipant function
      const registrationStatuses = participantData.registrationStatuses || {};
      console.log('Registration statuses:', registrationStatuses);
      
      // Use the registration statuses from the improved getParticipant function
      setProgramStatuses(registrationStatuses);
      
      // Log program IDs for debugging
      console.log('Program IDs from participant data:', participantData.program_ids);

      // Form data setup with participant info
      setFormData({
        first_name: participantData.first_name || "",
        last_name: participantData.last_name || "",
        age: participantData.age ? participantData.age.toString() : "",
        contact: participantData.contact || "",
        email: participantData.email || "",
        address: participantData.address || "",
        programId: "", // We don't use this field anymore
      })

      // Make sure we're using the program_ids from our improved getParticipant function
      // This combines IDs from both program_participants and registrations tables
      if (Array.isArray(participantData.program_ids)) {
        console.log('Setting selected programs to:', participantData.program_ids);
        setSelectedPrograms(participantData.program_ids);
      } else {
        console.log('No program_ids in participant data, setting empty array');
        setSelectedPrograms([]);
      }
      
      // Set all available programs
      setPrograms(programsData || []);
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load participant data",
        variant: "destructive",
      })
      router.push("/participants")
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id, router, toast])

  useEffect(() => {
    // Check if user is logged in and has admin/SK Official role
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")

    if (!isLoggedIn || (userRole !== "admin" && userRole !== "skofficial")) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin or SK Official to access this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Fetch participant and program data
    fetchData()
  }, [fetchData, router, toast])

  useEffect(() => {
    if (formData.programId) {
      setSelectedPrograms(formData.programId.split(",").map(Number)) // Assuming programId is a comma-separated string
    }
  }, [formData.programId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProgramChange = (programId: number) => {
    setSelectedPrograms((prev: number[]) =>
      prev.includes(programId)
        ? prev.filter((id: number) => id !== programId)
        : [...prev, programId]
    )
  }

  const handleStatusChange = async (programId: number, status: string) => {
    try {
      console.log(`Updating program ${programId} status to ${status}`);
      const participantId = Number.parseInt(resolvedParams.id);

      // Keep previous status for rollback if needed
      const previousStatus = programStatuses[programId];
      console.log('Previous status:', previousStatus);

      // Optimistically update UI
      setProgramStatuses(prev => ({
        ...prev,
        [programId]: status
      }));
      
      // Update status in the database
      const result = await updateRegistrationStatus(programId, participantId, status);
      console.log('Registration status update result:', result);

      if (result.error) {
        // If update failed, revert the optimistic update
        setProgramStatuses(prev => {
          const newState = { ...prev };
          if (previousStatus) {
            newState[programId] = previousStatus; // Restore previous status if it existed
          } else {
            delete newState[programId]; // Remove the failed status if there was no previous status
          }
          return newState;
        });

        toast({
          title: "Error",
          description: result.error.message || "Failed to update registration status",
          variant: "destructive",
        });
      } else if (result.data) {
        console.log("Status updated successfully:", result.data);
        
        toast({
          title: "Success",
          description: `Registration status updated to ${status}`,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert optimistic update on error
      const participantId = Number.parseInt(resolvedParams.id);
      const { supabase } = await import('@/lib/supabase');
      const { data: currentReg } = await supabase
        .from('registrations')
        .select('registration_status')
        .eq('program_id', programId)
        .eq('participant_id', participantId)
        .single();

      if (currentReg && currentReg.registration_status) {
        // Reset to the current value in database
        setProgramStatuses(prev => ({
          ...prev,
          [programId]: currentReg.registration_status
        }));
      }

      toast({
        title: "Status Update Failed",
        description: error instanceof Error ? error.message : "There was an error updating the status. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form fields
      if (formData.first_name.trim() === "") {
        throw new Error("Please enter a first name")
      }
      if (formData.last_name.trim() === "") {
        throw new Error("Please enter a last name")
      }
      if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
        throw new Error("Please enter a valid age")
      }
      if (formData.contact.trim() === "") {
        throw new Error("Please enter a valid contact number")
      }
      if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 120)) {
        throw new Error("Please enter a valid age between 0 and 120")
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }

      if (!/^[0-9+\-\s()]{10,15}$/.test(formData.contact)) {
        throw new Error("Please enter a valid contact number")
      }

      const participantId = Number.parseInt(resolvedParams.id)
      // Convert age from string to number and prepare data
      const updatedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: Number.parseInt(formData.age),
        contact: formData.contact,
        email: formData.email,
        address: formData.address,
        program_ids: selectedPrograms,
      }

      console.log('Updating participant with data:', updatedData);
      
      try {
      // First, update the participant's basic information and program registrations
      await updateParticipant(participantId, updatedData);
      
      // Now, ensure all status changes are persisted
      // Create an array of promises for updating each program's status
      const participantIdNumber = Number.parseInt(resolvedParams.id);
      const statusUpdatePromises = selectedPrograms.map(async (programId) => {
        // Only update if the program has a status set
        if (programStatuses[programId]) {
          console.log(`Ensuring status for program ${programId} is set to ${programStatuses[programId]}`);
          try {
            // Call the updateRegistrationStatus function directly to ensure the status is updated
            await updateRegistrationStatus(programId, participantIdNumber, programStatuses[programId]);
            return { programId, success: true };
          } catch (statusError) {
            console.error(`Error updating status for program ${programId}:`, statusError);
            return { programId, success: false, error: statusError };
          }
        }
        return { programId, success: true, skipped: true };
      });
      
      // Wait for all status updates to complete
      const statusResults = await Promise.all(statusUpdatePromises);
      console.log('Status update results:', statusResults);
      
      toast({
        title: "Participant Updated",
        description: "The participant information has been updated successfully.",
      });

      // Brief delay to ensure all registrations are processed
      setTimeout(() => {
        // Redirect back to participant detail page
        router.push(`/participants/${participantId}`);
      }, 1000);
      } catch (updateError: any) {
        console.error('Specific error updating participant:', updateError);
        let errorMessage = "There was an error updating the participant information.";
        
        // Check for duplicate key constraint error
        if (updateError.message?.includes('duplicate key') || 
            updateError.code === '23505') {
          errorMessage = "There was an issue with program assignments. A participant can't be registered to the same program twice.";
        }
        
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("General error updating participant:", error);
      toast({
        title: "Validation Error",
        description: error.message || "Please check the form for errors.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push(`/participants/${resolvedParams.id}`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Edit Participant</h1>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Participant Information</CardTitle>
                  <CardDescription>Update the details of the participant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        name="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input
                        id="contact"
                        name="contact"
                        placeholder="Enter contact number"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Program</Label>
                    <div className="flex flex-col gap-2">
                      {programs.map((program) => (
                        <div key={program.id} className="border rounded-md p-3 mb-2">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                value={program.id}
                                checked={selectedPrograms.includes(program.id)}
                                onChange={() => handleProgramChange(program.id)}
                              />
                              <span className="font-medium">{program.name}</span>
                            </label>
                          </div>
                          
                          {selectedPrograms.includes(program.id) && (
                            <div className="ml-6 mt-2">
                              <Label htmlFor={`status-${program.id}`} className="mb-1 block text-sm">Status:</Label>
                              <Select
                                value={programStatuses[program.id] || "Pending"}
                                onValueChange={(status) => handleStatusChange(program.id, status)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
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
