"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, getParticipants, getExpenses } from "@/lib/db"
import type { Program, Participant, Expense } from "@/lib/schema"
import { supabase } from "@/lib/supabase"
import { Calendar, Users, Wallet, TrendingUp, Activity } from "lucide-react"

export default function UserDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [programs, setPrograms] = useState<Program[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [totalBudget, setTotalBudget] = useState(0)
  const [remainingBudget, setRemainingBudget] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to view this page",
          variant: "destructive",
        })
        router.push("/login")
        return
      }
      fetchData()
    }
    checkAuth()
  }, [router, toast])

  const fetchData = async () => {
    try {
      const [programsData, participantsData, expensesData] = await Promise.all([
        getPrograms(),
        getParticipants(),
        getExpenses(),
      ])
      setPrograms(programsData)
      setParticipants(participantsData)
      setExpenses(expensesData)

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const totalPrograms = programs.length
  const activePrograms = programs.filter((p) => p.status === "Active").length
  const totalParticipants = participants.length
  const recentPrograms = [...programs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50 min-h-screen overflow-hidden">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Programs Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-700">Total Programs</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800 mb-1">{totalPrograms}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 text-green-500 mr-1" />
                      <p className="text-xs text-green-600 font-medium">Active: {activePrograms}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-700">Participants</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800 mb-1">{totalParticipants}</div>
                  <p className="text-xs text-blue-600 font-medium">Total registered</p>
                </CardContent>
              </Card>

              {/* Total Budget Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-emerald-700">Total Budget</CardTitle>
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Wallet className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-800 mb-1">₱{totalBudget.toLocaleString()}</div>
                  <div className="flex items-center">
                    <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                    <p className="text-xs text-emerald-600 font-medium">
                      Remaining: ₱{remainingBudget.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>



            </div>

            <Tabs defaultValue="programs" className="space-y-4">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                >
                  Recent Programs
                </TabsTrigger>
                <TabsTrigger
                  value="expenses"
                  className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                >
                  Recent Expenses
                </TabsTrigger>
              </TabsList>

              <TabsContent value="programs" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentPrograms.map((program) => (
                    <Card key={program.id} className="hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-gray-800">{program.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{new Date(program.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">Budget: ₱{program.budget?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Status:{" "}
                            <span
                              className={`font-medium ${program.status === "Active" ? "text-green-600" : "text-gray-600"}`}
                            >
                              {program.status}
                            </span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentExpenses.map((expense) => (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow duration-200">
                      <CardHeader>
                        <CardTitle className="text-gray-800">{expense.description}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">Amount: ₱{expense.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Category: {expense.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
