"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface Appointment {
	id: string;
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

		const appointment: Omit<Appointment, "id"> = {
			...appointmentData,
			id: referenceNumber, // Set the meaningful reference number
			status: "pending",
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await newAppointmentRef.set(appointment);

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
				id,
				...appointment,
				status: appointment.status || "pending",
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
