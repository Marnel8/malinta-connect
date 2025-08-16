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
import { Search, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock data for certificate requests
const certificateRequests = [
  {
    id: "BC-2025-0422-001",
    type: "Barangay Clearance",
    requestedBy: "Juan Dela Cruz",
    requestedOn: "April 22, 2025",
    status: "processing",
    purpose: "Job application",
    estimatedCompletion: "April 24, 2025",
  },
  {
    id: "CR-2025-0420-003",
    type: "Certificate of Residency",
    requestedBy: "Maria Santos",
    requestedOn: "April 20, 2025",
    status: "ready",
    purpose: "Voter's registration",
    estimatedCompletion: "April 21, 2025",
  },
  {
    id: "IC-2025-0415-002",
    type: "Certificate of Indigency",
    requestedBy: "Pedro Reyes",
    requestedOn: "April 15, 2025",
    status: "additionalInfo",
    purpose: "Medical assistance",
    estimatedCompletion: "Pending requirements",
  },
]

export default function AdminCertificatesPage() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            {t("certificates.status.processing")}
          </Badge>
        )
      case "ready":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("certificates.status.ready")}
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
          <h1 className="text-3xl font-bold tracking-tight">Certificate Requests</h1>
          <p className="text-muted-foreground mt-2">Manage and process certificate requests from residents</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search requests..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="additionalInfo">Needs Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificateRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-primary" />
                    {request.type}
                  </div>
                </TableCell>
                <TableCell>{request.requestedBy}</TableCell>
                <TableCell>{request.requestedOn}</TableCell>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    {request.status === "processing" && (
                      <Button size="sm">Mark as Ready</Button>
                    )}
                    {request.status === "additionalInfo" && (
                      <Button size="sm" variant="outline">Request Info</Button>
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