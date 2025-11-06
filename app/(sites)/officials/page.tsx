"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { getAllOfficialsAction, type Official } from "@/app/actions/officials"

export default function OfficialsPage() {
  const { t } = useLanguage()
  const [officials, setOfficials] = useState<Official[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const categorizeOfficials = (officials: Official[]) => {
    const captain = officials.find(official => official.position === "captain")
    const councilors = officials.filter(official => official.position === "councilor")
    const skChairperson = officials.find(official => official.position === "skChairperson")
    const barangayStaff = officials.filter(official =>
      ["secretary", "treasurer", "clerk"].includes(official.position)
    )

    return { captain, councilors, skChairperson, barangayStaff }
  }

  useEffect(() => {
    const loadOfficials = async () => {
      try {
        setIsLoading(true)
        const result = await getAllOfficialsAction()
        if (result.success && result.officials) {
          const activeOfficials = result.officials.filter(o => o.status === "active")
          setOfficials(activeOfficials)
        }
      } catch (error) {
        console.error("Error loading officials:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadOfficials()
  }, [])

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t("officials.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("officials.description")}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : officials.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No officials information available at the moment.</p>
        </div>
      ) : (() => {
        const { captain, councilors, skChairperson, barangayStaff } = categorizeOfficials(officials)
        return (
          <>
            {captain && (
              <section className="mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="relative h-64 md:h-96 overflow-hidden rounded-xl shadow-md  ">
                      <Image
                        src={captain.photo || "/placeholder-user.jpg"}
                        alt="Barangay Captain"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-2">{t("officials.captain")}: {captain.name}</h2>
                    <p className="text-muted-foreground mb-4">{t("officials.currentTerm")}: {captain.term}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{t("officials.committees")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {captain.committees && captain.committees.length > 0 ? (
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {captain.committees.map((c, idx) => (
                                <li key={idx}>{c}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No committees listed.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-2">
                        {t("officials.messageTitle")} {t("officials.captain")}
                      </h3>
                      <div className="prose prose-sm max-w-none">
                        <p>{captain.message || "Our administration is committed to creating a safe, progressive, and inclusive community for all residents."}</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                      <Button asChild>
                        <Link href="/appointments">{t("officials.scheduleAppointment")}</Link>
                      </Button>
                      {/* <Button variant="outline">{t("officials.viewProfile")}</Button> */}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {councilors.length > 0 && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">{t("officials.councilors")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {councilors.map((councilor) => (
                    <Card key={councilor.id} className="overflow-hidden hover:shadow-md transition-all">
                      <div className="relative h-64 md:h-96 w-full">
                        <Image
                          src={councilor.photo || "/placeholder-user.jpg"}
                          alt={councilor.name}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{councilor.name}</CardTitle>
                        <CardDescription>
                          {t("officials.councilor")}
                          {councilor.committees && councilor.committees.length > 0 && (
                            <span className="block text-xs mt-1 text-primary">{councilor.committees[0]}</span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {councilor.biography ? (
                          councilor.biography.substring(0, 100) + (councilor.biography.length > 100 ? "..." : "")
                        ) : (
                          `Serving as ${t("officials.councilor").toLowerCase()} for ${councilor.term}.`
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" size="sm" className="w-full">
                          {t("officials.viewProfile")}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {skChairperson && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold mb-6">Sangguniang Kabataan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="overflow-hidden hover:shadow-md transition-all md:col-span-2 md:max-w-80">
                    <div className="relative h-64 md:max-w-80 w-full">
                      <Image
                        src={skChairperson.photo || "/placeholder-user.jpg"}
                        alt={skChairperson.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{skChairperson.name}</CardTitle>
                      <CardDescription>{t("officials.skChairperson")}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {skChairperson.biography ? (
                        skChairperson.biography.substring(0, 120) + (skChairperson.biography.length > 120 ? "..." : "")
                      ) : (
                        `Leading youth initiatives for ${skChairperson.term}.`
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>
            )}

            {barangayStaff.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">Other Barangay Officials</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {barangayStaff.map((staff) => (
                    <Card key={staff.id} className="overflow-hidden hover:shadow-md transition-all md:max-w-80">
                      <div className="relative h-64 md:max-w-80 w-full">
                        <Image
                          src={staff.photo || "/placeholder-user.jpg"}
                          alt={staff.name}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle>{staff.name}</CardTitle>
                        <CardDescription>{t(`officials.${staff.position}`)}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        {staff.biography ? (
                          staff.biography.substring(0, 100) + (staff.biography.length > 100 ? "..." : "")
                        ) : (
                          `Serving as ${t(`officials.${staff.position}`).toLowerCase()} for ${staff.term}.`
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )
      })()}
    </div>
  )
}
