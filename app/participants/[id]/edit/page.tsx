"use client"

import type React from "react"
import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, MapPin, Calendar, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { getParticipant, updateParticipant, getPrograms, updateRegistrationStatus } from "@/lib/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"

interface FormData {
  first_name: string
  last_name: string
  age: string
  contact: string
  email: string
  address: string
}

interface Program {
  id: number
  name: string
}

const statusConfig = {
  Approved: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    variant: "default" as const,
  },
  Pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    variant: "secondary" as const,
  },
  Waitlisted: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: AlertCircle,
    variant: "outline" as const,
  },
  Rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    variant: "destructive" as const,
  },
}

export default function EditParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    age: "",
    contact: "",
    email: "",
    address: "",
  })
  const [programStatuses, setProgramStatuses] = useState<{ [key: number]: string }>({})
  const [programs, setPrograms] = useState<Program[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const router = useRouter()
  const { toast } = useToast()

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }

    const age = Number(formData.age)
    if (!formData.age || isNaN(age) || age <= 0 || age > 120) {
      newErrors.age = "Please enter a valid age between 1 and 120"
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required"
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.contact)) {
      newErrors.contact = "Please enter a valid contact number"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchData = useCallback(async () => {
    try {
      const participantId = Number.parseInt(resolvedParams.id)
      const [participantData, programsData] = await Promise.all([getParticipant(participantId), getPrograms()])

      if (!participantData) {
        throw new Error("Participant data not found")
      }

      const registrationStatuses = participantData.registrationStatuses || {}
      setProgramStatuses(registrationStatuses)

      setFormData({
        first_name: participantData.first_name || "",
        last_name: participantData.last_name || "",
        age: participantData.age ? participantData.age.toString() : "",
        contact: participantData.contact || "",
        email: participantData.email || "",
        address: participantData.address || "",
      })

      if (Array.isArray(participantData.program_ids)) {
        setSelectedPrograms(participantData.program_ids)
      } else {
        setSelectedPrograms([])
      }

      setPrograms(programsData || [])
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

    fetchData()
  }, [fetchData, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleStatusChange = async (programId: number, status: string) => {
    try {
      const participantId = Number.parseInt(resolvedParams.id)
      const previousStatus = programStatuses[programId]

      // Optimistically update UI
      setProgramStatuses((prev) => ({
        ...prev,
        [programId]: status,
      }))

      const result = await updateRegistrationStatus(programId, participantId, status)

      if (result.error) {
        // Revert on error
        setProgramStatuses((prev) => {
          const newState = { ...prev }
          if (previousStatus) {
            newState[programId] = previousStatus
          } else {
            delete newState[programId]
          }
          return newState
        })

        toast({
          title: "Error",
          description: result.error.message || "Failed to update registration status",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Registration status updated to ${status}`,
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Status Update Failed",
        description: "There was an error updating the status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const participantId = Number.parseInt(resolvedParams.id)
      const updatedData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: Number.parseInt(formData.age),
        contact: formData.contact,
        email: formData.email,
        address: formData.address,
        program_ids: selectedPrograms,
      }

      await updateParticipant(participantId, updatedData)

      // Update all program statuses
      const statusUpdatePromises = selectedPrograms.map(async (programId) => {
        if (programStatuses[programId]) {
          try {
            await updateRegistrationStatus(programId, participantId, programStatuses[programId])
            return { programId, success: true }
          } catch (statusError) {
            console.error(`Error updating status for program ${programId}:`, statusError)
            return { programId, success: false, error: statusError }
          }
        }
        return { programId, success: true, skipped: true }
      })

      await Promise.all(statusUpdatePromises)

      toast({
        title: "Success",
        description: "Participant information has been updated successfully.",
      })

      setTimeout(() => {
        router.push(`/participants/${participantId}`)
      }, 1000)
    } catch (error: any) {
      console.error("Error updating participant:", error)

      let errorMessage = "There was an error updating the participant information."
      if (error.message?.includes("duplicate key") || error.code === "23505") {
        errorMessage =
          "There was an issue with program assignments. A participant can't be registered to the same program twice."
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  const enrolledPrograms = programs.filter((program) => selectedPrograms.includes(program.id))

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Edit Participant</h1>
              </div>
              <p className="text-gray-600">Update participant information and manage program registrations</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update the participant's basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={errors.first_name ? "border-red-500" : ""}
                      />
                      {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={errors.last_name ? "border-red-500" : ""}
                      />
                      {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
                    </div>
                  </div>

                  {/* Age and Contact */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="age" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Age *
                      </Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={handleChange}
                        min="1"
                        max="120"
                        className={errors.age ? "border-red-500" : ""}
                      />
                      {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Contact Number *
                      </Label>
                      <Input
                        id="contact"
                        name="contact"
                        placeholder="Enter contact number"
                        value={formData.contact}
                        onChange={handleChange}
                        className={errors.contact ? "border-red-500" : ""}
                      />
                      {errors.contact && <p className="text-sm text-red-600">{errors.contact}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Enter complete address (optional)"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Program Registrations Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Program Registrations</CardTitle>
                  <CardDescription>Manage registration status for enrolled programs</CardDescription>
                </CardHeader>
                <CardContent>
                  {enrolledPrograms.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>This participant is not enrolled in any programs yet.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {enrolledPrograms.map((program) => {
                        const status = programStatuses[program.id] || "Pending"
                        const config = statusConfig[status as keyof typeof statusConfig]
                        const StatusIcon = config.icon

                        return (
                          <div key={program.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{program.name}</h3>
                                <Badge variant={config.variant} className="flex items-center gap-1">
                                  <StatusIcon className="w-3 h-3" />
                                  {status}
                                </Badge>
                              </div>
                            </div>

                            <Separator className="my-3" />

                            <div className="flex items-center gap-3">
                              <Label htmlFor={`status-${program.id}`} className="text-sm font-medium">
                                Update Status:
                              </Label>
                              <Select
                                value={status}
                                onValueChange={(newStatus) => handleStatusChange(program.id, newStatus)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Approved">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      Approved
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Pending">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      Pending
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Waitlisted">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600" />
                                      Waitlisted
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Rejected">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      Rejected
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/participants/${resolvedParams.id}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-32">
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Participant"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
