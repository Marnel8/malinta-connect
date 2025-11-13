"use server"

import { adminDatabase } from "@/app/firebase/admin"
import { ref, get, query, orderByChild, equalTo, startAt, endAt } from "firebase-admin/database"
import { revalidatePath } from "next/cache"

export interface DashboardStats {
  pendingCertificates: number
  upcomingAppointments: number
  activeBlotterCases: number
  registeredResidents: number
  certificatesChange: number
  appointmentsChange: number
  blotterChange: number
  residentsChange: number
}

export interface CertificateRequest {
  id: string
  type: string
  status: "pending" | "processing" | "completed" | "rejected" | "additional_info_required"
  requestedBy: string
  requestedOn: number
  referenceNumber: string
  userId: string
}

export interface AppointmentItem {
  id: string
  type: string
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  residentName: string
  scheduledDate: number
  timeSlot: string
  userId: string
}

export interface BlotterItem {
  id: string
  caseNumber: string
  status: "active" | "resolved" | "pending" | "closed"
  complainant: string
  respondent: string
  incidentDate: number
  caseType: string
  userId: string
}

// Get dashboard statistics
// Note: Using simple queries to avoid Firebase index warnings
// Once database indexes are deployed, these can be optimized with orderByChild queries
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const now = Date.now()
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000)
    const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000)

    // Get current counts
    const [certificatesSnapshot, appointmentsSnapshot, blotterSnapshot, residentsSnapshot] = await Promise.all([
      adminDatabase.ref("certificates").once("value"),
      adminDatabase.ref("appointments").once("value"),
      adminDatabase.ref("blotter").once("value"),
      adminDatabase.ref("users").once("value")
    ])

    // Get historical counts for comparison - use simpler queries to avoid index warnings
    const [certificatesHistorySnapshot, appointmentsHistorySnapshot, blotterHistorySnapshot, residentsHistorySnapshot] = await Promise.all([
      adminDatabase.ref("certificates").once("value"),
      adminDatabase.ref("appointments").once("value"),
      adminDatabase.ref("blotter").once("value"),
      adminDatabase.ref("users").once("value")
    ])

    // Calculate current counts
    const pendingCertificates = certificatesSnapshot.exists() 
      ? Object.values(certificatesSnapshot.val() || {}).filter((cert: any) => cert.status === "pending").length 
      : 0

    const upcomingAppointments = appointmentsSnapshot.exists() 
      ? Object.values(appointmentsSnapshot.val() || {}).filter((apt: any) => 
          apt.status === "scheduled" && apt.scheduledDate > now
        ).length 
      : 0

    const activeBlotterCases = blotterSnapshot.exists() 
      ? Object.values(blotterSnapshot.val() || {}).filter((blot: any) => blot.status === "active").length 
      : 0

    const registeredResidents = residentsSnapshot.exists() 
      ? Object.values(residentsSnapshot.val() || {}).filter((user: any) => user.role === "resident").length 
      : 0

    // Calculate changes by filtering data in memory
    const currentCertificates = certificatesSnapshot.exists() ? Object.keys(certificatesSnapshot.val() || {}).length : 0
    const currentAppointments = appointmentsSnapshot.exists() ? Object.keys(appointmentsSnapshot.val() || {}).length : 0
    const currentBlotter = blotterSnapshot.exists() ? Object.keys(blotterSnapshot.val() || {}).length : 0
    const currentResidents = residentsSnapshot.exists() ? Object.keys(residentsSnapshot.val() || {}).length : 0

    // Filter historical data in memory to avoid index warnings
    const historicalCertificates = certificatesHistorySnapshot.exists() 
      ? Object.values(certificatesHistorySnapshot.val() || {}).filter((cert: any) => 
          cert.requestedOn && cert.requestedOn >= twoMonthsAgo && cert.requestedOn <= oneMonthAgo
        ).length 
      : 0
    const historicalAppointments = appointmentsHistorySnapshot.exists() 
      ? Object.values(appointmentsHistorySnapshot.val() || {}).filter((apt: any) => 
          apt.scheduledDate && apt.scheduledDate >= twoMonthsAgo && apt.scheduledDate <= oneMonthAgo
        ).length 
      : 0
    const historicalBlotter = blotterHistorySnapshot.exists() 
      ? Object.values(blotterHistorySnapshot.val() || {}).filter((blot: any) => 
          blot.incidentDate && blot.incidentDate >= twoMonthsAgo && blot.incidentDate <= oneMonthAgo
        ).length 
      : 0
    const historicalResidents = residentsHistorySnapshot.exists() 
      ? Object.values(residentsHistorySnapshot.val() || {}).filter((user: any) => 
          user.createdAt && user.createdAt >= twoMonthsAgo && user.createdAt <= oneMonthAgo
        ).length 
      : 0

    const certificatesChange = historicalCertificates > 0 
      ? Math.round(((currentCertificates - historicalCertificates) / historicalCertificates) * 100)
      : 0
    const appointmentsChange = historicalAppointments > 0 
      ? Math.round(((currentAppointments - historicalAppointments) / historicalAppointments) * 100)
      : 0
    const blotterChange = historicalBlotter > 0 
      ? Math.round(((currentBlotter - historicalBlotter) / historicalBlotter) * 100)
      : 0
    const residentsChange = historicalResidents > 0 
      ? Math.round(((currentResidents - historicalResidents) / historicalResidents) * 100)
      : 0

    return {
      pendingCertificates,
      upcomingAppointments,
      activeBlotterCases,
      registeredResidents,
      certificatesChange,
      appointmentsChange,
      blotterChange,
      residentsChange
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      pendingCertificates: 0,
      upcomingAppointments: 0,
      activeBlotterCases: 0,
      registeredResidents: 0,
      certificatesChange: 0,
      appointmentsChange: 0,
      blotterChange: 0,
      residentsChange: 0
    }
  }
}

