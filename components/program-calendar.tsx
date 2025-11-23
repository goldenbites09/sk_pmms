"use client"

import { useState, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Program {
  id: number
  name: string
  date: string
  time: string
  location: string
  budget: number
  status: string
  description: string
  participants?: number
}

interface ProgramCalendarProps {
  programs: Program[]
}

export default function ProgramCalendar({ programs }: ProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // Get programs for the selected date
  const programsForSelectedDate = useMemo(() => {
    return programs.filter((program) => {
      const programDate = new Date(program.date)
      return (
        programDate.getDate() === selectedDate.getDate() &&
        programDate.getMonth() === selectedDate.getMonth() &&
        programDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }, [programs, selectedDate])

  // Get all dates that have programs
  const datesWithPrograms = useMemo(() => {
    return programs.map((program) => new Date(program.date))
  }, [programs])

  // Custom day renderer for calendar
  const getDayContent = (date: Date) => {
    const hasProgram = datesWithPrograms.some(
      (d) =>
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
    )

    const programCount = programs.filter((program) => {
      const programDate = new Date(program.date)
      return (
        programDate.getDate() === date.getDate() &&
        programDate.getMonth() === date.getMonth() &&
        programDate.getFullYear() === date.getFullYear()
      )
    }).length

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <span className="text-sm font-medium">{date.getDate()}</span>
        {hasProgram && (
          <div className="absolute bottom-1 flex gap-0.5">
            {Array.from({ length: Math.min(programCount, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-teal-500"
              />
            ))}
            {programCount > 3 && (
              <span className="text-xs text-teal-600 font-semibold">+{programCount - 3}</span>
            )}
          </div>
        )}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      {/* Calendar Section */}
      <Card className="lg:col-span-1 shadow-md border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Program Calendar</CardTitle>
          <CardDescription>View all programs by date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentMonth)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setCurrentMonth(newDate)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm">
                {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newDate = new Date(currentMonth)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setCurrentMonth(newDate)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, index) => {
                  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                  const startDate = new Date(firstDay)
                  startDate.setDate(startDate.getDate() - firstDay.getDay())

                  const currentDate = new Date(startDate)
                  currentDate.setDate(currentDate.getDate() + index)

                  const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth()
                  const isSelected =
                    currentDate.toDateString() === selectedDate.toDateString()

                  const hasProgram = datesWithPrograms.some(
                    (d) => d.toDateString() === currentDate.toDateString()
                  )

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(new Date(currentDate))}
                      className={`
                        aspect-square p-1 rounded-lg text-xs font-medium transition-all
                        ${!isCurrentMonth ? "text-slate-300 bg-slate-50" : ""}
                        ${isSelected ? "bg-teal-500 text-white" : ""}
                        ${!isSelected && isCurrentMonth && hasProgram ? "bg-teal-50 border-2 border-teal-300" : ""}
                        ${!isSelected && isCurrentMonth && !hasProgram ? "hover:bg-slate-100" : ""}
                        ${!isSelected && !isCurrentMonth ? "cursor-default" : "cursor-pointer"}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{currentDate.getDate()}</span>
                        {hasProgram && !isSelected && (
                          <div className="w-1 h-1 rounded-full bg-teal-500 mt-0.5" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="text-xs text-slate-600 space-y-1 pt-2 border-t">
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Programs scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-teal-500" />
                <span>Selected date</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs List Section */}
      <Card className="lg:col-span-2 shadow-md border border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Programs on {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
          </CardTitle>
          <CardDescription>
            {programsForSelectedDate.length} program{programsForSelectedDate.length !== 1 ? "s" : ""} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programsForSelectedDate.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No programs scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {programsForSelectedDate.map((program) => (
                <Link key={program.id} href={`/programs/${program.id}`}>
                  <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                          {program.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            {program.time}
                          </span>
                          <span className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            📍 {program.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(program.status)}>
                          {program.status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-700">
                          ₱{program.budget?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Show summary of all programs */}
          {programs.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-slate-600 mb-3">
                <span className="font-semibold">{programs.length}</span> total programs
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded text-center">
                  <p className="font-semibold text-green-700">
                    {programs.filter((p) => p.status === "Active").length}
                  </p>
                  <p className="text-green-600">Active</p>
                </div>
                <div className="bg-blue-50 p-2 rounded text-center">
                  <p className="font-semibold text-blue-700">
                    {programs.filter((p) => p.status === "Planning").length}
                  </p>
                  <p className="text-blue-600">Planning</p>
                </div>
                <div className="bg-gray-50 p-2 rounded text-center">
                  <p className="font-semibold text-gray-700">
                    {programs.filter((p) => p.status === "Completed").length}
                  </p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
