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
import { useToast } from "@/hooks/use-toast"
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
} from "lucide-react"

export default function AdminAnalyticsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30")

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
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshAnalytics = async () => {
    try {
      setRefreshing(true)
      await loadAnalytics()
      toast({
        title: "Success",
        description: "Analytics data refreshed successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh analytics data",
        variant: "destructive"
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
      MessageSquare
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
              {analyticsData.certificates.breakdown.length > 0 ? (
                analyticsData.certificates.breakdown.map((item, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No certificate data available
                </p>
              )}
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
              {analyticsData.appointments.breakdown.length > 0 ? (
                analyticsData.appointments.breakdown.map((item, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No appointment data available
                </p>
              )}
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
              {analyticsData.blotter.breakdown.length > 0 ? (
                analyticsData.blotter.breakdown.map((item, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No blotter data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 