"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, getParticipants, getExpenses, getUsers } from "@/lib/db"
import type { Program, Participant, Expense } from "@/lib/schema"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<Program[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [remainingBudget, setRemainingBudget] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userRole = localStorage.getItem("userRole")
    if (!isLoggedIn || (userRole !== "admin" && userRole !== "skofficial")) {
      toast({
        title: "Access Denied",
        description: "You must be logged in as an admin or SK Official to view this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    async function fetchData() {
      try {
        const programsData = await getPrograms()
        const participantsData = await getParticipants()
        const expensesData = await getExpenses()
        setPrograms(programsData)
        setParticipants(participantsData)
        setExpenses(expensesData)
        // Calculate total and remaining budget
        const total = programsData.reduce((sum, p) => sum + (p.budget || 0), 0)
        const spent = expensesData.reduce((sum, e) => sum + (e.amount || 0), 0)
        setTotalBudget(total)
        setRemainingBudget(total - spent)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router, toast])

  useEffect(() => {
    async function fetchUsers() {
      const users = await getUsers();
      console.log(users);
    }
    fetchUsers();
  }, []);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // Calculate stats
  const totalPrograms = programs.length
  const activePrograms = programs.filter(p => p.status === "Active").length
  const totalParticipants = participants.length
  // Sort programs and expenses by date descending
  const recentPrograms = [...programs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPrograms}</div>
                  <p className="text-xs text-muted-foreground">Active: {activePrograms}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activePrograms}</div>
                  <p className="text-xs text-muted-foreground">Total: {totalPrograms}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">₱{remainingBudget.toLocaleString()} remaining</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Programs</CardTitle>
                    <CardDescription>Overview of recently created or updated programs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 text-sm font-medium">
                        <div>Program Name</div>
                        <div>Date</div>
                        <div>Status</div>
                      </div>
                      {recentPrograms.map((program) => (
                        <div key={program.id} className="grid grid-cols-3 items-center gap-4 text-sm">
                          <div>{program.name}</div>
                          <div>{new Date(program.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${program.status === 'Active' ? 'bg-emerald-500 text-primary-foreground hover:bg-emerald-500/80' : program.status === 'Planning' ? 'bg-yellow-500 text-primary-foreground hover:bg-yellow-500/80' : 'bg-gray-500 text-primary-foreground hover:bg-gray-500/80'}`}>{program.status}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Overview of recently recorded expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 text-sm font-medium">
                        <div>Description</div>
                        <div>Program</div>
                        <div>Date</div>
                        <div>Amount</div>
                      </div>
                      {recentExpenses.map((expense) => {
                        const program = programs.find(p => p.id === expense.program_id)
                        return (
                          <div key={expense.id} className="grid grid-cols-4 items-center gap-4 text-sm">
                            <div>{expense.description}</div>
                            <div>{program ? program.name : 'N/A'}</div>
                            <div>{new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div>₱{expense.amount.toLocaleString()}</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
