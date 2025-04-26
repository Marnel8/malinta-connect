"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, CheckCircle, X, Users } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"

export default function AppointmentsPage() {
  const { t } = useLanguage()

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("appointments.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("appointments.description")}</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="schedule">{t("appointments.schedule")}</TabsTrigger>
          <TabsTrigger value="manage">{t("appointments.manage")}</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>{t("appointments.newAppointment")}</CardTitle>
              <CardDescription>{t("appointments.chooseService")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service">{t("appointments.serviceType")}</Label>
                <Select>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Barangay Captain Consultation</SelectItem>
                    <SelectItem value="dispute">Dispute Resolution</SelectItem>
                    <SelectItem value="business">Business Permit Assistance</SelectItem>
                    <SelectItem value="welfare">Social Welfare Assistance</SelectItem>
                    <SelectItem value="other">Other Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("appointments.date")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>Pick a date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">{t("appointments.time")}</Label>
                  <Select>
                    <SelectTrigger id="time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00">9:00 AM</SelectItem>
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
                <Label htmlFor="purpose">{t("appointments.purpose")}</Label>
                <Textarea
                  id="purpose"
                  placeholder="Please describe the purpose of your appointment"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">{t("appointments.scheduleButton")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>{t("appointments.yourAppointments")}</CardTitle>
              <CardDescription>{t("appointments.viewManage")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Barangay Captain Consultation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">April 26, 2025 at 10:00 AM</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t("appointments.status.confirmed")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: APT-2025-0426-001</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("appointments.purpose")}: Discuss community project proposal
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        {t("appointments.reschedule")}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {t("appointments.cancel")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Dispute Resolution</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">May 3, 2025 at 2:00 PM</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        {t("appointments.status.pending")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: APT-2025-0503-002</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("appointments.purpose")}: Property boundary dispute with neighbor
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        {t("appointments.reschedule")}
                      </Button>
                      <Button variant="destructive" size="sm">
                        {t("appointments.cancel")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Social Welfare Assistance</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">April 15, 2025 at 9:00 AM</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                        <X className="mr-1 h-3 w-3" />
                        {t("appointments.status.cancelled")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: APT-2025-0415-003</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("appointments.purpose")}: Inquire about educational assistance program
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
