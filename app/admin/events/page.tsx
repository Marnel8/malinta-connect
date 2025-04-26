"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Search, Edit, Trash2, Plus, Eye, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Mock data for events
const mockEvents = [
  {
    id: "1",
    name: "Barangay Malinta Clean-up Drive",
    date: "2025-05-15",
    time: "07:00 - 11:00",
    location: "Barangay Malinta Plaza",
    description: "Join us for our monthly community clean-up initiative",
    category: "community",
    organizer: "Environmental Committee",
    contact: "environment@malinta.losbanos.gov.ph",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop",
    status: "active",
    featured: true,
  },
  {
    id: "2",
    name: "Free Health Seminar and Check-up",
    date: "2025-05-20",
    time: "09:00 - 15:00",
    location: "Barangay Malinta Health Center",
    description: "Learn about preventive healthcare and get a free check-up",
    category: "health",
    organizer: "Health Committee",
    contact: "health@malinta.losbanos.gov.ph",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1170&auto=format&fit=crop",
    status: "active",
    featured: false,
  },
  {
    id: "3",
    name: "Barangay Malinta Basketball Tournament",
    date: "2025-06-01",
    time: "15:00 - 20:00",
    location: "Barangay Malinta Basketball Court",
    description: "Annual basketball competition for all age groups",
    category: "sports",
    organizer: "Sports Committee",
    contact: "sports@malinta.losbanos.gov.ph",
    image: "https://images.unsplash.com/photo-1540479859555-17af45c78602?q=80&w=1170&auto=format&fit=crop",
    status: "active",
    featured: false,
  },
]

