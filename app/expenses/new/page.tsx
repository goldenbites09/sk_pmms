"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, createExpense } from "@/lib/db"

export default function NewExpensePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "",
    category: "",
    program_id: "",
    notes: "",
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const fetchPrograms = useCallback(async () => {
    try {
      const programsData = await getPrograms()
      setPrograms(programsData)
    } catch (error) {
      console.error("Error fetching programs:", error)
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

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

    // Check if user has admin access
    if (userRole !== "admin" && userRole !== "skofficial") {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      })
      router.push("/programs")
      return
    }

    // Fetch programs data
    fetchPrograms()

    // Set program_id from URL parameter if available
    const programId = searchParams.get("program")
    if (programId) {
      setFormData((prev) => ({ ...prev, program_id: programId }))
    }

    // Set default date to today
    const today = new Date().toISOString().split("T")[0]
    setFormData((prev) => ({ ...prev, date: today }))
  }, [fetchPrograms, router, toast, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProgramChange = (value: string) => {
    setFormData((prev) => ({ ...prev, program_id: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.description || !formData.amount || !formData.date || !formData.category || !formData.program_id) {
        throw new Error("Please fill in all required fields")
      }

      // Create expense
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        program_id: parseInt(formData.program_id),
      })

      toast({
        title: "Success",
        description: "Expense added successfully",
      })

      // Redirect to program detail page if program_id is provided
      if (formData.program_id) {
        router.push(`/programs/${formData.program_id}`)
      } else {
        router.push("/expenses")
      }
    } catch (error) {
      console.error("Error creating expense:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add expense",
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
              <div className="space-y-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
                <p className="text-lg font-semibold text-slate-700">Loading...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen md:ml-64">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Add New Expense</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Information</CardTitle>
              <CardDescription>Enter the details of the new expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter expense description"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₱) *</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
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
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full bg-white z-50">
                        <SelectItem value="Supplies" className="cursor-pointer hover:bg-gray-100">Supplies</SelectItem>
                        <SelectItem value="Equipment" className="cursor-pointer hover:bg-gray-100">Equipment</SelectItem>
                        <SelectItem value="Venue" className="cursor-pointer hover:bg-gray-100">Venue</SelectItem>
                        <SelectItem value="Food" className="cursor-pointer hover:bg-gray-100">Food</SelectItem>
                        <SelectItem value="Transportation" className="cursor-pointer hover:bg-gray-100">Transportation</SelectItem>
                        <SelectItem value="Other" className="cursor-pointer hover:bg-gray-100">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="program">Program *</Label>
                    <Select value={formData.program_id} onValueChange={handleProgramChange}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="w-full bg-white z-50">
                        {programs.map((program) => (
                          <SelectItem 
                            key={program.id} 
                            value={program.id.toString()}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Enter any additional notes"
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
                    {isSubmitting ? "Adding..." : "Add Expense"}
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
