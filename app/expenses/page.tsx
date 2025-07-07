"use client"

import { useEffect, useState, useCallback, ChangeEvent } from "react"
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
  useEffect(() => {
    document.body.classList.add('no-scroll');

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

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
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex h-full items-center justify-center">
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
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
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${searchField === 'all' ? 'expenses' : 'by ' + searchField}...`}
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={programFilter} 
                  onValueChange={setProgramFilter}
                >
                  <SelectTrigger className="w-full md:w-[200px] bg-white">
                    <SelectValue placeholder="Filter by Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programs.map((program) => (
                      <SelectItem 
                        key={program.id} 
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4">
                {filteredExpenses.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No expenses found matching your criteria.</p>
                  </div>
                ) : (
                  filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="cursor-pointer flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition-colors gap-4"
                      onClick={() => handleViewExpense(expense)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-lg truncate">{expense.description}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span>Amount: ₱{expense.amount.toLocaleString()}</span>
                          <span>Date: {new Date(expense.date).toLocaleDateString()}</span>
                          <span className="capitalize">Category: {expense.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        {isAdmin && (
                          <>
                            <Link href={`/expenses/${expense.id}/edit`}>
                              <Button size="sm" variant="outline">Edit</Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={async () => {
                                if(confirm('Are you sure you want to delete this expense?')) {
                                  await import('@/lib/db').then(({deleteExpense}) => deleteExpense(expense.id));
                                  fetchData(); // Refetch data after deletion
                                  toast({ title: "Success", description: "Expense deleted successfully." });
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modal for expense details */}
          {isModalOpen && selectedExpense && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setIsModalOpen(false)}>
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setIsModalOpen(false)}>&times;</button>
                <h2 className="text-3xl font-bold mb-4">{selectedExpense.description}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg mb-6">
                    <div><span className="font-semibold text-muted-foreground">Amount:</span> ₱{selectedExpense.amount.toLocaleString()}</div>
                    <div><span className="font-semibold text-muted-foreground">Date:</span> {new Date(selectedExpense.date).toLocaleDateString()}</div>
                    <div className="capitalize"><span className="font-semibold text-muted-foreground">Category:</span> {selectedExpense.category}</div>
                    <div><span className="font-semibold text-muted-foreground">Program:</span> {programs.find((p) => p.id === selectedExpense.program_id)?.name || "N/A"}</div>
                    {selectedExpense.notes && <div className="md:col-span-2"><span className="font-semibold text-muted-foreground">Notes:</span> {selectedExpense.notes}</div>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
