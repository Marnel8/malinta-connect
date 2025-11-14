"use server"

import { adminDatabase } from "@/app/firebase/admin"
import { revalidatePath } from "next/cache"
import { cloudinary } from "@/cloudinary/cloudinary"

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

export interface CertificateSettings {
  signatureUrl?: string
  officialName: string
  officialPosition: string
}

export interface AllSettings {
  barangay: BarangaySettings
  officeHours: OfficeHours
  notifications: NotificationSettings
  userRoles: UserRoleSettings
  certificateSettings: CertificateSettings
}

// Get all settings
export async function getSettings(): Promise<AllSettings | null> {
  try {
    const settingsRef = adminDatabase.ref("settings")
    const snapshot = await settingsRef.get()
    
    if (snapshot.exists()) {
      const settings = snapshot.val()
      // Ensure certificateSettings exists for backward compatibility
      if (!settings.certificateSettings) {
        settings.certificateSettings = getDefaultSettings().certificateSettings
      }
      return settings
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
    const settingsRef = adminDatabase.ref("settings/barangay")
    await settingsRef.set(data)
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
    const settingsRef = adminDatabase.ref("settings/officeHours")
    await settingsRef.set(data)
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
    const currentSettingsRef = adminDatabase.ref("settings/notifications")
    const snapshot = await currentSettingsRef.get()
    
    if (snapshot.exists()) {
      const currentSettings = snapshot.val()
      // Keep the current SMS setting unchanged
      data.smsNotifications = currentSettings.smsNotifications || false
    }
    
    const settingsRef = adminDatabase.ref("settings/notifications")
    await settingsRef.set(data)
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
    const settingsRef = adminDatabase.ref("settings/userRoles")
    await settingsRef.set(data)
    revalidatePath("/admin/settings")
    return { success: true, message: "User role settings updated successfully" }
  } catch (error) {
    console.error("Error updating user role settings:", error)
    throw new Error("Failed to update user role settings")
  }
}

// Upload signature to settings
export async function uploadSignatureToSettings(
  signatureFile: File
): Promise<{ success: boolean; signatureUrl?: string; error?: string }> {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const bytes = await signatureFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const dataURI = `data:${signatureFile.type};base64,${base64Data}`

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: "malinta-connect/settings/signatures",
      public_id: `official_signature_${Date.now()}`,
      resource_type: "image",
    })

    return {
      success: true,
      signatureUrl: uploadResult.secure_url,
    }
  } catch (error) {
    console.error("Error uploading signature to settings:", error)
    return {
      success: false,
      error: "Failed to upload signature",
    }
  }
}

// Update certificate settings
export async function updateCertificateSettings(
  data: CertificateSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const settingsRef = adminDatabase.ref("settings/certificateSettings")
    await settingsRef.set(data)
    revalidatePath("/admin/settings")
    return {
      success: true,
      message: "Certificate settings updated successfully",
    }
  } catch (error) {
    console.error("Error updating certificate settings:", error)
    throw new Error("Failed to update certificate settings")
  }
}

// Update all settings at once
export async function updateAllSettings(data: AllSettings) {
  try {
    // Prevent SMS notifications from being updated since it's coming soon
    const currentSettingsRef = adminDatabase.ref("settings/notifications")
    const snapshot = await currentSettingsRef.get()
    
    if (snapshot.exists()) {
      const currentSettings = snapshot.val()
      // Keep the current SMS setting unchanged
      data.notifications.smsNotifications = currentSettings.smsNotifications || false
    }
    
    // Ensure certificateSettings exists in data
    if (!data.certificateSettings) {
      data.certificateSettings = getDefaultSettings().certificateSettings
    }
    
    const settingsRef = adminDatabase.ref("settings")
    await settingsRef.set(data)
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
    const settingsRef = adminDatabase.ref("settings")
    const snapshot = await settingsRef.get()
    
    if (!snapshot.exists()) {
      const defaultSettings = getDefaultSettings()
      await settingsRef.set(defaultSettings)
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
    },
    certificateSettings: {
      signatureUrl: undefined,
      officialName: "HON. JESUS H. DE UNA JR.",
      officialPosition: "Punong Barangay"
    }
  }
}
