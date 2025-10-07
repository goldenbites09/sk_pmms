"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
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
import { getExpense, updateExpense, deleteExpense, getPrograms } from "@/lib/db"
import { use } from "react"

// Expense categories
const categories = ["Facilities", "Food", "Services", "Supplies", "Transportation", "Other"]

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    description: "",
    programId: "",
    amount: "",
    date: "",
    category: "",
    notes: "",
  })
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const expenseId = Number.parseInt(resolvedParams.id)
      const [expenseData, programsData] = await Promise.all([
        getExpense(expenseId),
        getPrograms(),
      ])

      setFormData({
        description: expenseData.description,
        programId: expenseData.program_id.toString(),
        amount: expenseData.amount.toString(),
        date: expenseData.date,
        category: expenseData.category,
        notes: expenseData.notes || "",
      })

      setPrograms(programsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load expense data",
        variant: "destructive",
      })
      router.push("/expenses")
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

    // Fetch expense and program data
    fetchData()
  }, [fetchData, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, programId: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const expenseId = Number.parseInt(resolvedParams.id)
      const updatedExpense = {
        description: formData.description,
        program_id: parseInt(formData.programId),
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        notes: formData.notes || null,
      }

      await updateExpense(expenseId, updatedExpense)

      toast({
        title: "Success",
        description: "Expense updated successfully",
      })

      router.push("/expenses")
    } catch (error) {
      console.error("Error updating expense:", error)
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteExpense(Number.parseInt(resolvedParams.id))
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
      router.push("/expenses")
      router.refresh() // Force a refresh of the page
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      })
    } finally {
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Edit Expense</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>Update the expense information below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Select value={formData.programId} onValueChange={handleSelectChange}>
                        <SelectTrigger id="program" className="w-full bg-white">
                          <SelectValue placeholder="Select program" />
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

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                      />
                    </div>

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
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select category" />
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

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete Expense"}
                    </Button>
                    <div className="space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
