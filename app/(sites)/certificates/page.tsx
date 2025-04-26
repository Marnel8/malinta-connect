"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function CertificatesPage() {
  const { t } = useLanguage()

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("certificates.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("certificates.description")}</p>
      </div>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="request">{t("certificates.request")}</TabsTrigger>
          <TabsTrigger value="track">{t("certificates.track")}</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("certificates.barangayClearance")}</CardTitle>
                <CardDescription>General purpose clearance for various transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {t("certificates.processing")}: 1-2 business days
                </div>
                <div className="mt-4 text-sm">
                  <p>{t("certificates.requiredFor")}:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Job applications</li>
                    <li>Business permits</li>
                    <li>School requirements</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/certificates/request/clearance">{t("certificates.requestNow")}</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("certificates.residency")}</CardTitle>
                <CardDescription>Proof that you are a resident of the barangay.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {t("certificates.processing")}: 1 business day
                </div>
                <div className="mt-4 text-sm">
                  <p>{t("certificates.requiredFor")}:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Scholarship applications</li>
                    <li>Voter's registration</li>
                    <li>Government IDs</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/certificates/request/residency">{t("certificates.requestNow")}</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("certificates.indigency")}</CardTitle>
                <CardDescription>Certifies that you are from a low-income household.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {t("certificates.processing")}: 2-3 business days
                </div>
                <div className="mt-4 text-sm">
                  <p>{t("certificates.requiredFor")}:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Medical assistance</li>
                    <li>Educational assistance</li>
                    <li>Fee waivers</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/certificates/request/indigency">{t("certificates.requestNow")}</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="track">
          <Card>
            <CardHeader>
              <CardTitle>{t("certificates.yourRequests")}</CardTitle>
              <CardDescription>{t("certificates.trackStatus")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">{t("certificates.barangayClearance")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("certificates.requestedOn")}: April 22, 2025
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="mr-1 h-3 w-3" />
                        {t("certificates.status.processing")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: BC-2025-0422-001</p>
                    <p className="text-sm text-muted-foreground mt-1">Estimated completion: April 24, 2025</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">{t("certificates.residency")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("certificates.requestedOn")}: April 20, 2025
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        {t("certificates.status.ready")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: CR-2025-0420-003</p>
                    <p className="text-sm text-muted-foreground mt-1">Available for pickup at the Barangay Hall</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-medium">{t("certificates.indigency")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("certificates.requestedOn")}: April 15, 2025
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {t("certificates.status.additionalInfo")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">{t("certificates.reference")}: IC-2025-0415-002</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please provide proof of income.{" "}
                      <Button variant="link" className="h-auto p-0 text-sm">
                        Upload Document
                      </Button>
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
