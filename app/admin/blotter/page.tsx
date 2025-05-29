"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock data for blotter reports
const blotterReports = [
  {
    id: "BLT-2025-0423-001",
    type: "Noise Complaint",
    reportedBy: "Juan Dela Cruz",
    date: "April 23, 2025",
    location: "Block 5, Lot 12, Main Street",
    status: "investigating",
    description: "Loud music and karaoke after quiet hours",
  },
  {
    id: "BLT-2025-0410-002",
    type: "Property Damage",
    reportedBy: "Maria Santos",
    date: "April 10, 2025",
    location: "Community Park",
    status: "resolved",
    description: "Vandalism of park benches and playground equipment",
  },
  {
    id: "BLT-2025-0328-003",
    type: "Neighbor Dispute",
    reportedBy: "Pedro Reyes",
    date: "March 28, 2025",
    location: "Block 3, Lot 7, Side Street",
    status: "additionalInfo",
    description: "Boundary dispute and alleged encroachment",
  },
]

export default function AdminBlotterPage() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            {t("blotter.status.investigating")}
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("blotter.status.resolved")}
          </Badge>
        )
      case "additionalInfo":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            {t("certificates.status.additionalInfo")}
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blotter Reports</h1>
          <p className="text-muted-foreground mt-2">Manage and investigate incident reports from residents</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          File New Report
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search reports..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="investigating">Under Investigation</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="additionalInfo">Needs Info</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="noise">Noise Complaints</SelectItem>
            <SelectItem value="property">Property Damage</SelectItem>
            <SelectItem value="dispute">Disputes</SelectItem>
            <SelectItem value="theft">Theft/Robbery</SelectItem>
            <SelectItem value="violence">Violence/Assault</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blotterReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                    {report.type}
                  </div>
                </TableCell>
                <TableCell>{report.reportedBy}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>{report.location}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    {report.status === "investigating" && (
                      <>
                        <Button size="sm">Update Status</Button>
                        <Button variant="outline" size="sm">Schedule Hearing</Button>
                      </>
                    )}
                    {report.status === "additionalInfo" && (
                      <Button size="sm" variant="outline">Request Info</Button>
                    )}
                    {report.status !== "resolved" && (
                      <Button size="sm" variant="outline">Mark as Resolved</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 