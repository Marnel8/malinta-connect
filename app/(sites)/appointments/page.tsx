"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, CheckCircle, X, Users, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { createAppointmentAction } from "@/app/actions/appointments"
import { format } from "date-fns"

type UserAppointment = {
  id: string
  title: string
  description: string
  date: string
  time: string
  requestedBy: string
  contactNumber: string
  email: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: number
  updatedAt: number
}

export default function AppointmentsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [purpose, setPurpose] = useState("")
  const [name, setName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [userAppointments, setUserAppointments] = useState<UserAppointment[]>([])

  // Mock user appointments - in a real app, you'd fetch these based on user authentication
  useEffect(() => {
    // This would be replaced with actual user-specific appointment fetching
    setUserAppointments([
      {
        id: "APT-2025-0426-001",
        title: "Barangay Captain Consultation",
        description: "Discuss community project proposal",
        date: "2025-04-26",
        time: "10:00",
        requestedBy: "Juan Dela Cruz",
        contactNumber: "09123456789",
        email: "juan@example.com",
        status: "confirmed",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "APT-2025-0503-002",
        title: "Dispute Resolution",
        description: "Property boundary dispute with neighbor",
        date: "2025-05-03",
        time: "14:00",
        requestedBy: "Juan Dela Cruz",
        contactNumber: "09123456789",
        email: "juan@example.com",
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "APT-2025-0415-003",
        title: "Social Welfare Assistance",
        description: "Inquire about educational assistance program",
        date: "2025-04-15",
        time: "09:00",
        requestedBy: "Juan Dela Cruz",
        contactNumber: "09123456789",
        email: "juan@example.com",
        status: "cancelled",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])
  }, [])

  const handleScheduleAppointment = async () => {
    if (!date || !time || !serviceType || !purpose || !name || !contactNumber || !email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const appointmentData = {
        title: serviceType,
        description: purpose,
        date: format(date, "yyyy-MM-dd"),
        time: time,
        requestedBy: name,
        contactNumber: contactNumber,
        email: email,
        notes: ""
      }

      const result = await createAppointmentAction(appointmentData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Appointment scheduled successfully! Reference: " + result.appointmentId,
        })
        // Reset form
        setDate(undefined)
        setTime("")
        setServiceType("")
        setPurpose("")
        setName("")
        setContactNumber("")
        setEmail("")
        // Add to user appointments list
        if (result.appointmentId) {
          setUserAppointments(prev => [{
            id: result.appointmentId!,
            ...appointmentData,
            status: "pending",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }, ...prev])
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to schedule appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("appointments.status.confirmed") || "Confirmed"}
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            {t("appointments.status.pending") || "Pending"}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <X className="mr-1 h-3 w-3" />
            {t("appointments.status.cancelled") || "Cancelled"}
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            {t("appointments.status.completed") || "Completed"}
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("appointments.title") || "Appointments"}</h1>
        <p className="text-muted-foreground mt-2">{t("appointments.description") || "Schedule and manage your appointments with barangay officials"}</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="schedule">{t("appointments.schedule") || "Schedule"}</TabsTrigger>
          <TabsTrigger value="manage">{t("appointments.manage") || "Manage"}</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{t("appointments.newAppointment") || "New Appointment"}</CardTitle>
              <CardDescription>{t("appointments.chooseService") || "Choose a service and schedule your appointment"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">{t("appointments.serviceType") || "Service Type"}</Label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barangay Captain Consultation">Barangay Captain Consultation</SelectItem>
                    <SelectItem value="Dispute Resolution">Dispute Resolution</SelectItem>
                    <SelectItem value="Business Permit Assistance">Business Permit Assistance</SelectItem>
                    <SelectItem value="Social Welfare Assistance">Social Welfare Assistance</SelectItem>
                    <SelectItem value="Other Services">Other Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("appointments.date") || "Date"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">{t("appointments.time") || "Time"}</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">{t("appointments.purpose") || "Purpose"}</Label>
                <Textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Please describe the purpose of your appointment"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleScheduleAppointment}
                disabled={loading || !date || !time || !serviceType || !purpose || !name || !contactNumber || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  t("appointments.scheduleButton") || "Schedule Appointment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>{t("appointments.yourAppointments") || "Your Appointments"}</CardTitle>
              <CardDescription>{t("appointments.viewManage") || "View and manage your scheduled appointments"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No appointments found
                  </div>
                ) : (
                  userAppointments.map((appointment) => (
                    <div key={appointment.id} className={`rounded-lg border p-4 ${appointment.status === "cancelled" ? "opacity-75" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-5 w-5 text-primary" />
                            <h3 className="font-medium">{appointment.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(appointment.date)} at {appointment.time}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm">{t("certificates.reference") || "Reference"}: {appointment.id}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("appointments.purpose") || "Purpose"}: {appointment.description}
                        </p>
                        {appointment.status !== "cancelled" && (
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              {t("appointments.reschedule") || "Reschedule"}
                            </Button>
                            <Button variant="destructive" size="sm">
                              {t("appointments.cancel") || "Cancel"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
