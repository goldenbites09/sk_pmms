"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Trash } from "lucide-react"
import { getProgram, updateProgram, deleteProgram } from "@/lib/db"
import { supabase } from "@/lib/supabase"
import { use } from "react"

interface PageParams {
  id: string;
}

export default function EditProgramPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    budget: "",
    status: "Planning",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentFileUrl, setCurrentFileUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const fetchProgram = useCallback(async () => {
    try {
      const programId = Number.parseInt(resolvedParams.id)
      const programData = await getProgram(programId)

      setFormData({
        name: programData.name,
        description: programData.description,
        date: programData.date,
        time: programData.time,
        location: programData.location,
        budget: programData.budget.toString(),
        status: programData.status,
      })
      
      // Store the current file URL if it exists
      if (programData.file_urls) {
        setCurrentFileUrl(programData.file_urls)
      }
    } catch (error) {
      console.error("Error fetching program:", error)
      toast({
        title: "Error",
        description: "Failed to load program data",
        variant: "destructive",
      })
      router.push("/programs")
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

    // Fetch program data
    fetchProgram()
  }, [fetchProgram, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const programId = Number.parseInt(resolvedParams.id)
      
      // Handle file upload if there's a new file
      let fileUrl = currentFileUrl // Default to current file URL
      const file = fileInputRef.current?.files?.[0]
      
      if (file) {
        // First delete the old file if exists
        if (currentFileUrl) {
          // Extract the file name from the URL
          const oldFileName = currentFileUrl.split('/').pop()
          if (oldFileName) {
            try {
              await supabase.storage.from('program-files').remove([oldFileName])
              console.log('Old file deleted')
            } catch (error) {
              console.error('Error deleting old file:', error)
              // Continue even if old file deletion fails
            }
          }
        }
        
        // Upload the new file
        const fileName = `${Date.now()}_${file.name}`
        const { data, error } = await supabase.storage.from("program-files").upload(fileName, file)
        
        if (error) {
          console.error('Error uploading file:', error)
          throw new Error('Failed to upload file')
        }
        
        // Get public URL
        const { data: publicUrlData } = await supabase.storage.from("program-files").getPublicUrl(fileName)
        fileUrl = publicUrlData?.publicUrl || ""
      }
      
      const updatedProgram = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        budget: parseFloat(formData.budget),
        status: formData.status,
        file_urls: fileUrl, // Add the file URL
      }

      await updateProgram(programId, updatedProgram)

      toast({
        title: "Success",
        description: "Program updated successfully",
      })

      router.push(`/programs/${programId}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating program:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update program",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteProgram(Number.parseInt(resolvedParams.id))
      toast({
        title: "Success",
        description: "Program deleted successfully",
      })
      router.push("/programs")
      router.refresh() // Force a refresh of the page
    } catch (error) {
      console.error("Error deleting program:", error)
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

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
              <Button variant="outline" size="icon" onClick={() => router.push(`/programs/${resolvedParams.id}`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Edit Program</h1>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                  <CardDescription>Update the details of the program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Program Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter program name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter program description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        name="time"
                        placeholder="Enter time (e.g., 9:00 AM - 4:00 PM)"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Enter program location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        placeholder="Enter program budget"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={handleSelectChange}
                        defaultValue="Planning"
                      >
                        <SelectTrigger id="status" className="w-full bg-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="file">Program File</Label>
                    {currentFileUrl && (
                      <div className="mb-2 text-sm">
                        <p>Current file: <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 underline">View current file</a></p>
                        <p className="text-gray-500">Upload a new file to replace the current one, or leave empty to keep the current file.</p>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef} 
                      id="file" 
                      name="file" 
                      type="file" 
                      className="block w-full" 
                      accept="*" 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="destructive" type="button" onClick={handleDelete} disabled={isDeleting}>
                    <Trash className="h-4 w-4 mr-2" />
                    {isDeleting ? "Deleting..." : "Delete Program"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => router.push(`/programs/${resolvedParams.id}`)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
