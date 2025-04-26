"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Calendar,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"

export default function AdminDashboardPage() {
  const { t } = useLanguage()

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, Juan. Here's what's happening in your barangay.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Certificates</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span>+2 since yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span>+3 since yesterday</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blotter Cases</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span>-2 since last week</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Residents</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span>+24 since last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 rounded-lg bg-muted/50 p-1">
          <TabsTrigger
            value="certificates"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Certificate Requests
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Appointments
          </TabsTrigger>
          <TabsTrigger
            value="blotter"
            className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Blotter Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Certificate Requests</CardTitle>
                  <CardDescription>Manage and process certificate requests from residents.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search requests..."
                      className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Barangay Clearance</h3>
                        <Badge variant="outline" className="ml-2">
                          New
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Requested by: Juan Dela Cruz</p>
                      <p className="text-sm text-muted-foreground">Requested on: April 22, 2025</p>
                      <p className="text-sm">Reference #: BC-2025-0422-001</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Process</Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Certificate of Residency</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Requested by: Maria Santos</p>
                      <p className="text-sm text-muted-foreground">Requested on: April 20, 2025</p>
                      <p className="text-sm">Reference #: CR-2025-0420-003</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Activity className="mr-1 h-3 w-3" />
                        Processing
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Complete</Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Indigency Certificate</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Requested by: Pedro Reyes</p>
                      <p className="text-sm text-muted-foreground">Requested on: April 15, 2025</p>
                      <p className="text-sm">Reference #: IC-2025-0415-002</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Additional Info Required
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Request Info
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Appointment Schedule</CardTitle>
                  <CardDescription>Manage upcoming appointments with residents.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search appointments..."
                      className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Barangay Captain Consultation</h3>
                        <Badge variant="outline" className="ml-2">
                          Today
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Resident: Juan Dela Cruz</p>
                      <p className="text-sm text-muted-foreground">Schedule: April 25, 2025 at 10:00 AM</p>
                      <p className="text-sm">Purpose: Discuss community project proposal</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Confirmed
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Start Meeting</Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Dispute Resolution</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Resident: Maria Santos</p>
                      <p className="text-sm text-muted-foreground">Schedule: April 26, 2025 at 2:00 PM</p>
                      <p className="text-sm">Purpose: Property boundary dispute with neighbor</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Confirm</Button>
                        <Button size="sm" variant="outline">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blotter">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Blotter Reports</CardTitle>
                  <CardDescription>Manage and investigate incident reports.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="search"
                      placeholder="Search reports..."
                      className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Noise Complaint</h3>
                        <Badge variant="outline" className="ml-2">
                          New
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Reported by: Juan Dela Cruz</p>
                      <p className="text-sm text-muted-foreground">Filed on: April 23, 2025</p>
                      <p className="text-sm">Location: Block 5, Lot 12, Main Street</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Review
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Start Investigation</Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Property Damage</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Reported by: Maria Santos</p>
                      <p className="text-sm text-muted-foreground">Filed on: April 10, 2025</p>
                      <p className="text-sm">Location: Community Park</p>
                    </div>
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Activity className="mr-1 h-3 w-3" />
                        Under Investigation
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm">Update Status</Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Analytics Overview</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests by Type</CardTitle>
              <CardDescription>Distribution of service requests for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1170&auto=format&fit=crop"
                  alt="Analytics Chart"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Request Processing Time</CardTitle>
              <CardDescription>Average time to process different types of requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1170&auto=format&fit=crop"
                  alt="Analytics Chart"
                  fill
                  className="object-contain"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
