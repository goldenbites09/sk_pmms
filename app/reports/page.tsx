"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText, Plus, Search } from "lucide-react"
import { getReports } from "@/lib/db"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState("all") // Add field-specific search
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    try {
      const reportsData = await getReports()
      setReports(reportsData)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports",
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

    // Fetch reports data
    fetchData()
  }, [fetchData, router, toast])

  const filteredReports = reports.filter((report) => {
    // Field-specific search based on selected search field
    let matchesSearch = false;
    
    if (searchField === "all") {
      // Search across all fields
      matchesSearch = (
        report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.date?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (searchField === "name") {
      matchesSearch = report.name?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "description") {
      matchesSearch = report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchField === "date") {
      matchesSearch = report.date?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter

    return matchesSearch && matchesCategory
  })

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
            <h1 className="text-2xl font-bold">Reports</h1>
            {isAdmin && (
              <Link href="/reports/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </Link>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>View and manage all program reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${searchField === 'all' ? 'reports' : searchField}...`}
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
                    <SelectItem value="name">Report Name</SelectItem>
                    <SelectItem value="description">Description</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="program">Program Reports</SelectItem>
                    <SelectItem value="financial">Financial Reports</SelectItem>
                    <SelectItem value="participant">Participant Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReports.map((report) => (
                    <Link href={`/reports/${report.id}`} key={report.id}>
                      <Card className="h-full hover:bg-gray-50 transition-colors cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{report.name}</CardTitle>
                          <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Category:</span>
                              <span className="capitalize">{report.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date:</span>
                              <span>{report.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Generated by:</span>
                              <span>{report.generated_by}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {filteredReports.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No reports found matching your criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
