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
import { Search, Users, UserPlus, Mail, Phone, MapPin, CheckCircle, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for residents
const residents = [
  {
    id: "RES-2025-001",
    name: "Juan Dela Cruz",
    email: "juan.delacruz@email.com",
    phone: "+63 912 345 6789",
    address: "Block 5, Lot 12, Main Street",
    status: "verified",
    registeredOn: "January 15, 2025",
    type: "permanent",
    voterStatus: "registered",
    occupation: "Teacher",
    imageUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
  },
  {
    id: "RES-2025-002",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 923 456 7890",
    address: "Block 3, Lot 7, Side Street",
    status: "pending",
    registeredOn: "February 20, 2025",
    type: "temporary",
    voterStatus: "unregistered",
    occupation: "Business Owner",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    id: "RES-2025-003",
    name: "Pedro Reyes",
    email: "pedro.reyes@email.com",
    phone: "+63 934 567 8901",
    address: "Block 1, Lot 3, Park Avenue",
    status: "verified",
    registeredOn: "March 5, 2025",
    type: "permanent",
    voterStatus: "registered",
    occupation: "Engineer",
    imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61",
  },
]

export default function AdminResidentsPage() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending Verification
          </Badge>
        )
      default:
        return null
    }
  }

  const getResidentTypeBadge = (type: string) => {
    switch (type) {
      case "permanent":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Permanent
          </Badge>
        )
      case "temporary":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Temporary
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
          <h1 className="text-3xl font-bold tracking-tight">Residents</h1>
          <p className="text-muted-foreground mt-2">Manage resident profiles and information</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Resident
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search residents..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="temporary">Temporary</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Voter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="unregistered">Unregistered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={resident.imageUrl} alt={resident.name} />
                      <AvatarFallback>{resident.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{resident.name}</div>
                      <div className="text-sm text-muted-foreground">{resident.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {resident.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {resident.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {resident.address}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(resident.status)}</TableCell>
                <TableCell>{getResidentTypeBadge(resident.type)}</TableCell>
                <TableCell>{resident.registeredOn}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View Profile</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    {resident.status === "pending" && (
                      <Button size="sm">Verify</Button>
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