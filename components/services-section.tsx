"use client"

import type React from "react"
import Link from "next/link"
import { FileText, Calendar, MessageSquare, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface ServiceCardProps {
  icon: React.ElementType
  titleKey: string
  descriptionKey: string
  benefitKey: string
  ctaKey: string
  ctaLink: string
  className?: string
}

const ServiceCard = ({
  icon: Icon,
  titleKey,
  descriptionKey,
  benefitKey,
  ctaKey,
  ctaLink,
  className,
}: ServiceCardProps) => {
  const { t } = useLanguage()

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/20",
        className,
      )}
    >
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 transform rounded-full bg-primary/10 opacity-70 transition-transform duration-300 group-hover:translate-x-6 group-hover:-translate-y-6 group-hover:scale-110"></div>

      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mb-2 font-heading text-xl font-bold tracking-tight">{t(titleKey)}</h3>
      <p className="mb-3 text-sm text-muted-foreground">{t(descriptionKey)}</p>
      <p className="mb-6 text-sm">{t(benefitKey)}</p>

      <Link
        href={ctaLink}
        className="inline-flex items-center text-sm font-medium text-primary transition-all hover:underline"
      >
        {t(ctaKey)}
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

export function ServicesSection() {
  const { t } = useLanguage()

  return (
    <section className="w-full py-16 md:py-24" id="services">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {t("services.title")}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">{t("services.subtitle")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">{t("services.description")}</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            icon={FileText}
            titleKey="services.certificates.title"
            descriptionKey="services.certificates.description"
            benefitKey="services.certificates.benefit"
            ctaKey="services.certificates.cta"
            ctaLink="/certificates"
          />

          <ServiceCard
            icon={Calendar}
            titleKey="services.appointments.title"
            descriptionKey="services.appointments.description"
            benefitKey="services.appointments.benefit"
            ctaKey="services.appointments.cta"
            ctaLink="/appointments"
          />

          <ServiceCard
            icon={MessageSquare}
            titleKey="services.blotter.title"
            descriptionKey="services.blotter.description"
            benefitKey="services.blotter.benefit"
            ctaKey="services.blotter.cta"
            ctaLink="/blotter"
          />
        </div>
      </div>
    </section>
  )
}
