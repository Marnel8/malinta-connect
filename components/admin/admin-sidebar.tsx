"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Megaphone,
  Users,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  Home,
  ChevronRight,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminSidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const isActive = (path: string) => pathname === path

  return (
    <Sidebar variant="floating" className="border-r">
      <SidebarHeader className="pb-0">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image src="/images/malinta_logo.jpg" alt="Barangay Malinta Logo" fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">Barangay Malinta</span>
            <span className="text-xs text-muted-foreground">Admin Dashboard</span>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")}>
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t("admin.dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/" target="_blank">
                    <Home className="h-4 w-4" />
                    <span>Back to Website</span>
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("admin.manage")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/events")}>
                  <Link href="/admin/events">
                    <Megaphone className="h-4 w-4" />
                    <span>{t("admin.events")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/officials")}>
                  <Link href="/admin/officials">
                    <Users className="h-4 w-4" />
                    <span>{t("admin.officials")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/announcements")}>
                  <Link href="/admin/announcements">
                    <Megaphone className="h-4 w-4" />
                    <span>{t("admin.announcements")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Services</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/certificates")}>
                  <Link href="/admin/certificates">
                    <FileText className="h-4 w-4" />
                    <span>{t("admin.certificates")}</span>
                    <Badge className="ml-auto bg-primary/10 text-primary hover:bg-primary/20">12</Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/appointments")}>
                  <Link href="/admin/appointments">
                    <Calendar className="h-4 w-4" />
                    <span>{t("admin.appointments")}</span>
                    <Badge className="ml-auto bg-primary/10 text-primary hover:bg-primary/20">8</Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/blotter")}>
                  <Link href="/admin/blotter">
                    <MessageSquare className="h-4 w-4" />
                    <span>{t("admin.blotter")}</span>
                    <Badge className="ml-auto bg-primary/10 text-primary hover:bg-primary/20">5</Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/residents")}>
                  <Link href="/admin/residents">
                    <Users className="h-4 w-4" />
                    <span>{t("admin.residents")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/analytics")}>
                  <Link href="/admin/analytics">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4" />
                    <span>{t("admin.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LanguageSelector />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
            </Button>
          </div>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <SidebarSeparator />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop"
                alt="Admin Profile"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">Juan Dela Cruz</span>
              <span className="text-xs text-muted-foreground">{t("officials.captain")}</span>
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
