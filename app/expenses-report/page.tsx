"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Download, TrendingUp, DollarSign, Calendar, Filter, PiggyBank } from "lucide-react"
import { getExpenses, getPrograms } from "@/lib/db"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Expense {
  id: number
  program_id: number
  description: string
  amount: number
  date: string
  category: string
  notes?: string
  created_at: string
  programs?: { name: string }
}

interface Program {
  id: number
  name: string
  budget: number
}

export default function ExpensesReportPage() {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const [isLoading, setIsLoading] = useState(true)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [programFilter, setProgramFilter] = useState("all")
  const [timeFrame, setTimeFrame] = useState("all") // all, month, year, custom
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [categoryFilter, setCategoryFilter] = useState("all")
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
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      toast({
        title: "Access Denied",
        description: "You must be logged in to view this page",
        variant: "destructive",
      })
      router.push("/login")
      return
    }
    fetchData()
  }, [fetchData, router, toast])

  // Filter expenses based on selected criteria
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    const expenseMonth = expenseDate.getMonth()
    const expenseYear = expenseDate.getFullYear()

    // Program filter
    const matchesProgram = programFilter === "all" || expense.program_id?.toString() === programFilter

    // Category filter
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

    // Time frame filter
    let matchesTimeFrame = true
    if (timeFrame === "month") {
      matchesTimeFrame = expenseMonth === parseInt(selectedMonth) && expenseYear === parseInt(selectedYear)
    } else if (timeFrame === "year") {
      matchesTimeFrame = expenseYear === parseInt(selectedYear)
    }

    return matchesProgram && matchesCategory && matchesTimeFrame
  })

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0
  const expenseCount = filteredExpenses.length

  const allocatedBudget = programFilter === "all"
    ? programs.reduce((sum, p) => sum + Number(p.budget || 0), 0)
    : programs.find(p => p.id.toString() === programFilter)?.budget || 0

  const remainingBudget = allocatedBudget - totalExpenses

  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || "Uncategorized"
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += Number(expense.amount)
    acc[category].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  // Group expenses by program
  const expensesByProgram = filteredExpenses.reduce((acc, expense) => {
    const programName = programs.find(p => p.id === expense.program_id)?.name || "No Program"
    if (!acc[programName]) {
      acc[programName] = { total: 0, count: 0 }
    }
    acc[programName].total += Number(expense.amount)
    acc[programName].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  // Get unique categories
  const categories = Array.from(new Set(expenses.map(e => e.category)))

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20
  
    // Helper function to format numbers
    const formatNumber = (num: number) => {
      if (typeof num !== 'number' || isNaN(num)) return '0.00'
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  
    // Helper function to format currency (now just numbers)
    const formatCurrency = (num: number) => formatNumber(num)
  
    // Header
    doc.setFontSize(20)
    doc.setTextColor(5, 150, 105) // Emerald color
    doc.text("Expenses Report", pageWidth / 2, yPos, { align: "center" })
    
    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPos, { align: "center" })
    
    yPos += 15
  
    // Summary Statistics
    doc.setFontSize(14)
    doc.setTextColor(5, 150, 105)
    doc.text("Summary Statistics", 14, yPos)
    yPos += 8
  
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    
    const summaryData = [
      ["Total Expenses", formatCurrency(Number(totalExpenses) || 0), `${expenseCount || 0} ${expenseCount === 1 ? 'expense' : 'expenses'}`],
      ["Average Expense", formatCurrency(Number(averageExpense) || 0), "Per expense"],
      ["Time Period", timeFrame === "all" ? "All Time" : timeFrame === "month" ? `${months[parseInt(selectedMonth) || 0]} ${selectedYear || new Date().getFullYear()}` : selectedYear || new Date().getFullYear(), programFilter === "all" ? "All programs" : programs.find(p => p.id.toString() === programFilter)?.name || ""],
      ["Budget Utilization", formatCurrency(Number(remainingBudget) || 0), `${formatNumber(Number(allocatedBudget) || 0)} allocated`]
    ]
  
    autoTable(doc, {
      startY: yPos,
      head: [["Metric", "Value", "Details"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    })
  
    yPos = (doc as any).lastAutoTable.finalY + 15
  
    // Expenses by Category
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }
  
    doc.setFontSize(14)
    doc.setTextColor(5, 150, 105)
    doc.text("Expenses by Category", 14, yPos)
    yPos += 8
  
    const categoryData = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => Number(b.total) - Number(a.total))
      .map(([category, data]) => [
        category,
        `${data.count || 0} ${data.count === 1 ? 'expense' : 'expenses'}`,
        formatCurrency(Number(data.total) || 0),
        `${(((Number(data.total) || 0) / (Number(totalExpenses) || 1)) * 100).toFixed(1)}%`
      ])
  
    if (categoryData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Category", "Count", "Amount", "Percentage"]],
        body: categoryData,
        theme: "striped",
        headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      })
  
      yPos = (doc as any).lastAutoTable.finalY + 15
    }
  
    // Detailed Expenses
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }
  
    doc.setFontSize(14)
    doc.setTextColor(5, 150, 105)
    doc.text("Detailed Expenses", 14, yPos)
    yPos += 8
  
    const expenseData = filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(expense => [
        new Date(expense.date).toLocaleDateString(),
        programs.find(p => p.id === expense.program_id)?.name || "N/A",
        expense.description,
        expense.category,
        formatCurrency(Number(expense.amount) || 0)
      ])
  
    // Add total row
    expenseData.push([
      "",
      "",
      "",
      "Total:",
      formatCurrency(Number(totalExpenses) || 0)
    ])
  
    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Program", "Description", "Category", "Amount"]],
      body: expenseData,
      theme: "striped",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 50 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30, halign: "right" }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        // Make the total row bold
        if (data.row.index === expenseData.length - 1) {
          data.cell.styles.fontStyle = "bold"
          data.cell.styles.fillColor = [243, 244, 246]
        }
      }
    })
  
    // Footer on last page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        "SK San Francisco Program Management System - Expenses Report",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      )
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: "right" }
      )
    }
  
    // Save the PDF
    doc.save(`expenses-report-${new Date().toISOString().split('T')[0]}.pdf`)
  
    toast({
      title: "Export Successful",
      description: "Expenses report PDF has been downloaded",
    })
  }


  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700">Loading Report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 pt-[57px]">
        <DashboardSidebar />
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 min-h-screen md:ml-64">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Expenses Report</h1>
              <p className="text-muted-foreground mt-1">Comprehensive expense analysis and reporting</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter expenses by program, time frame, and category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Program Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Program</label>
                  <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger className="bg-white">
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

                {/* Time Frame Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Frame</label>
                  <Select value={timeFrame} onValueChange={setTimeFrame}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Time Frame" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="month">Specific Month</SelectItem>
                      <SelectItem value="year">Specific Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Selector (shown when timeFrame is "month") */}
                {timeFrame === "month" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Year Selector (shown when timeFrame is "month" or "year") */}
                {(timeFrame === "month" || timeFrame === "year") && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Statistics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{averageExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per expense
                </p>
              </CardContent>
            </Card>

                        <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Period</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {timeFrame === "all" && "All Time"}
                  {timeFrame === "month" && `${months[parseInt(selectedMonth)]} ${selectedYear}`}
                  {timeFrame === "year" && selectedYear}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {programFilter === "all" ? "All programs" : programs.find(p => p.id.toString() === programFilter)?.name}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : ''}`}>
                  ₱{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  ₱{allocatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })} allocated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Expenses by Category */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Breakdown of expenses across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(expensesByCategory).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No expenses found for the selected filters</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(expensesByCategory)
                    .sort(([, a], [, b]) => b.total - a.total)
                    .map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">
                              {data.count} {data.count === 1 ? 'expense' : 'expenses'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full"
                              style={{ width: `${(data.total / totalExpenses) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-bold">₱{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-muted-foreground">
                            {((data.total / totalExpenses) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses by Program */}
          {programFilter === "all" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Expenses by Program</CardTitle>
                <CardDescription>Breakdown of expenses across different programs</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(expensesByProgram).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No expenses found</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(expensesByProgram)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([program, data]) => (
                        <div key={program} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{program}</span>
                              <span className="text-sm text-muted-foreground">
                                {data.count} {data.count === 1 ? 'expense' : 'expenses'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(data.total / totalExpenses) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="font-bold">₱{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="text-xs text-muted-foreground">
                              {((data.total / totalExpenses) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Detailed Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Expenses</CardTitle>
              <CardDescription>Complete list of expenses matching your filters</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No expenses found for the selected filters</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Date</th>
                        <th className="text-left p-2 font-medium">Program</th>
                        <th className="text-left p-2 font-medium">Description</th>
                        <th className="text-left p-2 font-medium">Category</th>
                        <th className="text-right p-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="p-2 text-sm">{programs.find(p => p.id === expense.program_id)?.name || "N/A"}</td>
                            <td className="p-2 text-sm">{expense.description}</td>
                            <td className="p-2 text-sm">{expense.category}</td>
                            <td className="p-2 text-sm text-right font-medium">₱{expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      <tr className="font-bold bg-gray-50">
                        <td colSpan={4} className="p-2 text-right">Total:</td>
                        <td className="p-2 text-right">₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
