"use server"

import { adminDatabase } from "@/app/firebase/admin"
import { revalidatePath } from "next/cache"

export interface OverviewStats {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
  icon: string
}

export interface CertificateStats {
  total: number
  breakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
  status: Array<{
    status: string
    count: number
  }>
}

export interface AppointmentStats {
  total: number
  breakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
  status: Array<{
    status: string
    count: number
  }>
}

export interface BlotterStats {
  total: number
  breakdown: Array<{
    type: string
    count: number
    percentage: number
  }>
  status: Array<{
    status: string
    count: number
  }>
}

export interface AnalyticsData {
  overview: OverviewStats[]
  certificates: CertificateStats
  appointments: AppointmentStats
  blotter: BlotterStats
}

// Get overview statistics
export async function getOverviewStats(): Promise<OverviewStats[]> {
  try {
    const [residentsCount, certificatesCount, appointmentsCount, blotterCount] = await Promise.all([
      getResidentsCount(),
      getCertificatesCount(),
      getAppointmentsCount(),
      getBlotterCount()
    ])

    const [residentsChange, certificatesChange, appointmentsChange, blotterChange] = await Promise.all([
      getResidentsChange(),
      getCertificatesChange(),
      getAppointmentsChange(),
      getBlotterChange()
    ])

    return [
      {
        title: "Total Residents",
        value: residentsCount.toString(),
        change: `${residentsChange >= 0 ? '+' : ''}${residentsChange}%`,
        trend: residentsChange >= 0 ? "up" : "down",
        description: "vs. last month",
        icon: "Users"
      },
      {
        title: "Certificate Requests",
        value: certificatesCount.toString(),
        change: `${certificatesChange >= 0 ? '+' : ''}${certificatesChange}%`,
        trend: certificatesChange >= 0 ? "up" : "down",
        description: "vs. last month",
        icon: "FileText"
      },
      {
        title: "Appointments",
        value: appointmentsCount.toString(),
        change: `${appointmentsChange >= 0 ? '+' : ''}${appointmentsChange}%`,
        trend: appointmentsChange >= 0 ? "up" : "down",
        description: "vs. last month",
        icon: "Calendar"
      },
      {
        title: "Blotter Reports",
        value: blotterCount.toString(),
        change: `${blotterChange >= 0 ? '+' : ''}${blotterChange}%`,
        trend: blotterChange >= 0 ? "up" : "down",
        description: "vs. last month",
        icon: "MessageSquare"
      }
    ]
  } catch (error) {
    console.error("Error fetching overview stats:", error)
    throw new Error("Failed to fetch overview statistics")
  }
}

// Get certificate statistics
export async function getCertificateStats(): Promise<CertificateStats> {
  try {
    const certificatesRef = adminDatabase.ref("certificates")
    const snapshot = await certificatesRef.once("value")
    
    if (!snapshot.exists()) {
      return {
        total: 0,
        breakdown: [],
        status: []
      }
    }

    const certificates = snapshot.val()
    const total = Object.keys(certificates).length
    
    // Calculate breakdown by type
    const typeCount: { [key: string]: number } = {}
    const statusCount: { [key: string]: number } = {}
    
    Object.values(certificates).forEach((cert: any) => {
      // Count by type
      const type = cert.type || "Unknown"
      typeCount[type] = (typeCount[type] || 0) + 1
      
      // Count by status
      const status = cert.status || "Pending"
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    const breakdown = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }))

    const status = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }))

    return { total, breakdown, status }
  } catch (error) {
    console.error("Error fetching certificate stats:", error)
    throw new Error("Failed to fetch certificate statistics")
  }
}

// Get appointment statistics
export async function getAppointmentStats(): Promise<AppointmentStats> {
  try {
    const appointmentsRef = adminDatabase.ref("appointments")
    const snapshot = await appointmentsRef.once("value")
    
    if (!snapshot.exists()) {
      return {
        total: 0,
        breakdown: [],
        status: []
      }
    }

    const appointments = snapshot.val()
    const total = Object.keys(appointments).length
    
    // Calculate breakdown by type
    const typeCount: { [key: string]: number } = {}
    const statusCount: { [key: string]: number } = {}
    
    Object.values(appointments).forEach((appointment: any) => {
      // Count by type
      const type = appointment.type || "Unknown"
      typeCount[type] = (typeCount[type] || 0) + 1
      
      // Count by status
      const status = appointment.status || "Pending"
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    const breakdown = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }))

    const status = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }))

    return { total, breakdown, status }
  } catch (error) {
    console.error("Error fetching appointment stats:", error)
    throw new Error("Failed to fetch appointment statistics")
  }
}

// Get blotter statistics
export async function getBlotterStats(): Promise<BlotterStats> {
  try {
    const blotterRef = adminDatabase.ref("blotter")
    const snapshot = await blotterRef.once("value")
    
    if (!snapshot.exists()) {
      return {
        total: 0,
        breakdown: [],
        status: []
      }
    }

    const blotterEntries = snapshot.val()
    const total = Object.keys(blotterEntries).length
    
    // Calculate breakdown by type
    const typeCount: { [key: string]: number } = {}
    const statusCount: { [key: string]: number } = {}
    
    Object.values(blotterEntries).forEach((entry: any) => {
      // Count by type
      const type = entry.type || "Unknown"
      typeCount[type] = (typeCount[type] || 0) + 1
      
      // Count by status
      const status = entry.status || "Under Investigation"
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    const breakdown = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / total) * 100)
    }))

    const status = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count
    }))

    return { total, breakdown, status }
  } catch (error) {
    console.error("Error fetching blotter stats:", error)
    throw new Error("Failed to fetch blotter statistics")
  }
}

// Get all analytics data
export async function getAllAnalytics(): Promise<AnalyticsData> {
  try {
    const [overview, certificates, appointments, blotter] = await Promise.all([
      getOverviewStats(),
      getCertificateStats(),
      getAppointmentStats(),
      getBlotterStats()
    ])

    return { overview, certificates, appointments, blotter }
  } catch (error) {
    console.error("Error fetching all analytics:", error)
    throw new Error("Failed to fetch analytics data")
  }
}

// Helper functions for calculating changes
async function getResidentsCount(): Promise<number> {
  try {
    const residentsRef = adminDatabase.ref("users")
    const snapshot = await residentsRef.orderByChild("role").equalTo("resident").once("value")
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0
  } catch (error) {
    return 0
  }
}

async function getCertificatesCount(): Promise<number> {
  try {
    const certificatesRef = adminDatabase.ref("certificates")
    const snapshot = await certificatesRef.once("value")
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0
  } catch (error) {
    return 0
  }
}

async function getAppointmentsCount(): Promise<number> {
  try {
    const appointmentsRef = adminDatabase.ref("appointments")
    const snapshot = await appointmentsRef.once("value")
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0
  } catch (error) {
    return 0
  }
}

async function getBlotterCount(): Promise<number> {
  try {
    const blotterRef = adminDatabase.ref("blotter")
    const snapshot = await blotterRef.once("value")
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0
  } catch (error) {
    return 0
  }
}

// Calculate month-over-month changes (simplified - returns random change for demo)
async function getResidentsChange(): Promise<number> {
  // In a real implementation, you would compare current month vs previous month
  return Math.floor(Math.random() * 20) - 10 // Random change between -10 and +10
}

async function getCertificatesChange(): Promise<number> {
  return Math.floor(Math.random() * 20) - 10
}

async function getAppointmentsChange(): Promise<number> {
  return Math.floor(Math.random() * 20) - 10
}

async function getBlotterChange(): Promise<number> {
  return Math.floor(Math.random() * 20) - 10
}
