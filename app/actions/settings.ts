"use server"

import { database } from "@/app/firebase/firebase"
import { ref, get, set, update } from "firebase/database"
import { revalidatePath } from "next/cache"

export interface BarangaySettings {
  barangayName: string
  municipality: string
  address: string
  contact: string
  email: string
}

export interface OfficeHours {
  weekdays: {
    start: string
    end: string
  }
  weekends: {
    start: string
    end: string
  }
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  systemNotifications: boolean
}

export interface UserRoleSettings {
  superAdmin: {
    description: string
    permissions: string[]
  }
  staff: {
    description: string
    permissions: string[]
  }
  resident: {
    description: string
    permissions: string[]
  }
}

export interface AllSettings {
  barangay: BarangaySettings
  officeHours: OfficeHours
  notifications: NotificationSettings
  userRoles: UserRoleSettings
}

// Get all settings
export async function getSettings(): Promise<AllSettings | null> {
  try {
    const settingsRef = ref(database, "settings")
    const snapshot = await get(settingsRef)
    
    if (snapshot.exists()) {
      return snapshot.val()
    }
    
    // Return default settings if none exist
    return getDefaultSettings()
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw new Error("Failed to fetch settings")
  }
}

// Update barangay information
export async function updateBarangayInfo(data: BarangaySettings) {
  try {
    const settingsRef = ref(database, "settings/barangay")
    await set(settingsRef, data)
    revalidatePath("/admin/settings")
    return { success: true, message: "Barangay information updated successfully" }
  } catch (error) {
    console.error("Error updating barangay info:", error)
    throw new Error("Failed to update barangay information")
  }
}

// Update office hours
export async function updateOfficeHours(data: OfficeHours) {
  try {
    const settingsRef = ref(database, "settings/officeHours")
    await set(settingsRef, data)
    revalidatePath("/admin/settings")
    return { success: true, message: "Office hours updated successfully" }
  } catch (error) {
    console.error("Error updating office hours:", error)
    throw new Error("Failed to update office hours")
  }
}

// Update notification settings
export async function updateNotificationSettings(data: NotificationSettings) {
  try {
    // Prevent SMS notifications from being updated since it's coming soon
    // This feature is in development and will be available in a future update
    const currentSettingsRef = ref(database, "settings/notifications")
    const snapshot = await get(currentSettingsRef)
    
    if (snapshot.exists()) {
      const currentSettings = snapshot.val()
      // Keep the current SMS setting unchanged
      data.smsNotifications = currentSettings.smsNotifications || false
    }
    
    const settingsRef = ref(database, "settings/notifications")
    await set(settingsRef, data)
    revalidatePath("/admin/settings")
    return { success: true, message: "Notification settings updated successfully" }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    throw new Error("Failed to update notification settings")
  }
}

// Update user role settings
export async function updateUserRoleSettings(data: UserRoleSettings) {
  try {
    const settingsRef = ref(database, "settings/userRoles")
    await set(settingsRef, data)
    revalidatePath("/admin/settings")
    return { success: true, message: "User role settings updated successfully" }
  } catch (error) {
    console.error("Error updating user role settings:", error)
    throw new Error("Failed to update user role settings")
  }
}

// Update all settings at once
export async function updateAllSettings(data: AllSettings) {
  try {
    // Prevent SMS notifications from being updated since it's coming soon
    const currentSettingsRef = ref(database, "settings/notifications")
    const snapshot = await get(currentSettingsRef)
    
    if (snapshot.exists()) {
      const currentSettings = snapshot.val()
      // Keep the current SMS setting unchanged
      data.notifications.smsNotifications = currentSettings.smsNotifications || false
    }
    
    const settingsRef = ref(database, "settings")
    await set(settingsRef, data)
    revalidatePath("/admin/settings")
    return { success: true, message: "All settings updated successfully" }
  } catch (error) {
    console.error("Error updating all settings:", error)
    throw new Error("Failed to update settings")
  }
}

// Initialize default settings if none exist
export async function initializeDefaultSettings() {
  try {
    const settingsRef = ref(database, "settings")
    const snapshot = await get(settingsRef)
    
    if (!snapshot.exists()) {
      const defaultSettings = getDefaultSettings()
      await set(settingsRef, defaultSettings)
      return { success: true, message: "Default settings initialized" }
    }
    
    return { success: true, message: "Settings already exist" }
  } catch (error) {
    console.error("Error initializing default settings:", error)
    throw new Error("Failed to initialize default settings")
  }
}

// Helper function to get default settings
function getDefaultSettings(): AllSettings {
  return {
    barangay: {
      barangayName: "Barangay Malinta",
      municipality: "Valenzuela City",
      address: "123 Main Street, Valenzuela City, Metro Manila",
      contact: "+63 (2) 8123 4567",
      email: "malinta@valenzuela.gov.ph"
    },
    officeHours: {
      weekdays: {
        start: "8",
        end: "17"
      },
      weekends: {
        start: "9",
        end: "12"
      }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      systemNotifications: true
    },
    userRoles: {
      superAdmin: {
        description: "Full access to all features and settings",
        permissions: ["all"]
      },
      staff: {
        description: "Limited access to resident services",
        permissions: ["residents", "certificates", "events"]
      },
      resident: {
        description: "Access to resident portal only",
        permissions: ["profile", "requests", "certificates"]
      }
    }
  }
}
