"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { archiveRecord } from "@/lib/archive-manager";
import {
	sendAppointmentRequestReceivedEmail,
	sendAppointmentStatusEmail,
	type AppointmentEmailData,
} from "@/mails";

export interface Appointment {
	userId: string;
	// Database key (push key)
	id: string;
	// Human-readable reference number (e.g., APT-2025-0526-001)
	referenceNumber: string;
	title: string;
	description: string;
	date: string;
	time: string;
	requestedBy: string;
	contactNumber: string;
	email: string;
	status: "pending" | "confirmed" | "cancelled" | "completed";
	notes?: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreateAppointmentData {
	userId?: string;
	title: string;
	description: string;
	date: string;
	time: string;
	requestedBy: string;
	contactNumber: string;
	email: string;
	notes?: string;
}

export interface UpdateAppointmentData extends Partial<CreateAppointmentData> {
	id: string;
	status?: Appointment["status"];
}

// Create new appointment
export async function createAppointmentAction(
	appointmentData: CreateAppointmentData
): Promise<{ success: boolean; appointmentId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!appointmentData.title ||
			!appointmentData.description ||
			!appointmentData.date ||
			!appointmentData.time ||
			!appointmentData.requestedBy ||
			!appointmentData.contactNumber ||
			!appointmentData.email
		) {
			return {
				success: false,
				error: "All required fields must be filled out.",
			};
		}

		// Generate meaningful reference number
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");
		const day = String(now.getDate()).padStart(2, "0");

		// Get total appointment count to generate sequential number
		const appointmentsRef = adminDatabase.ref("appointments");
		const snapshot = await appointmentsRef.get();

		let totalCount = 0;
		if (snapshot.exists()) {
			totalCount = Object.keys(snapshot.val()).length;
		}

		const sequenceNumber = String(totalCount + 1).padStart(3, "0");
		const referenceNumber = `APT-${year}-${month}${day}-${sequenceNumber}`;

		const newAppointmentRef = appointmentsRef.push();

