"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { Globe } from "lucide-react"
import dynamic from "next/dynamic"

function LanguageSelectorContent() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
          <span className="mr-2">🇺🇸</span> {t("language.english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("tl")} className={language === "tl" ? "bg-accent" : ""}>
          <span className="mr-2">🇵🇭</span> {t("language.tagalog")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export the component with dynamic import to prevent SSR issues
export const LanguageSelector = dynamic(() => Promise.resolve(LanguageSelectorContent), {
	ssr: false,
	loading: () => (
		<div className="h-8 w-8 rounded bg-muted animate-pulse" />
	),
});