export default function EventsManagementPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [events, setEvents] = useState(mockEvents)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<any>(null)
  const [isViewEventOpen, setIsViewEventOpen] = useState(false)

  // Filter events based on search query, category, and status
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddEvent = (event: any) => {
    // In a real app, this would be an API call
    const newEvent = {
      id: (events.length + 1).toString(),
      ...event,
      status: "active",
      featured: false,
    }
    setEvents([...events, newEvent])
    setIsAddEventOpen(false)
    toast({
      title: t("admin.success"),
      description: t("admin.events.saveSuccess"),
    })
  }

  const handleEditEvent = (event: any) => {
    // In a real app, this would be an API call
    const updatedEvents = events.map((e) => (e.id === event.id ? event : e))
    setEvents(updatedEvents)
    setIsAddEventOpen(false)
    toast({
      title: t("admin.success"),
      description: t("admin.events.updateSuccess"),
    })
  }

  const handleDeleteEvent = () => {
    // In a real app, this would be an API call
    if (currentEvent) {
      const updatedEvents = events.filter((e) => e.id !== currentEvent.id)
      setEvents(updatedEvents)
      setIsDeleteDialogOpen(false)
      setCurrentEvent(null)
      toast({
        title: t("admin.success"),
        description: t("admin.events.deleteSuccess"),
      })
    }
  }

  const handleViewEvent = (event: any) => {
    setCurrentEvent(event)
    setIsViewEventOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Update the page header with better styling */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("admin.events.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("admin.events.description")}</p>
        </div>
        <Button
          onClick={() => {
            setCurrentEvent(null)
            setIsAddEventOpen(true)
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.events.add")}
        </Button>
      </div>

      {/* Update the search and filter section with better styling */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("admin.events.searchPlaceholder")}
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder={t("admin.events.filterByCategory")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allCategories")}</SelectItem>
            <SelectItem value="community">{t("events.community")}</SelectItem>
            <SelectItem value="health">{t("events.health")}</SelectItem>
            <SelectItem value="education">{t("events.education")}</SelectItem>
            <SelectItem value="sports">{t("events.sports")}</SelectItem>
            <SelectItem value="culture">{t("events.culture")}</SelectItem>
            <SelectItem value="government">{t("events.government")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder={t("admin.events.filterByStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("events.allCategories")}</SelectItem>
            <SelectItem value="active">{t("admin.events.active")}</SelectItem>
            <SelectItem value="inactive">{t("admin.events.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Update the event cards with better styling */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">{t("admin.noData")}</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setCurrentEvent(null)
                  setIsAddEventOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.events.add")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                  <Image src={event.image || "/placeholder.svg"} alt={event.name} fill className="object-cover" />
                  {event.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary">{t("admin.events.featured")}</Badge>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{event.name}</h3>
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="mr-2">
                          {t(`events.${event.category}`)}
                        </Badge>
                        <Badge variant={event.status === "active" ? "default" : "secondary"}>
                          {t(`admin.events.${event.status}`)}
                        </Badge>
                      </div>
                      <div className="space-y-1 mt-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEvent(event)}
                        className="hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("admin.view")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentEvent(event)
                          setIsAddEventOpen(true)
                        }}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("admin.edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setCurrentEvent(event)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="hover:bg-red-500/90"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("admin.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentEvent ? t("admin.events.edit") : t("admin.events.add")}</DialogTitle>
            <DialogDescription>
              {currentEvent ? t("admin.events.description") : t("admin.events.description")}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const eventData = {
                id: currentEvent?.id || "",
                name: formData.get("name") as string,
                date: formData.get("date") as string,
                time: formData.get("time") as string,
                location: formData.get("location") as string,
                description: formData.get("description") as string,
                category: formData.get("category") as string,
                organizer: formData.get("organizer") as string,
                contact: formData.get("contact") as string,
                image:
                  currentEvent?.image ||
                  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop",
                status: formData.get("status") as string,
                featured: formData.get("featured") === "on",
              }

              if (currentEvent) {
                handleEditEvent(eventData)
              } else {
                handleAddEvent(eventData)
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name" className="mb-2">
                    {t("admin.events.eventName")}
                  </Label>
                  <Input id="name" name="name" defaultValue={currentEvent?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="date" className="mb-2">
                    {t("admin.events.eventDate")}
                  </Label>
                  <Input id="date" name="date" type="date" defaultValue={currentEvent?.date || ""} required />
                </div>
                <div>
                  <Label htmlFor="time" className="mb-2">
                    {t("admin.events.eventTime")}
                  </Label>
                  <Input id="time" name="time" defaultValue={currentEvent?.time || ""} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="location" className="mb-2">
                    {t("admin.events.eventLocation")}
                  </Label>
                  <Input id="location" name="location" defaultValue={currentEvent?.location || ""} required />
                </div>
                <div>
                  <Label htmlFor="category" className="mb-2">
                    {t("admin.events.eventCategory")}
                  </Label>
                  <Select name="category" defaultValue={currentEvent?.category || "community"}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("events.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">{t("events.community")}</SelectItem>
                      <SelectItem value="health">{t("events.health")}</SelectItem>
                      <SelectItem value="education">{t("events.education")}</SelectItem>
                      <SelectItem value="sports">{t("events.sports")}</SelectItem>
                      <SelectItem value="culture">{t("events.culture")}</SelectItem>
                      <SelectItem value="government">{t("events.government")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="mb-2">
                    {t("admin.events.status")}
                  </Label>
                  <Select name="status" defaultValue={currentEvent?.status || "active"}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder={t("admin.events.status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("admin.events.active")}</SelectItem>
                      <SelectItem value="inactive">{t("admin.events.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="organizer" className="mb-2">
                    {t("admin.events.eventOrganizer")}
                  </Label>
                  <Input id="organizer" name="organizer" defaultValue={currentEvent?.organizer || ""} required />
                </div>
                <div>
                  <Label htmlFor="contact" className="mb-2">
                    {t("admin.events.eventContact")}
                  </Label>
                  <Input id="contact" name="contact" defaultValue={currentEvent?.contact || ""} required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description" className="mb-2">
                    {t("admin.events.eventDescription")}
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={currentEvent?.description || ""}
                    required
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    defaultChecked={currentEvent?.featured || false}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="featured">{t("admin.events.featured")}</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                {t("admin.cancel")}
              </Button>
              <Button type="submit">{currentEvent ? t("admin.save") : t("admin.events.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.delete")}</DialogTitle>
            <DialogDescription>{t("admin.events.confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              {t("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("admin.events.view")}</DialogTitle>
          </DialogHeader>
          {currentEvent && (
            <div className="space-y-4">
              <div className="relative h-48 w-full rounded-md overflow-hidden">
                <Image
                  src={currentEvent.image || "/placeholder.svg"}
                  alt={currentEvent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold">{currentEvent.name}</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{t(`events.${currentEvent.category}`)}</Badge>
                <Badge variant={currentEvent.status === "active" ? "default" : "secondary"}>
                  {t(`admin.events.${currentEvent.status}`)}
                </Badge>
                {currentEvent.featured && <Badge className="bg-primary">{t("admin.events.featured")}</Badge>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{t("events.date")}:</span>
                  <span className="ml-2">{currentEvent.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{t("events.time")}:</span>
                  <span className="ml-2">{currentEvent.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{t("events.location")}:</span>
                  <span className="ml-2">{currentEvent.location}</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">{t("admin.events.eventDescription")}</h3>
                <p className="text-muted-foreground">{currentEvent.description}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">{t("events.organizer")}:</span>
                  <span className="ml-2">{currentEvent.organizer}</span>
                </div>
                <div>
                  <span className="font-medium">{t("events.contact")}:</span>
                  <span className="ml-2">{currentEvent.contact}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewEventOpen(false)}>{t("admin.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