		const appointmentToSave = {
			...appointmentData,
			userId: appointmentData.userId || "",
			referenceNumber,
			status: "pending" as const,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await newAppointmentRef.set(appointmentToSave);

		// Send email notification to requester
		try {
			const emailPayload: AppointmentEmailData = {
				userName: appointmentData.requestedBy,
				referenceNumber,
				appointmentTitle: appointmentData.title,
				appointmentDate: appointmentData.date,
				appointmentTime: appointmentData.time,
				purpose: appointmentData.description,
				contactPhone: appointmentData.contactNumber,
				contactEmail: appointmentData.email,
				notes: appointmentData.notes,
			};
			await sendAppointmentRequestReceivedEmail(
				appointmentData.email,
				emailPayload
			);
		} catch (emailError) {
			console.error("Failed to send appointment request email:", emailError);
			// Don't fail the entire operation if email fails
		}

		// Send push notification to admins about new appointment
		try {
			const { sendNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendNotificationAction({
				type: "appointment_update",
				targetRoles: ["admin", "official"],
				targetUids: [],
				data: {
					title: "New Appointment Request",
					body: `${appointmentData.requestedBy} requested: ${appointmentData.title}`,
					icon: "/images/malinta_logo.jpg",
					clickAction: "/admin/appointments",
					data: {
						appointmentId: newAppointmentRef.key,
						referenceNumber,
						requestedBy: appointmentData.requestedBy,
					},
				},
				priority: "normal",
			});
		} catch (notificationError) {
			console.error(
				"Error sending appointment notification:",
				notificationError
			);
			// Don't fail the entire operation if notification fails
		}

		return {
			success: true,
			appointmentId: referenceNumber,
		};
	} catch (error) {
		console.error("Error creating appointment:", error);
		return {
			success: false,
			error:
				"Failed to create appointment. Please check your connection and try again.",
		};
	}
}

// Get all appointments
export async function getAllAppointmentsAction(): Promise<{
	success: boolean;
	appointments?: Appointment[];
	error?: string;
}> {
	try {
		const appointmentsRef = adminDatabase.ref("appointments");
		const snapshot = await appointmentsRef.get();

		if (!snapshot.exists()) {
			return { success: true, appointments: [] };
		}

		const appointments = snapshot.val();
		const appointmentsList: Appointment[] = [];

		Object.entries(appointments).forEach(([id, appointment]: [string, any]) => {
			appointmentsList.push({
			userId: appointment.userId || "",
				id, // push key
				referenceNumber: appointment.referenceNumber || id,
				title: appointment.title,
				description: appointment.description,
				date: appointment.date,
				time: appointment.time,
				requestedBy: appointment.requestedBy,
				contactNumber: appointment.contactNumber,
				email: appointment.email,
				status: appointment.status || "pending",
				notes: appointment.notes,
				createdAt: appointment.createdAt || 0,
				updatedAt: appointment.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		appointmentsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, appointments: appointmentsList };
	} catch (error) {
		console.error("Error fetching appointments:", error);
		return {
			success: false,
			error:
				"Failed to fetch appointments. Please check your connection and try again.",
		};
	}
}

// Get appointments for a specific user
export async function getAppointmentsForUserAction(
	userId: string
): Promise<{ success: boolean; appointments?: Appointment[]; error?: string }> {
	try {
		if (!userId) {
			return { success: false, error: "User ID is required." };
		}

		const appointmentsRef = adminDatabase.ref("appointments");
		const snapshot = await appointmentsRef
			.orderByChild("userId")
			.equalTo(userId)
			.get();

		if (!snapshot.exists()) {
			return { success: true, appointments: [] };
		}

		const appointments = snapshot.val();
		const appointmentsList: Appointment[] = [];

		Object.entries(appointments).forEach(
			([id, appointment]: [string, any]) => {
				appointmentsList.push({
					userId: appointment.userId || userId,
					id,
					referenceNumber: appointment.referenceNumber || id,
					title: appointment.title,
					description: appointment.description,
					date: appointment.date,
					time: appointment.time,
					requestedBy: appointment.requestedBy,
					contactNumber: appointment.contactNumber,
					email: appointment.email,
					status: appointment.status || "pending",
					notes: appointment.notes,
					createdAt: appointment.createdAt || 0,
					updatedAt: appointment.updatedAt || 0,
				});
			}
		);

		appointmentsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, appointments: appointmentsList };
	} catch (error) {
		console.error("Error fetching appointments for user:", error);
		return {
			success: false,
			error:
				"Failed to fetch appointments. Please check your connection and try again.",
		};
	}
}

// Update appointment status and notify resident
export async function updateAppointmentStatusAction(
	appointmentId: string,
	status: "confirmed" | "cancelled" | "completed",
	notes?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const appointmentRef = adminDatabase.ref(`appointments/${appointmentId}`);
		const snapshot = await appointmentRef.get();

		if (!snapshot.exists()) {
			return { success: false, error: "Appointment not found" };
		}

		const appointment = snapshot.val() as Appointment;

		// Update appointment status
		await appointmentRef.update({
			status,
			notes: notes || appointment.notes,
			updatedAt: Date.now(),
		});

		// Send email notification based on status change
		try {
			if (appointment.email) {
				const emailData: AppointmentEmailData = {
					userName: appointment.requestedBy,
					referenceNumber: appointment.referenceNumber || appointmentId,
					appointmentTitle: appointment.title,
					appointmentDate: appointment.date,
					appointmentTime: appointment.time,
					purpose: appointment.description,
					contactPhone: appointment.contactNumber,
					contactEmail: appointment.email,
					notes: notes || appointment.notes,
				};

				await sendAppointmentStatusEmail(appointment.email, status, emailData);
			}
		} catch (emailError) {
			console.error("Failed to send appointment status email:", emailError);
			// Don't fail the status update if email fails
		}

		// Send push notification to resident about status update
		try {
			const { sendAppointmentUpdateNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendAppointmentUpdateNotificationAction(
				appointment.requestedBy, // This should be UID in a real implementation
				appointment.requestedBy, // Resident name
				appointment.title,
				status,
				appointmentId
			);
		} catch (notificationError) {
			console.error(
				"Error sending appointment update notification:",
				notificationError
			);
			// Don't fail the entire operation if notification fails
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating appointment status:", error);
		return { success: false, error: "Failed to update appointment status" };
	}
}

// Get count of appointments by status
export async function getAppointmentsCountAction(): Promise<{
	success: boolean;
	counts?: {
		total: number;
		pending: number;
		confirmed: number;
		cancelled: number;
		completed: number;
	};
	error?: string;
}> {
	try {
		const appointmentsRef = adminDatabase.ref("appointments");
		const snapshot = await appointmentsRef.get();

		if (!snapshot.exists()) {
			return {
				success: true,
				counts: {
					total: 0,
					pending: 0,
					confirmed: 0,
					cancelled: 0,
					completed: 0,
				},
			};
		}

		const appointments = snapshot.val();
		const counts = {
			total: 0,
			pending: 0,
			confirmed: 0,
			cancelled: 0,
			completed: 0,
		};

		Object.values(appointments).forEach((appointment: any) => {
			counts.total++;
			const status = appointment.status || "pending";
			if (status in counts) {
				counts[status as keyof typeof counts]++;
			}
		});

		return { success: true, counts };
	} catch (error) {
		console.error("Error fetching appointment counts:", error);
		return {
			success: false,
			error: "Failed to fetch appointment counts. Please try again.",
		};
	}
}

// Update appointment details
export async function updateAppointmentAction(
	appointmentData: UpdateAppointmentData
): Promise<{ success: boolean; error?: string }> {
	try {
		const { id, ...updateData } = appointmentData;
		const appointmentRef = adminDatabase.ref(`appointments/${id}`);
		const snapshot = await appointmentRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Appointment not found.",
			};
		}

		await appointmentRef.update({
			...updateData,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating appointment:", error);
		return {
			success: false,
			error: "Failed to update appointment. Please try again.",
		};
	}
}

// Delete appointment
export async function deleteAppointmentAction(
	appointmentId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const appointmentRef = adminDatabase.ref(`appointments/${appointmentId}`);
		const snapshot = await appointmentRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Appointment not found.",
			};
		}

		const appointment = snapshot.val() as Appointment;

		await archiveRecord({
			entity: "appointments",
			id: appointmentId,
			paths: {
				[`appointments/${appointmentId}`]: appointment,
			},
			preview: {
				title: appointment.title,
				status: appointment.status || "pending",
				requestedBy: appointment.requestedBy,
				referenceNumber: appointment.referenceNumber,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting appointment:", error);
		return {
			success: false,
			error: "Failed to delete appointment. Please try again.",
		};
	}
}

// Get appointments by status
export async function getAppointmentsByStatusAction(
	status: Appointment["status"]
): Promise<{
	success: boolean;
	appointments?: Appointment[];
	error?: string;
}> {
	try {
		const appointmentsRef = adminDatabase.ref("appointments");
		const snapshot = await appointmentsRef
			.orderByChild("status")
			.equalTo(status)
			.get();

		if (!snapshot.exists()) {
			return { success: true, appointments: [] };
		}

		const appointments = snapshot.val();
		const appointmentsList: Appointment[] = [];

		Object.entries(appointments).forEach(([id, appointment]: [string, any]) => {
			appointmentsList.push({
			userId: appointment.userId || "",
				id,
				referenceNumber: appointment.referenceNumber || id,
				title: appointment.title,
				description: appointment.description,
				date: appointment.date,
				time: appointment.time,
				requestedBy: appointment.requestedBy,
				contactNumber: appointment.contactNumber,
				email: appointment.email,
				status: appointment.status || "pending",
				notes: appointment.notes,
				createdAt: appointment.createdAt || 0,
				updatedAt: appointment.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		appointmentsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, appointments: appointmentsList };
	} catch (error) {
		console.error("Error fetching appointments by status:", error);
		return {
			success: false,
			error: "Failed to fetch appointments. Please try again.",
		};
	}
}

// Get appointment by ID
export async function getAppointmentByIdAction(appointmentId: string): Promise<{
	success: boolean;
	appointment?: Appointment;
	error?: string;
}> {
	try {
		const appointmentRef = adminDatabase.ref(`appointments/${appointmentId}`);
		const snapshot = await appointmentRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Appointment not found.",
			};
		}

		const appointment = snapshot.val();
		const appointmentData: Appointment = {
		userId: appointment.userId || "",
			id: appointmentId,
			referenceNumber: appointment.referenceNumber || appointmentId,
			title: appointment.title,
			description: appointment.description,
			date: appointment.date,
			time: appointment.time,
			requestedBy: appointment.requestedBy,
			contactNumber: appointment.contactNumber,
			email: appointment.email,
			status: appointment.status || "pending",
			notes: appointment.notes,
			createdAt: appointment.createdAt || 0,
			updatedAt: appointment.updatedAt || 0,
		};

		return { success: true, appointment: appointmentData };
	} catch (error) {
		console.error("Error fetching appointment:", error);
		return {
			success: false,
			error: "Failed to fetch appointment. Please try again.",
		};
	}
}
