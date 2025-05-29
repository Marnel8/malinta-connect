"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  Percent,
} from "lucide-react"

// Mock data for analytics
const overviewStats = [
  {
    title: "Total Residents",
    value: "2,345",
    change: "+12%",
    trend: "up",
    description: "vs. last month",
    icon: Users,
  },
  {
    title: "Certificate Requests",
    value: "156",
    change: "+8%",
    trend: "up",
    description: "vs. last month",
    icon: FileText,
  },
  {
    title: "Appointments",
    value: "89",
    change: "-3%",
    trend: "down",
    description: "vs. last month",
    icon: Calendar,
  },
  {
    title: "Blotter Reports",
    value: "45",
    change: "+15%",
    trend: "up",
    description: "vs. last month",
    icon: MessageSquare,
  },
]

const certificateStats = {
  total: 156,
  breakdown: [
    { type: "Barangay Clearance", count: 78, percentage: 50 },
    { type: "Certificate of Residency", count: 45, percentage: 29 },
    { type: "Certificate of Indigency", count: 33, percentage: 21 },
  ],
  status: [
    { status: "Processing", count: 45 },
    { status: "Ready", count: 89 },
    { status: "Needs Info", count: 22 },
  ],
}

const appointmentStats = {
  total: 89,
  breakdown: [
    { type: "Barangay Captain Consultation", count: 34, percentage: 38 },
    { type: "Dispute Resolution", count: 28, percentage: 31 },
    { type: "Business Permit Assistance", count: 15, percentage: 17 },
    { type: "Social Welfare Assistance", count: 12, percentage: 14 },
  ],
  status: [
    { status: "Confirmed", count: 56 },
    { status: "Pending", count: 23 },
    { status: "Cancelled", count: 10 },
  ],
}

const blotterStats = {
  total: 45,
  breakdown: [
    { type: "Noise Complaint", count: 15, percentage: 33 },
    { type: "Property Damage", count: 12, percentage: 27 },
    { type: "Neighbor Dispute", count: 10, percentage: 22 },
    { type: "Theft/Robbery", count: 8, percentage: 18 },
  ],
  status: [
    { status: "Under Investigation", count: 18 },
    { status: "Resolved", count: 20 },
    { status: "Needs Info", count: 7 },
  ],
}

export default function AdminAnalyticsPage() {
  const { t } = useLanguage()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">Track and analyze barangay services and resident data</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Certificates Analytics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Certificate Requests</CardTitle>
            <CardDescription>Distribution by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificateStats.breakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Analytics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Distribution by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentStats.breakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blotter Analytics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Blotter Reports</CardTitle>
            <CardDescription>Distribution by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blotterStats.breakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>{item.type}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 