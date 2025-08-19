"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  getSettings,
  updateBarangayInfo,
  updateOfficeHours,
  updateNotificationSettings,
  updateUserRoleSettings,
  updateAllSettings,
  initializeDefaultSettings,
  type BarangaySettings,
  type OfficeHours,
  type NotificationSettings,
  type UserRoleSettings,
  type AllSettings
} from "@/app/actions/settings"
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Users,
  Building,
  Clock,
  Save,
  Loader2,
} from "lucide-react"

export default function AdminSettingsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [settings, setSettings] = useState<AllSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  // Form states
  const [barangayForm, setBarangayForm] = useState<BarangaySettings>({
    barangayName: "",
    municipality: "",
    address: "",
    contact: "",
    email: ""
  })
  
  const [officeHoursForm, setOfficeHoursForm] = useState<OfficeHours>({
    weekdays: { start: "8", end: "17" },
    weekends: { start: "9", end: "12" }
  })
  
  const [notificationForm, setNotificationForm] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    systemNotifications: true
  })
  
  const [userRolesForm, setUserRolesForm] = useState<UserRoleSettings>({
    superAdmin: { description: "", permissions: [] },
    staff: { description: "", permissions: [] },
    resident: { description: "", permissions: [] }
  })

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await getSettings()
      if (data) {
        setSettings(data)
        setBarangayForm(data.barangay)
        setOfficeHoursForm(data.officeHours)
        setNotificationForm(data.notifications)
        setUserRolesForm(data.userRoles)
      } else {
        // Initialize default settings if none exist
        await initializeDefaultSettings()
        const defaultData = await getSettings()
        if (defaultData) {
          setSettings(defaultData)
          setBarangayForm(defaultData.barangay)
          setOfficeHoursForm(defaultData.officeHours)
          setNotificationForm(defaultData.notifications)
          setUserRolesForm(defaultData.userRoles)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBarangaySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateBarangayInfo(barangayForm)
      toast({
        title: "Success",
        description: "Barangay information updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update barangay information",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleOfficeHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateOfficeHours(officeHoursForm)
      toast({
        title: "Success",
        description: "Office hours updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update office hours",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateNotificationSettings(notificationForm)
      toast({
        title: "Success",
        description: "Notification settings updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUserRolesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateUserRoleSettings(userRolesForm)
      toast({
        title: "Success",
        description: "User role settings updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      const updatedSettings: AllSettings = {
        barangay: barangayForm,
        officeHours: officeHoursForm,
        notifications: notificationForm,
        userRoles: userRolesForm
      }
      
      await updateAllSettings(updatedSettings)
      setSettings(updatedSettings)
      toast({
        title: "Success",
        description: "All settings saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save all settings",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage system settings and configurations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Barangay Information</CardTitle>
                <CardDescription>Update your barangay's basic information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBarangaySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barangayName">Barangay Name</Label>
                      <Input 
                        id="barangayName" 
                        value={barangayForm.barangayName}
                        onChange={(e) => setBarangayForm(prev => ({ ...prev, barangayName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="municipality">Municipality</Label>
                      <Input 
                        id="municipality" 
                        value={barangayForm.municipality}
                        onChange={(e) => setBarangayForm(prev => ({ ...prev, municipality: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address</Label>
                    <Textarea
                      id="address"
                      value={barangayForm.address}
                      onChange={(e) => setBarangayForm(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Number</Label>
                      <Input 
                        id="contact" 
                        value={barangayForm.contact}
                        onChange={(e) => setBarangayForm(prev => ({ ...prev, contact: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={barangayForm.email}
                        onChange={(e) => setBarangayForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Barangay Info
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Office Hours</CardTitle>
                <CardDescription>Set your barangay office's operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOfficeHoursSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weekdays</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={officeHoursForm.weekdays.start}
                          onValueChange={(value) => setOfficeHoursForm(prev => ({ 
                            ...prev, 
                            weekdays: { ...prev.weekdays, start: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 6} value={String(i + 6)}>
                                {i + 6}:00 AM
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="self-center">to</span>
                        <Select 
                          value={officeHoursForm.weekdays.end}
                          onValueChange={(value) => setOfficeHoursForm(prev => ({ 
                            ...prev, 
                            weekdays: { ...prev.weekdays, end: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 13} value={String(i + 13)}>
                                {i + 1}:00 PM
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Weekends</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={officeHoursForm.weekends.start}
                          onValueChange={(value) => setOfficeHoursForm(prev => ({ 
                            ...prev, 
                            weekends: { ...prev.weekends, start: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 6} value={String(i + 6)}>
                                {i + 6}:00 AM
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="self-center">to</span>
                        <Select 
                          value={officeHoursForm.weekends.end}
                          onValueChange={(value) => setOfficeHoursForm(prev => ({ 
                            ...prev, 
                            weekends: { ...prev.weekends, end: value } 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 13} value={String(i + 13)}>
                                {i + 1}:00 PM
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Office Hours
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new requests and updates via email
                      </p>
                    </div>
                    <Switch 
                      checked={notificationForm.emailNotifications}
                      onCheckedChange={(checked) => setNotificationForm(prev => ({ 
                        ...prev, 
                        emailNotifications: checked 
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about urgent matters via SMS
                      </p>
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ SMS integration is currently in development and will be available soon
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={notificationForm.smsNotifications}
                        onCheckedChange={(checked) => setNotificationForm(prev => ({ 
                          ...prev, 
                          smsNotifications: checked 
                        }))}
                        disabled
                      />
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive in-app notifications for all activities
                      </p>
                    </div>
                    <Switch 
                      checked={notificationForm.systemNotifications}
                      onCheckedChange={(checked) => setNotificationForm(prev => ({ 
                        ...prev, 
                        systemNotifications: checked 
                      }))}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Notification Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserRolesSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Super Admin</Label>
                      <p className="text-sm text-muted-foreground">
                        Full access to all features and settings
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Access
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Staff</Label>
                      <p className="text-sm text-muted-foreground">
                        Limited access to resident services
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Access
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Resident</Label>
                      <p className="text-sm text-muted-foreground">
                        Access to resident portal only
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Access
                    </Button>
                  </div>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update User Role Settings
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving All Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 