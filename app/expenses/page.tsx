"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search } from "lucide-react"
import { getExpenses, getPrograms } from "@/lib/db"

export default function ExpensesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState<any[]>([])
  const [programs, setPrograms] = useState<Array<{ id: number; name: string }>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("all") // Add field-specific search
  const [programFilter, setProgramFilter] = useState("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const [expensesData, programsData] = await Promise.all([
        getExpenses(),
        getPrograms(),
      ])

      setExpenses(expensesData)
      setPrograms(programsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load expenses data",
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

    // Set admin status for conditional rendering
    setIsAdmin(userRole === "admin" || userRole === "skofficial")

    // Fetch expenses and programs data
    fetchData()
  }, [fetchData, router, toast])

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense)
    setIsModalOpen(true)
  }

  const filteredExpenses = expenses.filter((expense) => {
    // Field-specific search based on selected search field
    let matchesSearch = false;
    
    if (searchField === "all") {
      // Search across all fields
      matchesSearch = (
        expense.amount?.toString().includes(searchTerm) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchField === "amount") {
      matchesSearch = expense.amount?.toString().includes(searchTerm);
    } else if (searchField === "description") {
      matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "date") {
      matchesSearch = expense.date?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "category") {
      matchesSearch = expense.category?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "notes") {
      matchesSearch = expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    const matchesProgram = programFilter === "all" || expense.program_id?.toString() === programFilter

    return matchesSearch && matchesProgram
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <DashboardSidebar />
        <div className="flex-1 overflow-y-auto">
          <DashboardHeader />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        <DashboardHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Expenses</h1>
            {isAdmin && (
              <Link href="/expenses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
              <CardTitle>Expense Management</CardTitle>
              <CardDescription>View and manage all program expenses</CardDescription>
                </div>
                <div className="bg-muted/50 rounded-md px-4 py-2 font-bold">
                  Total Amount: ₱{totalAmount.toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${searchField === 'all' ? 'expenses' : searchField}...`}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={searchField}
                  onValueChange={setSearchField}
                >
                  <SelectTrigger className="w-full md:w-[180px] bg-white">
                    <SelectValue placeholder="Search in..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fields</SelectItem>
                    <SelectItem value="description">Description</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-white">
                    <SelectValue placeholder="Select Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4">
                {filteredExpenses.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No expenses found matching your criteria</p>
                  </div>
                )}
                {filteredExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg truncate">{expense.description}</div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                        <span>Program: {programs.find((p) => p.id === expense.program_id)?.name || "Unknown Program"}</span>
                        <span>Amount: ₱{expense.amount.toLocaleString()}</span>
                        <span>Date: {expense.date}</span>
                        <span>Category: {expense.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button size="icon" variant="outline" title="View" onClick={() => handleViewExpense(expense)}>
                        <span className="sr-only">View</span>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z"/></svg>
                      </Button>
                      {isAdmin && <Link href={`/expenses/${expense.id}/edit`}><Button size="icon" variant="outline" title="Edit"><span className="sr-only">Edit</span><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232a3 3 0 0 1 4.243 4.243L7.5 21H3v-4.5l12.232-12.268Z"/></svg></Button></Link>}
                      {isAdmin && <Button size="icon" variant="destructive" title="Delete" onClick={async () => {if(confirm('Are you sure you want to delete this expense?')){await import('@/lib/db').then(({deleteExpense})=>deleteExpense(expense.id));router.refresh();}}}><span className="sr-only">Delete</span><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg></Button>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

                {/* Modal for expense details */}
                {isModalOpen && selectedExpense && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-10 relative" onClick={e => e.stopPropagation()}>
                      <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setIsModalOpen(false)}>&times;</button>
                      <h2 className="text-3xl font-bold mb-4">{selectedExpense.description}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-lg font-semibold">₱{selectedExpense.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="text-lg">{selectedExpense.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-lg capitalize">{selectedExpense.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="text-lg">{programs.find((p) => p.id === selectedExpense.program_id)?.name || "Unknown Program"}</p>
                    </div>
                  </div>
                  {selectedExpense.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-lg">{selectedExpense.notes}</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
