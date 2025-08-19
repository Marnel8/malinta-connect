"use server"

import { adminDatabase } from "@/app/firebase/admin"
import { revalidatePath } from "next/cache"

// Get all users with pagination
export async function getUsersAction(limit: number = 50, offset: number = 0) {
  try {
    const usersRef = adminDatabase.ref("users")
    const usersSnapshot = await usersRef.once("value")

    if (!usersSnapshot.exists()) {
      return { users: [], total: 0 }
    }

    const users = usersSnapshot.val()
    const userArray = Object.entries(users)
      .map(([id, user]: [string, any]) => ({
        id,
        ...user
      }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(offset, offset + limit)

    return { users: userArray, total: Object.keys(users).length }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { users: [], total: 0 }
  }
}

// Update user permissions
export async function updateUserPermissionsAction(
  userId: string,
  permissions: {
    canManageUsers?: boolean
    canManageEvents?: boolean
    canManageCertificates?: boolean
    canManageAppointments?: boolean
    canViewAnalytics?: boolean
    canManageSettings?: boolean
    canManageBlotter?: boolean
    canManageOfficials?: boolean
    canManageResidents?: boolean
    canManageAnnouncements?: boolean
  }
) {
  try {
    await adminDatabase.ref(`users/${userId}/permissions`).update(permissions)
    revalidatePath("/admin/staff")
    revalidatePath("/admin/residents")
    return { success: true }
  } catch (error) {
    console.error("Error updating user permissions:", error)
    return { success: false, error: "Failed to update permissions" }
  }
}

// Get system statistics
export async function getSystemStatsAction() {
  try {
    const [usersSnapshot, certificatesSnapshot, appointmentsSnapshot, blotterSnapshot, eventsSnapshot] = await Promise.all([
      adminDatabase.ref("users").once("value"),
      adminDatabase.ref("certificates").once("value"),
      adminDatabase.ref("appointments").once("value"),
      adminDatabase.ref("blotter").once("value"),
      adminDatabase.ref("events").once("value")
    ])

    const stats = {
      totalUsers: usersSnapshot.exists() ? Object.keys(usersSnapshot.val()).length : 0,
      totalCertificates: certificatesSnapshot.exists() ? Object.keys(certificatesSnapshot.val()).length : 0,
      totalAppointments: appointmentsSnapshot.exists() ? Object.keys(appointmentsSnapshot.val()).length : 0,
      totalBlotterCases: blotterSnapshot.exists() ? Object.keys(blotterSnapshot.val()).length : 0,
      totalEvents: eventsSnapshot.exists() ? Object.keys(eventsSnapshot.val()).length : 0,
      pendingCertificates: 0,
      upcomingAppointments: 0,
      activeBlotterCases: 0
    }

    // Calculate detailed stats
    if (certificatesSnapshot.exists()) {
      const certificates = certificatesSnapshot.val()
      stats.pendingCertificates = Object.values(certificates).filter((cert: any) => cert.status === "pending").length
    }

    if (appointmentsSnapshot.exists()) {
      const appointments = appointmentsSnapshot.val()
      const now = Date.now()
      stats.upcomingAppointments = Object.values(appointments).filter((apt: any) => 
        apt.status === "scheduled" && apt.scheduledDate > now
      ).length
    }

    if (blotterSnapshot.exists()) {
      const blotterCases = blotterSnapshot.val()
      stats.activeBlotterCases = Object.values(blotterCases).filter((blot: any) => blot.status === "active").length
    }

    return stats
  } catch (error) {
    console.error("Error fetching system stats:", error)
    return {
      totalUsers: 0,
      totalCertificates: 0,
      totalAppointments: 0,
      totalBlotterCases: 0,
      totalEvents: 0,
      pendingCertificates: 0,
      upcomingAppointments: 0,
      activeBlotterCases: 0
    }
  }
}

// Delete user
export async function deleteUserAction(userId: string) {
  try {
    await adminDatabase.ref(`users/${userId}`).remove()
    revalidatePath("/admin/staff")
    revalidatePath("/admin/residents")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

// Bulk update user roles
export async function bulkUpdateUserRolesAction(updates: Array<{ userId: string; role: string }>) {
  try {
    const updatePromises = updates.map(({ userId, role }) =>
      adminDatabase.ref(`users/${userId}/role`).set(role)
    )
    
    await Promise.all(updatePromises)
    revalidatePath("/admin/staff")
    revalidatePath("/admin/residents")
    return { success: true }
  } catch (error) {
    console.error("Error bulk updating user roles:", error)
    return { success: false, error: "Failed to update user roles" }
  }
}

// Get recent activity
export async function getRecentActivityAction(limit: number = 20) {
  try {
    const [certificatesSnapshot, appointmentsSnapshot, blotterSnapshot] = await Promise.all([
      adminDatabase.ref("certificates").once("value"),
      adminDatabase.ref("appointments").once("value"),
      adminDatabase.ref("blotter").once("value")
    ])

    const activities: Array<{
      id: string
      type: "certificate" | "appointment" | "blotter"
      action: string
      timestamp: number
      userId: string
      details: any
    }> = []

    // Process certificates
    if (certificatesSnapshot.exists()) {
      const certificates = certificatesSnapshot.val()
      Object.entries(certificates).forEach(([id, cert]: [string, any]) => {
        activities.push({
          id,
          type: "certificate",
          action: `Certificate request: ${cert.type}`,
          timestamp: cert.requestedOn || 0,
          userId: cert.userId || "",
          details: cert
        })
      })
    }

    // Process appointments
    if (appointmentsSnapshot.exists()) {
      const appointments = appointmentsSnapshot.val()
      Object.entries(appointments).forEach(([id, apt]: [string, any]) => {
        activities.push({
          id,
          type: "appointment",
          action: `Appointment scheduled: ${apt.type}`,
          timestamp: apt.scheduledDate || 0,
          userId: apt.userId || "",
          details: apt
        })
      })
    }

    // Process blotter cases
    if (blotterSnapshot.exists()) {
      const blotterCases = blotterSnapshot.val()
      Object.entries(blotterCases).forEach(([id, blot]: [string, any]) => {
        activities.push({
          id,
          type: "blotter",
          action: `Blotter case filed: ${blot.caseType}`,
          timestamp: blot.incidentDate || 0,
          userId: blot.userId || "",
          details: blot
        })
      })
    }

    // Sort by timestamp and return limited results
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }
}
