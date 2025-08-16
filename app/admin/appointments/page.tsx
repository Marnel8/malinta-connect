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
import { Search, Users, Clock, CheckCircle, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock data for appointments
const appointments = [
  {
    id: "APT-2025-0426-001",
    type: "Barangay Captain Consultation",
    residentName: "Juan Dela Cruz",
    date: "April 26, 2025",
    time: "10:00 AM",
    status: "confirmed",
    purpose: "Discuss community project proposal",
  },
  {
    id: "APT-2025-0503-002",
    type: "Dispute Resolution",
    residentName: "Maria Santos",
    date: "May 3, 2025",
    time: "2:00 PM",
    status: "pending",
    purpose: "Property boundary dispute with neighbor",
  },
  {
    id: "APT-2025-0415-003",
    type: "Social Welfare Assistance",
    residentName: "Pedro Reyes",
    date: "April 15, 2025",
    time: "9:00 AM",
    status: "cancelled",
    purpose: "Inquire about educational assistance program",
  },
]

export default function AdminAppointmentsPage() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("appointments.status.confirmed")}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            {t("appointments.status.pending")}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <X className="mr-1 h-3 w-3" />
            {t("appointments.status.cancelled")}
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
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-2">Manage and schedule appointments with residents</p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search appointments..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Appointments</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="today">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference No.</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell className="font-medium">{appointment.id}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-primary" />
                    {appointment.type}
                  </div>
                </TableCell>
                <TableCell>{appointment.residentName}</TableCell>
                <TableCell>
                  {appointment.date} at {appointment.time}
                </TableCell>
                <TableCell>{appointment.purpose}</TableCell>
                <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    {appointment.status === "pending" && (
                      <>
                        <Button size="sm">Confirm</Button>
                        <Button variant="destructive" size="sm">Reject</Button>
                      </>
                    )}
                    {appointment.status === "confirmed" && (
                      <>
                        <Button variant="outline" size="sm">Reschedule</Button>
                        <Button variant="destructive" size="sm">Cancel</Button>
                      </>
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