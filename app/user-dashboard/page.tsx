"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, getParticipants, getExpenses } from "@/lib/db"
import type { Program, Participant, Expense } from "@/lib/schema"
import { supabase } from "@/lib/supabase"

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
        getExpenses()
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
  const activePrograms = programs.filter(p => p.status === "Active").length
  const totalParticipants = participants.length
  const recentPrograms = [...programs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)
  const recentExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">User Dashboard</h1>
            </div>
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
                  <CardTitle className="text-sm font-medium">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">Total registered</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱{totalBudget.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Remaining: ₱{remainingBudget.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="programs" className="space-y-4">
              <TabsList>
                <TabsTrigger value="programs">Recent Programs</TabsTrigger>
                <TabsTrigger value="expenses">Recent Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value="programs" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentPrograms.map((program) => (
                    <Card key={program.id}>
                      <CardHeader>
                        <CardTitle>{program.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(program.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Budget: ₱{program.budget?.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {program.status}
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
                    <Card key={expense.id}>
                      <CardHeader>
                        <CardTitle>{expense.description}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Amount: ₱{expense.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Category: {expense.category}
                          </p>
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
