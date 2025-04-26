"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function OfficialsPage() {
  const { t } = useLanguage()

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("officials.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("officials.description")}</p>
      </div>

      {/* Barangay Captain */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-xl shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop"
                alt="Barangay Captain"
                width={400}
                height={500}
                className="object-cover w-full h-auto"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-2">{t("officials.captain")}: Juan Dela Cruz</h2>
            <p className="text-muted-foreground mb-4">{t("officials.currentTerm")}: 2022-2025</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("officials.contactInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-primary" />
                    <span>{t("officials.email")}: captain@barangayconnect.gov</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-primary" />
                    <span>{t("officials.phone")}: (123) 456-7890</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-primary" />
                    <span>{t("officials.office")}: Monday-Friday, 9:00 AM - 5:00 PM</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("officials.committees")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Peace and Order</li>
                    <li>Infrastructure Development</li>
                    <li>Budget and Finance</li>
                    <li>Executive Committee</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">
                {t("officials.messageTitle")} {t("officials.captain")}
              </h3>
              <div className="prose prose-sm max-w-none">
                <p>Dear residents of our beloved barangay,</p>
                <p>
                  It is with great honor and privilege that I serve as your Barangay Captain. Our administration is
                  committed to creating a safe, progressive, and inclusive community for all residents. We believe in
                  transparent governance and active community participation.
                </p>
                <p>
                  Together, we can build a better barangay for ourselves and for future generations. I encourage
                  everyone to take part in our community programs and initiatives. My office is always open to hear your
                  concerns and suggestions.
                </p>
                <p>Maraming salamat po sa inyong patuloy na suporta at pagtitiwala.</p>
                <p className="font-semibold">
                  Juan Dela Cruz
                  <br />
                  Punong Barangay
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button asChild>
                <Link href="/appointments">{t("officials.scheduleAppointment")}</Link>
              </Button>
              <Button variant="outline">{t("officials.viewProfile")}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Barangay Councilors */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">{t("officials.councilors")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1287&auto=format&fit=crop"
                alt="Councilor Maria Santos"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Maria Santos</CardTitle>
              <CardDescription>Committee on Health and Sanitation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>maria@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7891</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                {t("officials.viewProfile")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1170&auto=format&fit=crop"
                alt="Councilor Pedro Reyes"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Pedro Reyes</CardTitle>
              <CardDescription>Committee on Education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>pedro@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7892</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                {t("officials.viewProfile")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1361&auto=format&fit=crop"
                alt="Councilor Ana Lim"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Ana Lim</CardTitle>
              <CardDescription>Committee on Women and Family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>ana@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7893</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                {t("officials.viewProfile")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden hover:shadow-md transition-all">
            <div className="relative h-64 w-full">
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1287&auto=format&fit=crop"
                alt="Councilor Roberto Garcia"
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Roberto Garcia</CardTitle>
              <CardDescription>Committee on Infrastructure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>roberto@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7894</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                {t("officials.viewProfile")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Other Officials */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Other Barangay Officials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("officials.secretary")}</CardTitle>
              <CardDescription>Elena Magtanggol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>secretary@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7895</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span>Monday-Friday, 8:00 AM - 5:00 PM</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("officials.treasurer")}</CardTitle>
              <CardDescription>Ricardo Buenaventura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>treasurer@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7896</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span>Monday-Friday, 8:00 AM - 5:00 PM</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("officials.skChairperson")}</CardTitle>
              <CardDescription>Miguel Santos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-primary" />
                <span>sk@barangayconnect.gov</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-primary" />
                <span>(123) 456-7897</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-primary" />
                <span>Monday-Friday, 1:00 PM - 6:00 PM</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
