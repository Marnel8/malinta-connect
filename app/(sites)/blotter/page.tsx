"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Clock, CheckCircle, AlertCircle, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"

export default function BlotterPage() {
  const { t } = useLanguage()

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("blotter.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("blotter.description")}</p>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="file">{t("blotter.file")}</TabsTrigger>
          <TabsTrigger value="track">{t("blotter.track")}</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>{t("blotter.newReport")}</CardTitle>
              <CardDescription>{t("blotter.provideDetails")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="incident-type">{t("blotter.incidentType")}</Label>
                <Select>
                  <SelectTrigger id="incident-type">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theft">Theft/Robbery</SelectItem>
                    <SelectItem value="disturbance">Noise/Public Disturbance</SelectItem>
                    <SelectItem value="property">Property Damage</SelectItem>
                    <SelectItem value="dispute">Neighbor Dispute</SelectItem>
                    <SelectItem value="violence">Violence/Assault</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="incident-date">{t("blotter.incidentDate")}</Label>
                  <Input type="date" id="incident-date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incident-time">{t("blotter.incidentTime")} (Approximate)</Label>
                  <Input type="time" id="incident-time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-location">{t("blotter.incidentLocation")}</Label>
                <Input id="incident-location" placeholder="Enter the location where the incident occurred" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-description">{t("blotter.incidentDescription")}</Label>
                <Textarea
                  id="incident-description"
                  placeholder="Please provide a detailed description of what happened"
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="persons-involved">{t("blotter.personsInvolved")} (if any)</Label>
                <Textarea
                  id="persons-involved"
                  placeholder="List names or descriptions of people involved in the incident"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidence">{t("blotter.evidenceUpload")} (Optional)</Label>
                <Input id="evidence" type="file" multiple />
                <p className="text-xs text-muted-foreground mt-1">
                  You can upload photos, videos, or documents related to the incident (max 5MB per file)
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">{t("blotter.submitReport")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="track">
          <Card>
            <CardHeader>
              <CardTitle>{t("blotter.yourReports")}</CardTitle>
              <CardDescription>{t("blotter.trackStatus")}</CardDescription>
            </CardHeader>
            <CardContent>
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Under Investigation</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Noise Complaint</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Filed on: April 23, 2025</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        {t("blotter.status.investigating")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: BLT-2025-0423-001</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("blotter.incidentLocation")}: Block 5, Lot 12, Main Street
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      {t("blotter.viewDetails")}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Property Damage</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Filed on: April 10, 2025</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t("blotter.status.resolved")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: BLT-2025-0410-002</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("blotter.incidentLocation")}: Community Park
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      {t("blotter.viewDetails")}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">Neighbor Dispute</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Filed on: March 28, 2025</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {t("certificates.status.additionalInfo")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: BLT-2025-0328-003</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("blotter.incidentLocation")}: Block 3, Lot 7, Side Street
                    </p>
                    <p className="text-sm text-red-600 mt-2">
                      Please provide witness statements.{" "}
                      <Button variant="link" className="h-auto p-0 text-sm">
                        Upload Documents
                      </Button>
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      {t("blotter.viewDetails")}
                    </Button>
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
