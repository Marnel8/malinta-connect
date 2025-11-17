"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { toastError, toastSuccess } from "@/lib/toast-presets"
import {
  getAllAnalytics,
  type OverviewStats,
  type CertificateStats,
  type AppointmentStats,
  type BlotterStats,
  type AnalyticsData
} from "@/app/actions/analytics"
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
  RefreshCw,
  Loader2,
  Shield,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function AdminAnalyticsPage() {
  const { t } = useLanguage()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30")

  // Color schemes for charts
  const COLORS = {
    certificate: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
    appointment: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'],
    blotter: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
  }

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllAnalytics()
      setAnalyticsData(data)
    } catch (error) {
      console.error("Error loading analytics:", error)
      setError("Failed to load analytics data")
      toastError({
        title: "Error",
        description: "Failed to load analytics data"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    try {
      setRefreshing(true)
      await loadAnalytics()
      toastSuccess({
        title: "Success",
        description: "Analytics data refreshed successfully"
      })
    } catch (error) {
      toastError({
        title: "Error",
        description: "Failed to refresh analytics data"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Users,
      FileText,
      Calendar,
      MessageSquare,
      Shield
    }
    return iconMap[iconName] || Activity
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track and analyze barangay services and resident data</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track and analyze barangay services and resident data</p>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track and analyze barangay services and resident data</p>
        </div>
        
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-2">Track and analyze barangay services and resident data</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time Range:</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={refreshAnalytics} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {analyticsData.overview.map((stat, index) => {
          const Icon = getIconComponent(stat.icon)
          
          // Define colors for each card type
          const getCardColors = (title: string) => {
            switch (title) {
              case "Total Residents":
                return {
                  borderColor: "border-l-purple-500",
                  iconColor: "text-purple-600",
                  bgColor: "bg-purple-50"
                }
              case "Certificate Requests":
                return {
                  borderColor: "border-l-blue-500",
                  iconColor: "text-blue-600",
                  bgColor: "bg-blue-50"
                }
              case "Appointments":
                return {
                  borderColor: "border-l-green-500",
                  iconColor: "text-green-600",
                  bgColor: "bg-green-50"
                }
              case "Blotter Reports":
                return {
                  borderColor: "border-l-red-500",
                  iconColor: "text-red-600",
                  bgColor: "bg-red-50"
                }
              case "Total Officials":
                return {
                  borderColor: "border-l-orange-500",
                  iconColor: "text-orange-600",
                  bgColor: "bg-orange-50"
                }
              default:
                return {
                  borderColor: "border-l-gray-500",
                  iconColor: "text-gray-600",
                  bgColor: "bg-gray-50"
                }
            }
          }
          
          const colors = getCardColors(stat.title)
          
          return (
            <Card key={index} className={`${colors.borderColor} border-l-4 shadow-sm hover:shadow-md transition-shadow duration-200`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                  <div className={`p-2 rounded-lg ${colors.bgColor}`}>
                    <Icon className={`h-5 w-5 ${colors.iconColor}`} />
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <div className="flex items-center text-sm">
                  {stat.trend === "up" ? (
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-gray-500">{stat.description}</span>
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
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.certificates.breakdown.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.certificates.breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.certificates.breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.certificate[index % COLORS.certificate.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No certificate data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Appointments Analytics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.appointments.status.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.appointments.status}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${status}: ${count}`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.appointments.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.appointment[index % COLORS.appointment.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No appointment data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Blotter Analytics */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Blotter Reports</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.blotter.breakdown.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.blotter.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="type" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No blotter data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 