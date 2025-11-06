"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import dynamic from "next/dynamic"

function FooterContent() {
  const { t } = useLanguage()

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image src="/images/malinta_logo.jpg" alt="Barangay Malinta Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold">Barangay Malinta</h3>
                <p className="text-xs text-muted-foreground">Los Baños, Laguna</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("home.hero.subtitle")}</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.certificates")}
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.appointments")}
                </Link>
              </li>
              <li>
                <Link href="/blotter" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.blotter")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-muted-foreground hover:text-primary transition-colors">
                  Accessibility
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t("footer.contactUs")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Barangay Hall, Malinta, Los Baños, Laguna</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>(049) 536-XXXX</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>barangaymalintalosbanos@gmail.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image src="/images/los_banos.png" alt="Los Baños Logo" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Barangay Malinta, Los Baños. {t("footer.rights")}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              {t("footer.about")}
            </Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Export the component with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(FooterContent), {
	ssr: false,
	loading: () => (
		<footer className="border-t bg-background">
			<div className="container py-8 md:py-12">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
						<div className="space-y-2">
							<div className="h-6 w-32 bg-muted animate-pulse rounded" />
							<div className="h-4 w-48 bg-muted animate-pulse rounded" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-6 w-24 bg-muted animate-pulse rounded" />
						<div className="space-y-2">
							<div className="h-4 w-20 bg-muted animate-pulse rounded" />
							<div className="h-4 w-24 bg-muted animate-pulse rounded" />
							<div className="h-4 w-28 bg-muted animate-pulse rounded" />
							<div className="h-4 w-22 bg-muted animate-pulse rounded" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-6 w-20 bg-muted animate-pulse rounded" />
						<div className="space-y-2">
							<div className="h-4 w-16 bg-muted animate-pulse rounded" />
							<div className="h-4 w-20 bg-muted animate-pulse rounded" />
							<div className="h-4 w-28 bg-muted animate-pulse rounded" />
							<div className="h-4 w-24 bg-muted animate-pulse rounded" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-6 w-24 bg-muted animate-pulse rounded" />
						<div className="space-y-2">
							<div className="h-4 w-48 bg-muted animate-pulse rounded" />
							<div className="h-4 w-32 bg-muted animate-pulse rounded" />
							<div className="h-4 w-40 bg-muted animate-pulse rounded" />
						</div>
						<div className="mt-4">
							<div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
						</div>
					</div>
				</div>
				<div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="h-4 w-48 bg-muted animate-pulse rounded" />
					<div className="flex gap-4">
						<div className="h-4 w-16 bg-muted animate-pulse rounded" />
						<div className="h-4 w-12 bg-muted animate-pulse rounded" />
						<div className="h-4 w-20 bg-muted animate-pulse rounded" />
					</div>
				</div>
			</div>
		</footer>
	),
});
