"use client"

import { useState, useEffect } from "react"
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
import { Search, Users, UserPlus, Mail, Phone, MapPin, CheckCircle, AlertCircle, Eye, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ResidentVerificationModal } from "@/components/admin/resident-verification-modal"
import { 
  getResidentsAction, 
  getResidentDetailsAction, 
  searchResidentsAction,
  ResidentListItem,
  ResidentData
} from "@/app/actions/residents"

export default function AdminResidentsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [residents, setResidents] = useState<ResidentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSearching, setIsSearching] = useState(false)
  
  // Verification modal state
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean
    resident: ResidentData | null
  }>({ isOpen: false, resident: null })
  const [isLoadingResident, setIsLoadingResident] = useState(false)

  const loadResidents = async () => {
    setIsLoading(true)
    try {
      const result = await getResidentsAction()
      if (result.success && result.residents) {
        setResidents(result.residents)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load residents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading residents:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading residents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      const result = await searchResidentsAction(searchQuery, statusFilter)
      if (result.success && result.residents) {
        setResidents(result.residents)
      } else {
        toast({
          title: "Search Failed",
          description: result.error || "Failed to search residents",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Failed",
        description: "An unexpected error occurred during search",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const openVerificationModal = async (uid: string) => {
    setIsLoadingResident(true)
    try {
      const result = await getResidentDetailsAction(uid)
      if (result.success && result.resident) {
        setVerificationModal({
          isOpen: true,
          resident: result.resident,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load resident details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading resident details:", error)
      toast({
        title: "Error",
        description: "Failed to load resident details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingResident(false)
    }
  }

  const closeVerificationModal = () => {
    setVerificationModal({ isOpen: false, resident: null })
  }

  const handleVerificationUpdate = () => {
    loadResidents() // Reload the residents list
  }

  // Load residents on component mount
  useEffect(() => {
    loadResidents()
  }, [])

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() !== "" || statusFilter !== "all") {
        handleSearch()
      } else {
        loadResidents()
      }
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter])

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
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
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
          <Input 
            type="search" 
            placeholder="Search residents by name, email, phone, or address..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(isSearching || isLoading) && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          onClick={loadResidents}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resident</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading residents...
                  </div>
                </TableCell>
              </TableRow>
            ) : residents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all" ? "No residents found matching your criteria." : "No residents registered yet."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              residents.map((resident) => (
                <TableRow key={resident.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={resident.profileImageUrl} alt={resident.name} />
                        <AvatarFallback>{resident.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{resident.name}</div>
                        <div className="text-sm text-muted-foreground">{resident.uid}</div>
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
                      <span className="text-sm">{resident.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(resident.verificationStatus)}</TableCell>
                  <TableCell>{resident.registeredOn}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openVerificationModal(resident.uid)}
                        disabled={isLoadingResident}
                      >
                        {isLoadingResident ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="mr-1 h-3 w-3" />
                        )}
                        View Details
                      </Button>
                      {resident.verificationStatus === "pending" && (
                        <Button 
                          size="sm"
                          onClick={() => openVerificationModal(resident.uid)}
                          disabled={isLoadingResident}
                        >
                          {isLoadingResident ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Review"
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Verification Modal */}
      <ResidentVerificationModal
        isOpen={verificationModal.isOpen}
        onClose={closeVerificationModal}
        resident={verificationModal.resident}
        onVerificationUpdate={handleVerificationUpdate}
      />
    </div>
  )
} 