// Get recent certificate requests
export async function getRecentCertificateRequests(limit: number = 10): Promise<CertificateRequest[]> {
  try {
    const certificatesSnapshot = await adminDatabase.ref("certificates").once("value")

    if (!certificatesSnapshot.exists()) {
      return []
    }

    const certificates = certificatesSnapshot.val()
    return Object.entries(certificates)
      .map(([id, cert]: [string, any]) => ({
        id,
        type: cert.type || "Unknown",
        status: cert.status || "pending",
        requestedBy: cert.requestedBy || "Unknown",
        requestedOn: cert.requestedOn || 0,
        referenceNumber: cert.referenceNumber || "",
        userId: cert.userId || ""
      }))
      .sort((a, b) => b.requestedOn - a.requestedOn)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent certificate requests:", error)
    return []
  }
}

// Get recent appointments
export async function getRecentAppointments(limit: number = 10): Promise<AppointmentItem[]> {
  try {
    const appointmentsSnapshot = await adminDatabase.ref("appointments").once("value")

    if (!appointmentsSnapshot.exists()) {
      return []
    }

    const appointments = appointmentsSnapshot.val()
    return Object.entries(appointments)
      .map(([id, apt]: [string, any]) => ({
        id,
        type: apt.type || "Unknown",
        status: apt.status || "scheduled",
        residentName: apt.residentName || "Unknown",
        scheduledDate: apt.scheduledDate || 0,
        timeSlot: apt.timeSlot || "",
        userId: apt.userId || ""
      }))
      .sort((a, b) => a.scheduledDate - b.scheduledDate)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent appointments:", error)
    return []
  }
}

// Get recent blotter cases
export async function getRecentBlotterCases(limit: number = 10): Promise<BlotterItem[]> {
  try {
    const blotterSnapshot = await adminDatabase.ref("blotter").once("value")

    if (!blotterSnapshot.exists()) {
      return []
    }

    const blotterCases = blotterSnapshot.val()
    return Object.entries(blotterCases)
      .map(([id, blot]: [string, any]) => ({
        id,
        caseNumber: blot.caseNumber || "",
        status: blot.status || "active",
        complainant: blot.complainant || "Unknown",
        respondent: blot.respondent || "Unknown",
        incidentDate: blot.incidentDate || 0,
        caseType: blot.caseType || "Unknown",
        userId: blot.userId || ""
      }))
      .sort((a, b) => b.incidentDate - a.incidentDate)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching recent blotter cases:", error)
    return []
  }
}

