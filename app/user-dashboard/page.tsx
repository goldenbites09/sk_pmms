"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { getPrograms, getParticipants, getExpenses } from "@/lib/db"
import type { Program, Participant, Expense } from "@/lib/schema"
import { supabase } from "@/lib/supabase"
import { Calendar, Users, Wallet, TrendingUp, Activity, Target, BarChart3, PieChartIcon } from "lucide-react"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Dashboard...</p>
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

  const budgetUtilization = totalBudget > 0 ? ((totalBudget - remainingBudget) / totalBudget) * 100 : 0

  // Monthly program trend data
  const monthlyData = programs.reduce(
    (acc, program) => {
      const month = new Date(program.date).toLocaleString("default", { month: "short" })
      const existing = acc.find((item) => item.month === month)
      if (existing) {
        existing.programs += 1
      } else {
        acc.push({ month, programs: 1 })
      }
      return acc
    },
    [] as { month: string; programs: number }[],
  )

  // Expense category breakdown
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const existing = acc.find((item) => item.category === expense.category)
      if (existing) {
        existing.amount += expense.amount
      } else {
        acc.push({ category: expense.category, amount: expense.amount })
      }
      return acc
    },
    [] as { category: string; amount: number }[],
  )

  const COLORS = ["#0d9488", "#1e40af", "#ea580c", "#dc2626", "#7c3aed"]

  // Program status distribution
  const statusData = [
    { name: "Active", value: programs.filter((p) => p.status === "Active").length },
    { name: "Completed", value: programs.filter((p) => p.status === "Completed").length },
    { name: "Planned", value: programs.filter((p) => p.status === "Planning").length },
  ].filter((item) => item.value > 0)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden md:ml-64">
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 border-b-4 border-teal-500">
            <div className="absolute inset-0 opacity-10">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/513827381_122211043430095491_4319093587853470136_n-EYqWdjK11GRyC4F14zAmfp3tMtfC91.jpg"
                alt="SK San Francisco Background"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative px-4 sm:px-6 py-4 sm:py-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">SK San Francisco Dashboard</h1>
                <p className="text-xs sm:text-sm text-teal-100 font-medium">San Francisco, Naga City • Real-time Analytics</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-teal-600 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Programs</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalPrograms}</p>
                      <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                        <Activity className="h-3 w-3" />
                        <span>{activePrograms} Active</span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 bg-teal-50 rounded-xl">
                      <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-600 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Participants</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalParticipants}</p>
                      <p className="text-xs text-blue-600 font-medium">Total Registered</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-xl">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-600 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Budget</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">₱{totalBudget.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <TrendingUp className="h-3 w-3" />
                        <span>₱{remainingBudget.toLocaleString()} Left</span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-50 rounded-xl">
                      <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-violet-600 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Budget Used</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{budgetUtilization.toFixed(1)}%</p>
                      <Progress value={budgetUtilization} className="h-2 bg-slate-100" />
                    </div>
                    <div className="p-2 sm:p-3 bg-violet-50 rounded-xl">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <Card className="shadow-md border border-slate-200 bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">Monthly Programs</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Distribution by month</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ChartContainer
                    config={{
                      programs: {
                        label: "Programs",
                        color: "#0d9488",
                      },
                    }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="programs" fill="#0d9488" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="shadow-md border border-slate-200 bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <PieChartIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">Program Status</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Current distribution</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ChartContainer
                    config={{
                      active: { label: "Active", color: "#0d9488" },
                      completed: { label: "Completed", color: "#1e40af" },
                      planned: { label: "Planned", color: "#ea580c" },
                    }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="shadow-md border border-slate-200 bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Wallet className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">Expense Breakdown</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">Spending by category</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ChartContainer
                    config={{
                      amount: {
                        label: "Amount (₱)",
                        color: "#ea580c",
                      },
                    }}
                    className="h-[220px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={11} />
                        <YAxis dataKey="category" type="category" stroke="#64748b" width={80} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="amount" fill="#ea580c" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-2 border-slate-200 bg-white">
              <Tabs defaultValue="programs" className="w-full">
                <CardHeader className="border-b-2 border-slate-100 pb-0 bg-gradient-to-r from-slate-50 to-white">
                  <TabsList className="bg-white border border-slate-200 p-1 h-auto shadow-sm">
                    <TabsTrigger
                      value="programs"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md text-sm font-bold px-6 sm:px-8 py-2.5 rounded transition-all"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Recent Programs
                    </TabsTrigger>
                    <TabsTrigger
                      value="expenses"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md text-sm font-bold px-6 sm:px-8 py-2.5 rounded transition-all"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Recent Expenses
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6 pb-6 bg-gradient-to-b from-white to-slate-50">
                  <TabsContent value="programs" className="mt-0">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {recentPrograms.map((program) => (
                        <Link href={`/programs/${program.id}`} key={program.id}>
                          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full border-2 border-slate-200 hover:border-teal-400 bg-white group overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600 group-hover:h-2 transition-all duration-300"></div>
                            <CardHeader className="pb-3 pt-4 px-5">
                              <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-tight">
                                {program.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 space-y-3">
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-teal-600" />
                                <span className="font-semibold">{new Date(program.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                <Wallet className="h-4 w-4 text-orange-600" />
                                <span className="font-semibold">₱{program.budget?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span
                                  className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                                    program.status === "Active"
                                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                                      : program.status === "Completed"
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                        : "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                                  }`}
                                >
                                  {program.status}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="expenses" className="mt-0">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      {recentExpenses.map((expense) => (
                        <Link href="/expenses" key={expense.id}>
                          <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full border-2 border-slate-200 hover:border-orange-400 bg-white group overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600 group-hover:h-2 transition-all duration-300"></div>
                            <CardHeader className="pb-3 pt-4 px-5">
                              <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-2 leading-tight">
                                Expense #{expense.id}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="px-5 pb-5 space-y-3">
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                <Calendar className="h-4 w-4 text-orange-600" />
                                <span className="font-semibold">{new Date(expense.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                <Wallet className="h-4 w-4 text-teal-600" />
                                <span className="font-semibold">₱{expense.amount.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
                                  {expense.category}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
