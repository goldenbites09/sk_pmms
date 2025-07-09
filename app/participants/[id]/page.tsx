"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Mail, Phone, Trash, User } from "lucide-react"

// Define interfaces for type safety
interface ProgramData {
  id: number;
  name: string;
  date?: string;
  location?: string;
}

interface Program {
  id: number;
  name: string;
  date?: string;
  location?: string;
  registration_status?: string;
}

// This matches the actual Supabase response structure
type RegistrationData = {
  program_id: number;
  registration_status: string;
  programs: ProgramData;
}

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  contact: string;
  email?: string | null;
  address: string;
  user_id?: string | null;
  created_at?: string;
  programs?: Program[];
}

import { createClient } from "@/lib/supabase"

// Helper function to get color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800";
    case "Rejected":
      return "bg-red-100 text-red-800";
    case "Waitlisted":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [participant, setParticipant] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
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

    // Fetch participant data from database
    const fetchParticipantData = async () => {
      try {
        setIsLoading(true);
        const participantId = Number.parseInt(resolvedParams.id);
        
        // Import getParticipant function
        const { getParticipant } = await import('@/lib/db');
        
        // Fetch participant details
        const participantData = await getParticipant(participantId);
        
        if (!participantData) {
          toast({
            title: "Participant Not Found",
            description: "The requested participant could not be found",
            variant: "destructive",
          });
          router.push("/participants");
          return;
        }
        
        // Get programs for this participant
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        const { data: registrationsData, error: regError } = await supabase
          .from('registrations')
          .select(`
            program_id,
            registration_status,
            programs(id, name, date, location)
          `)
          .eq('participant_id', participantId);
          
        if (regError) {
          console.error('Error fetching registrations:', regError);
          throw regError;
        }
        
        console.log('Registration data:', registrationsData);
          
        // Format program data
        const programs: Program[] = [];
        
        if (registrationsData && Array.isArray(registrationsData)) {
          // Use a regular for loop instead of forEach to avoid TypeScript issues
          for (let i = 0; i < registrationsData.length; i++) {
            const reg = registrationsData[i] as any;
            if (reg && reg.program_id) {
              const programData: Program = {
                id: reg.program_id,
                name: reg.programs?.name || 'Unknown Program',
                date: reg.programs?.date || '',
                location: reg.programs?.location || '',
                registration_status: reg.registration_status || 'Pending'
              };
              programs.push(programData);
            }
          }
        }
        
        // Combine data
        const participantWithPrograms = {
          ...participantData,
          programs
        };
        
        setParticipant(participantWithPrograms);
      } catch (error) {
        console.error('Error fetching participant:', error);
        toast({
          title: "Error",
          description: "Failed to load participant data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchParticipantData();
  }, [resolvedParams.id, router, toast])

  const handleDelete = async () => {
    if (!participant) return

    if (!confirm(`Are you sure you want to delete ${participant.first_name} ${participant.last_name}?`)) {
      return
    }

    setIsDeleting(true)

    try {
      // Import deleteParticipant function
      const { deleteParticipant } = await import('@/lib/db');
      
      // Delete the participant
      const participantId = Number.parseInt(resolvedParams.id);
      await deleteParticipant(participantId);

      toast({
        title: "Participant Deleted",
        description: `${participant.first_name} ${participant.last_name} has been removed`,
      })

      router.push("/participants")
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete Failed",
        description: "There was an error deleting this participant",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
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
              <Button variant="outline" size="icon" onClick={() => router.push("/participants")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Participant Details</h1>
              {isAdmin && (
                <div className="flex gap-2">
                  <Link href={`/participants/${participant.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                    <Trash className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Detailed information about the participant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 text-emerald-700 rounded-full p-3">
                      <User className="h-6 w-6" />
                    </div>
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
                  <CardDescription>Programs the participant is enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Enrolled Programs</h3>
                      {participant.programs?.map((program: Program) => (
                      <div key={program.id} className="mb-2">
                        <Link
                            href={`/programs/${program.id}`}
                            className="text-emerald-600 hover:underline font-medium block"
                        >
                            {program.name}
                        </Link>
                        {program.registration_status && (
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(program.registration_status)}`}>
                            {program.registration_status}
                          </span>
                        )}
                      </div>
                      ))}
                      {(!participant.programs || participant.programs.length === 0) && (
                        <p className="text-muted-foreground">Not enrolled in any programs</p>
                      )}
                    </div>

                    {participant.programs && participant.programs.length > 0 && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/programs/${participant.programs[0].id}`)}
                      >
                        View First Program Details
                      </Button>
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