export async function getAllCertificateRequests(): Promise<CertificateRequest[]> {
	try {
		const certificatesSnapshot = await adminDatabase.ref("certificates").once("value")

		if (!certificatesSnapshot.exists()) {
			return []
		}

		const certificates = certificatesSnapshot.val()
		return Object.entries(certificates)
			.map(([id, cert]: [string, any]) => ({
				id,
				type: cert.type || "Unknown",
				status: cert.status || "pending",
				requestedBy: cert.requestedBy || "Unknown",
				requestedOn: cert.requestedOn || 0,
				referenceNumber: cert.referenceNumber || "",
				userId: cert.userId || "",
			}))
			.sort((a, b) => b.requestedOn - a.requestedOn)
	} catch (error) {
		console.error("Error fetching all certificate requests:", error)
		return []
	}
}

export async function getAllAppointments(): Promise<AppointmentItem[]> {
	try {
		const appointmentsSnapshot = await adminDatabase.ref("appointments").once("value")

		if (!appointmentsSnapshot.exists()) {
			return []
		}

		const appointments = appointmentsSnapshot.val()
		return Object.entries(appointments)
			.map(([id, apt]: [string, any]) => ({
				id,
				type: apt.type || "Unknown",
				status: apt.status || "scheduled",
				residentName: apt.residentName || "Unknown",
				scheduledDate: Number(apt.scheduledDate) || 0,
				timeSlot: apt.timeSlot || "",
				userId: apt.userId || "",
			}))
			.sort((a, b) => (a.scheduledDate || 0) - (b.scheduledDate || 0))
	} catch (error) {
		console.error("Error fetching all appointments:", error)
		return []
	}
}

export async function getAllBlotterCases(): Promise<BlotterItem[]> {
	try {
		const blotterSnapshot = await adminDatabase.ref("blotter").once("value")

		if (!blotterSnapshot.exists()) {
			return []
		}

		const blotterCases = blotterSnapshot.val()
		return Object.entries(blotterCases)
			.map(([id, blot]: [string, any]) => ({
				id,
				caseNumber: blot.caseNumber || "",
				status: blot.status || "active",
				complainant: blot.complainant || "Unknown",
				respondent: blot.respondent || "Unknown",
				incidentDate: blot.incidentDate || 0,
				caseType: blot.caseType || "Unknown",
				userId: blot.userId || "",
			}))
			.sort((a, b) => (b.incidentDate || 0) - (a.incidentDate || 0))
	} catch (error) {
		console.error("Error fetching all blotter cases:", error)
		return []
	}
}

export interface DashboardExportData {
	certificates: CertificateRequest[]
	appointments: AppointmentItem[]
	blotter: BlotterItem[]
}

export async function getDashboardDataForExport(): Promise<DashboardExportData> {
	const [certificates, appointments, blotter] = await Promise.all([
		getAllCertificateRequests(),
		getAllAppointments(),
		getAllBlotterCases(),
	])

	return {
		certificates,
		appointments,
		blotter,
	}
}

// Get user profile for display name
export async function getUserDisplayName(userId: string): Promise<string> {
  try {
    const userSnapshot = await adminDatabase.ref(`users/${userId}`).once("value")
    if (userSnapshot.exists()) {
      const user = userSnapshot.val()
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`
      }
      return user.email || "Unknown User"
    }
    return "Unknown User"
  } catch (error) {
    console.error("Error fetching user display name:", error)
    return "Unknown User"
  }
}

// Revalidate admin dashboard
export async function revalidateAdminDashboard() {
  revalidatePath("/admin")
  revalidatePath("/admin/certificates")
  revalidatePath("/admin/appointments")
  revalidatePath("/admin/blotter")
}
