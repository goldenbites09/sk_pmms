"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase"
import { getParticipantForProfile, updateParticipant, getPrograms } from "@/lib/db"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function ProfilePage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    first_name: string
    last_name: string
    age: string
    contact: string
    email: string
    address: string
    programId: string
  }>({
    first_name: "",
    last_name: "",
    age: "",
    contact: "",
    email: "",
    address: "",
    programId: "",
  })
  const [participantId, setParticipantId] = useState<number | null>(null)
  
  // Store the registration statuses for each program
  const [programStatuses, setProgramStatuses] = useState<Record<number, string>>({})
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not found in auth context");
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }
      
      // Get profile data for the user
      const participantData = await getParticipantForProfile(user.id);
      console.log("Participant data:", participantData);
      
      if (!participantData) {
        throw new Error("Participant data not found");
      }

      // Store the registration statuses separately for use in the UI
      const registrationStatuses = participantData.registrationStatuses || {};
      console.log('Registration statuses:', registrationStatuses);
      
      // Set form data with basic participant info
      setFormData({
        first_name: participantData.first_name || "",
        last_name: participantData.last_name || "",
        age: participantData.age ? participantData.age.toString() : "",
        contact: participantData.contact || "",
        email: participantData.email || "",
        address: participantData.address || "",
        programId: "", // This is not used in profile, only when creating new participant
      });

      // Set selected programs - these are the ones the user is enrolled in
      if (Array.isArray(participantData.program_ids)) {
        console.log('Setting selected programs to:', participantData.program_ids);
        setSelectedPrograms(participantData.program_ids);
      } else {
        console.log('No program_ids array found, using empty array');
        setSelectedPrograms([]);
      }

      // Store the registration statuses in a state variable for use in the UI
      setProgramStatuses(registrationStatuses);

      // Get available programs for dropdown
      const programsData = await getPrograms();
      setPrograms(programsData || []);

      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load profile data");
      setIsLoading(false);
    }
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (formData.programId) {
      setSelectedPrograms(formData.programId.split(",").map(Number))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Validate inputs
      if (!formData.first_name || !formData.last_name || !formData.age || !formData.contact) {
        throw new Error("Please fill in all required fields")
      }
      const age = parseInt(formData.age)
      if (isNaN(age) || age < 0 || age > 120) {
        throw new Error("Please enter a valid age between 0 and 120")
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error("Please enter a valid email address")
      }
      if (!/^[0-9+\-\s()]{10,15}$/.test(formData.contact)) {
        throw new Error("Please enter a valid contact number")
      }

      // Get current user ID for new participant creation if needed
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User authentication required")
      }

      // Check if participant exists for this user
      const { data: participant, error: fetchError } = await supabase
        .from('participants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && !fetchError.message.includes('not found')) {
        throw fetchError;
      }

      // Create or update participant profile
      try {
        if (!participant?.id) {
          const { data: newParticipant, error: createError } = await supabase
            .from('participants')
            .insert({
              first_name: formData.first_name,
              last_name: formData.last_name,
              age: parseInt(formData.age),
              contact: formData.contact,
              email: formData.email || null,
              address: formData.address,
              user_id: user.id
            })
            .select()
            .single();

          if (createError) throw createError;
          setParticipantId(newParticipant?.id);
        } else {
          const { error: updateError } = await supabase
            .from('participants')
            .update({
              first_name: formData.first_name,
              last_name: formData.last_name,
              age: parseInt(formData.age),
              contact: formData.contact,
              email: formData.email || null,
              address: formData.address
            })
            .eq('id', participant.id)
            .eq('user_id', user.id);

          if (updateError) throw updateError;
        }
        // If we reach here, the create/update was successful
      } catch (error: any) {
        throw new Error(error.message || "Failed to save profile");
      }

      setIsSuccessModalOpen(true)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
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


  return (
     <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Profile Information</h1>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
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
                    <Label>My Programs</Label>
                    <div className="flex flex-col gap-2 border rounded-md p-4 bg-gray-50">
                      {selectedPrograms.length > 0 ? (
                        <div className="space-y-3">
                          {programs
                            .filter(program => selectedPrograms.includes(program.id))
                            .map((program) => {
                              const status = programStatuses[program.id]?.toLowerCase() || 'enrolled';
                              const statusColors = {
                                'pending': 'bg-yellow-100 text-yellow-800',
                                'approved': 'bg-green-100 text-green-800',
                                'rejected': 'bg-red-100 text-red-800',
                                'enrolled': 'bg-blue-100 text-blue-800'
                              };
                              
                              return (
                                <div 
                                  key={program.id} 
                                  className="flex items-center justify-between p-3 bg-white rounded-md border shadow-sm hover:shadow transition-shadow"
                                >
                                  <span className="font-medium">
                                    {program.name}
                                  </span>
                                  <span 
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">You haven't joined any programs yet.</p>
                          <Button 
                            variant="link" 
                            className="mt-2 text-blue-600"
                            onClick={() => router.push('/programs')}
                          >
                            Browse Programs
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">* Program enrollment can only be managed by program administrators</p>
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
      <Dialog open={isSuccessModalOpen} onOpenChange={handleSuccessModalClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p>Your profile has been successfully updated!</p>
            </div>
            <Button onClick={handleSuccessModalClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}