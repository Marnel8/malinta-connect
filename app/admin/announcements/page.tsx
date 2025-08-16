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
import { Search, Megaphone, Clock, CheckCircle, AlertCircle, Eye, EyeOff, Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

// Mock data for announcements
const announcements = [
  {
    id: "ANN-2025-0425-001",
    title: "Community Clean-up Drive",
    category: "Event",
    publishedOn: "April 25, 2025",
    status: "published",
    author: "Juan Dela Cruz",
    visibility: "public",
    description: "Join us for our monthly community clean-up drive this Saturday.",
    expiresOn: "May 25, 2025",
  },
  {
    id: "ANN-2025-0423-002",
    title: "Road Maintenance Schedule",
    category: "Notice",
    publishedOn: "April 23, 2025",
    status: "draft",
    author: "Maria Santos",
    visibility: "public",
    description: "Upcoming road repairs and maintenance schedule for Main Street.",
    expiresOn: "June 23, 2025",
  },
  {
    id: "ANN-2025-0420-003",
    title: "Emergency Contact Information Update",
    category: "Important",
    publishedOn: "April 20, 2025",
    status: "published",
    author: "Pedro Reyes",
    visibility: "residents",
    description: "Please update your emergency contact information at the barangay hall.",
    expiresOn: "May 20, 2025",
  },
]

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Published
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      default:
        return null
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Eye className="mr-1 h-3 w-3" />
            Public
          </Badge>
        )
      case "residents":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <EyeOff className="mr-1 h-3 w-3" />
            Residents Only
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
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-2">Create and manage barangay announcements</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search announcements..." className="pl-8" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="notice">Notices</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published On</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Expires On</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Megaphone className="mr-2 h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{announcement.title}</div>
                      <div className="text-sm text-muted-foreground">{announcement.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{announcement.category}</TableCell>
                <TableCell>{announcement.publishedOn}</TableCell>
                <TableCell>{announcement.author}</TableCell>
                <TableCell>{announcement.expiresOn}</TableCell>
                <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                <TableCell>{getVisibilityBadge(announcement.visibility)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    {announcement.status === "draft" && (
                      <Button size="sm">Publish</Button>
                    )}
                    {announcement.status === "published" && (
                      <>
                        <Button variant="outline" size="sm">Unpublish</Button>
                        <Button variant="destructive" size="sm">Archive</Button>
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