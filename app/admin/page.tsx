"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Download, Search, Filter, Users, Calendar, Mail, Phone, Shield, LogOut, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    availableSlots: 1000,
    totalEvents: 4,
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        // Check if user is authenticated admin
        const authResponse = await fetch("/api/auth/me")
        if (!authResponse.ok) {
          router.push("/?error=authentication_required")
          return
        }

        const authData = await authResponse.json()
        if (authData.user.role !== "admin") {
          router.push("/events?error=admin_access_required")
          return
        }

        // Fetch users data
        const usersResponse = await fetch("/api/users")
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const usersData = await usersResponse.json()
        setUsers(usersData.users)

        // Fetch registration stats
        const statsResponse = await fetch("/api/auth/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats({
            totalUsers: statsData.stats.totalUsers,
            activeUsers: statsData.stats.activeUsers,
            pendingUsers: statsData.stats.pendingUsers,
            availableSlots: statsData.stats.availableSlots,
            totalEvents: 4,
          })
        }
      } catch (error) {
        console.error("Failed to load admin data:", error)
        setError("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [router])

  const handleFilter = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Email", "Phone", "Batch", "Department", "Year of Passing", "Status", "Registration Date"],
      ...filteredUsers.map((user) => [
        user.id,
        user.name,
        user.email,
        user.phone || "",
        user.batch || "",
        user.department || "",
        user.yearOfPassing || "",
        user.status || "active",
        user.registrationDate || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `alumni-users-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update local state
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, status: newStatus as "active" | "pending" | "suspended" } : user,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  // Apply filters when search term or status filter changes
  React.useEffect(() => {
    handleFilter()
  }, [searchTerm, statusFilter, users])

  if (isLoading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-6 rounded-2xl bg-gradient-to-br from-red-500/15 via-orange-500/10 to-transparent blur-2xl"></div>
              <div className="relative w-16 h-16 ring-1 ring-white/10 flex bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl shadow-md items-center justify-center overflow-hidden">
                <Shield className="w-8 h-8 text-red-300" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">Admin Dashboard</h1>
          <p className="text-white/70">Secure alumni management system</p>

          <div className="flex justify-center mt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-300 mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Alumni</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-white/50">of 1000 capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Users className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <Users className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Calendar className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Available Slots</p>
                  <p className="text-2xl font-bold text-white">{stats.availableSlots}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Export */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg mb-8">
          <CardHeader>
            <CardTitle className="text-white">Alumni Management</CardTitle>
            <CardDescription className="text-white/70">Search, filter, and manage alumni accounts</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 placeholder-white/40 focus:bg-white/20 focus:border-white/30 text-white"
                  />
                </div>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">
                    All Status
                  </SelectItem>
                  <SelectItem value="active" className="text-white hover:bg-white/10">
                    Active
                  </SelectItem>
                  <SelectItem value="pending" className="text-white hover:bg-white/10">
                    Pending
                  </SelectItem>
                  <SelectItem value="suspended" className="text-white hover:bg-white/10">
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExport} className="bg-white text-black hover:bg-white/90">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/80">ID</TableHead>
                    <TableHead className="text-white/80">Name</TableHead>
                    <TableHead className="text-white/80">Contact</TableHead>
                    <TableHead className="text-white/80">Academic Info</TableHead>
                    <TableHead className="text-white/80">Status</TableHead>
                    <TableHead className="text-white/80">Registered</TableHead>
                    <TableHead className="text-white/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white/90 font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="text-white/90 font-medium">{user.name}</TableCell>
                      <TableCell className="text-white/80">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="space-y-1 text-sm">
                          {user.batch && <div>Batch: {user.batch}</div>}
                          {user.department && <div>Dept: {user.department}</div>}
                          {user.yearOfPassing && <div>Year: {user.yearOfPassing}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.status || "active"}
                          onValueChange={(value) => handleStatusUpdate(user.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8 bg-white/10 border-white/20 text-white text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="active" className="text-white hover:bg-white/10">
                              Active
                            </SelectItem>
                            <SelectItem value="pending" className="text-white hover:bg-white/10">
                              Pending
                            </SelectItem>
                            <SelectItem value="suspended" className="text-white hover:bg-white/10">
                              Suspended
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-white/80 text-sm">{user.registrationDate}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs"
                          onClick={() => {
                            /* Add view details functionality */
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/60">No alumni found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Link href="/events">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              View Events
            </Button>
          </Link>
          <Link href="/register-user">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              Register New Alumni
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
