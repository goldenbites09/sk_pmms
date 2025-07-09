"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
import { ArrowLeft } from "lucide-react"
import { createProgram, updateProgram } from "@/lib/db"

export default function NewProgramPage() {
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
  const router = useRouter()
  const { toast } = useToast()

  const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2)
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

    setIsLoading(false)
  }, [router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log('Starting form submission')
      
      if (!formData.name || !formData.description || !formData.date || !startTime || !endTime || !formData.location || !formData.budget || !formData.status) {
        throw new Error("Please fill in all required fields")
      }
      
      // Initialize fileUrl variable
      let fileUrl = ""
      
      // Check if there's a file to upload
      const file = fileInputRef.current?.files?.[0]
      
      // Upload file first if present
      if (file) {
        console.log('File selected for upload:', file.name, 'Size:', file.size, 'Type:', file.type)
        
        // Use a direct approach without dynamic imports
        const { createClient } = await import("@/lib/supabase");
            const supabase = createClient();
        
        // Create a unique filename
        const timestamp = new Date().getTime()
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fileName = `program_${timestamp}_${safeName}`
        
        console.log('Attempting to upload file with name:', fileName)
        
        // Note: The bucket must be created in the Supabase dashboard first
        // We'll assume the bucket exists and handle any errors if it doesn't
        
        // Upload the file with direct error handling
        const uploadResult = await supabase.storage
          .from('program-files')
          .upload(fileName, file, { 
            upsert: true, 
            cacheControl: '3600'
          })
          
        if (uploadResult.error) {
          console.error('Upload error:', uploadResult.error)
          throw new Error(`File upload failed: ${uploadResult.error.message}`)
        }
        
        console.log('File uploaded successfully')
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('program-files')
          .getPublicUrl(fileName)
          
        fileUrl = urlData.publicUrl
        console.log('File URL:', fileUrl)
      }
      
      // Create the program with file URL already included
      const program = {
        name: formData.name,
        description: formData.description,
        date: formData.date,
        time: `${startTime} - ${endTime}`,
        location: formData.location,
        budget: parseFloat(formData.budget),
        status: formData.status,
        file_urls: fileUrl, // Include file URL directly
      }
      
      console.log('Creating program with data:', program)
      const createdProgram = await createProgram(program)
      console.log('Program created successfully with ID:', createdProgram?.id)
      
      toast({
        title: "Success",
        description: "Program created successfully" + (fileUrl ? " with file attachment" : ""),
      })
      
      // Navigate after success, but with a small delay to ensure toasts are seen
      setTimeout(() => {
        router.push("/programs")
      }, 500)
    } catch (error) {
      console.error('Program creation failed:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error creating the program",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
              <Button variant="outline" size="icon" onClick={() => router.push("/programs")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Create New Program</h1>
            </div>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Program Information</CardTitle>
                  <CardDescription>Enter the details for the new program</CardDescription>
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
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <select className="w-full border rounded px-2 py-1" value={startTime} onChange={e => setStartTime(e.target.value)} required>
                        <option value="">Select start time</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <select className="w-full border rounded px-2 py-1" value={endTime} onChange={e => setEndTime(e.target.value)} required>
                        <option value="">Select end time</option>
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (₱)</Label>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        placeholder="Enter budget amount"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={handleStatusChange}
                        defaultValue="Planning"
                      >
                        <SelectTrigger id="status" className="w-full bg-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="w-full bg-white z-50">
                          <SelectItem value="Planning" className="cursor-pointer hover:bg-gray-100">Planning</SelectItem>
                          <SelectItem value="Active" className="cursor-pointer hover:bg-gray-100">Active</SelectItem>
                          <SelectItem value="Completed" className="cursor-pointer hover:bg-gray-100">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File (optional)</Label>
                    <input ref={fileInputRef} id="file" name="file" type="file" className="block w-full" accept="*" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.push("/programs")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Program"}
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
