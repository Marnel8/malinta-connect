"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { archiveRecord } from "@/lib/archive-manager";
import {
	sendEventCreatedEmail,
	type EventEmailData,
} from "@/mails";

export interface Event {
	id: string;
	name: string;
	date: string;
	time: string;
	location: string;
	description: string;
	category:
		| "community"
		| "health"
		| "education"
		| "sports"
		| "culture"
		| "government";
	organizer: string;
	contact: string;
	image?: string;
	status: "active" | "inactive";
	featured: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface CreateEventData {
	name: string;
	date: string;
	time: string;
	location: string;
	description: string;
	category:
		| "community"
		| "health"
		| "education"
		| "sports"
		| "culture"
		| "government";
	organizer: string;
	contact: string;
	image?: string;
	featured?: boolean;
}

export interface UpdateEventData extends Partial<CreateEventData> {
	id: string;
	status?: "active" | "inactive";
}

// Create new event
export async function createEventAction(
	eventData: CreateEventData
): Promise<{ success: boolean; eventId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!eventData.name ||
			!eventData.date ||
			!eventData.time ||
			!eventData.location ||
			!eventData.description ||
			!eventData.organizer ||
			!eventData.contact
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

		// Get total event count to generate sequential number
		const eventsRef = adminDatabase.ref("events");
		const snapshot = await eventsRef.get();

		let totalCount = 0;
		if (snapshot.exists()) {
			totalCount = Object.keys(snapshot.val()).length;
		}

		const sequenceNumber = String(totalCount + 1).padStart(3, "0");
		const referenceNumber = `EVT-${year}-${month}${day}-${sequenceNumber}`;

		const newEventRef = eventsRef.push();

		const event: Omit<Event, "id"> = {
			...eventData,
			id: referenceNumber, // Set the meaningful reference number
			status: "active",
			featured: eventData.featured || false,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await newEventRef.set(event);

		// Send push notification to all residents about new event
		try {
			const { sendEventNotificationAction } = await import(
				"@/app/actions/notifications"
			);
			await sendEventNotificationAction(
				eventData.name,
				eventData.date,
				referenceNumber
			);
		} catch (notificationError) {
			console.error("Error sending event notification:", notificationError);
			// Don't fail the entire operation if notification fails
		}

		// Send email notification to all residents about new event
		try {
			// Get all resident emails
			const residentsRef = adminDatabase.ref("residents");
			const residentsSnapshot = await residentsRef.get();
			const residentEmails: string[] = [];

			if (residentsSnapshot.exists()) {
				const residents = residentsSnapshot.val();
				Object.values(residents).forEach((resident: any) => {
					if (resident?.contactInfo?.email) {
						residentEmails.push(resident.contactInfo.email);
					}
				});
			}

			if (residentEmails.length > 0) {
				const formattedDate = new Date(eventData.date).toLocaleDateString(
					"en-US",
					{
						year: "numeric",
						month: "long",
						day: "numeric",
					}
				);

				const emailData: EventEmailData = {
					eventName: eventData.name,
					eventDate: formattedDate,
					eventTime: eventData.time,
					eventLocation: eventData.location,
					eventDescription: eventData.description,
					eventCategory: eventData.category,
					organizer: eventData.organizer,
					contact: eventData.contact,
					referenceNumber,
					contactPhone: process.env.CONTACT_PHONE || "+63 912 345 6789",
					contactEmail: process.env.CONTACT_EMAIL || "info@malinta-connect.com",
				};

				await sendEventCreatedEmail(residentEmails, emailData);
			}
		} catch (emailError) {
			console.error("Failed to send event created email:", emailError);
			// Don't fail the entire operation if email fails
		}

		return {
			success: true,
			eventId: referenceNumber,
		};
	} catch (error) {
		console.error("Error creating event:", error);
		return {
			success: false,
			error:
				"Failed to create event. Please check your connection and try again.",
		};
	}
}

// Get all events
export async function getAllEventsAction(): Promise<{
	success: boolean;
	events?: Event[];
	error?: string;
}> {
	try {
		const eventsRef = adminDatabase.ref("events");
		const snapshot = await eventsRef.get();

		if (!snapshot.exists()) {
			return { success: true, events: [] };
		}

		const events = snapshot.val();
		const eventsList: Event[] = [];

		Object.entries(events).forEach(([id, event]: [string, any]) => {
			eventsList.push({
				...event,
				id, // Use Firebase key as ID (overwrites reference number from event data)
				status: event.status || "active",
				featured: event.featured || false,
				createdAt: event.createdAt || 0,
				updatedAt: event.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		eventsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, events: eventsList };
	} catch (error) {
		console.error("Error fetching events:", error);
		return {
			success: false,
			error:
				"Failed to fetch events. Please check your connection and try again.",
		};
	}
}

// Get single event
export async function getEventAction(
	id: string
): Promise<{ success: boolean; event?: Event; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Event ID is required.",
			};
		}

		const eventRef = adminDatabase.ref(`events/${id}`);
		const snapshot = await eventRef.get();

		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Event not found.",
			};
		}

		const event = snapshot.val();
		return {
			success: true,
			event: {
				...event,
				id, // Use Firebase key as ID (overwrites reference number from event data)
				status: event.status || "active",
				featured: event.featured || false,
				createdAt: event.createdAt || 0,
				updatedAt: event.updatedAt || 0,
			},
		};
	} catch (error) {
		console.error("Error fetching event:", error);
		return {
			success: false,
			error:
				"Failed to fetch event. Please check your connection and try again.",
		};
	}
}

// Update event
export async function updateEventAction(
	eventData: UpdateEventData
): Promise<{ success: boolean; error?: string }> {
	try {
		const { id, ...updateData } = eventData;

		// Validate required fields
		if (!id) {
			return {
				success: false,
				error: "Event ID is required for updates.",
			};
		}

		const eventRef = adminDatabase.ref(`events/${id}`);

		// Check if event exists
		const snapshot = await eventRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Event not found. It may have been deleted by another user.",
			};
		}

		// Update the event with new data and timestamp
		await eventRef.update({
			...updateData,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating event:", error);
		return {
			success: false,
			error:
				"Failed to update event. Please check your connection and try again.",
		};
	}
}

// Delete event
export async function deleteEventAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Event ID is required for deletion.",
			};
		}

		const eventRef = adminDatabase.ref(`events/${id}`);

		// Check if event exists
		const snapshot = await eventRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Event not found. It may have been deleted by another user.",
			};
		}

		const event = snapshot.val();

		await archiveRecord({
			entity: "events",
			id,
			paths: {
				[`events/${id}`]: event,
			},
			preview: {
				title: event.name,
				status: event.status || "active",
				category: event.category,
				date: event.date,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Error deleting event:", error);
		return {
			success: false,
			error:
				"Failed to delete event. Please check your connection and try again.",
		};
	}
}

// Toggle event status
export async function toggleEventStatusAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Event ID is required.",
			};
		}

		const eventRef = adminDatabase.ref(`events/${id}`);

		// Check if event exists
		const snapshot = await eventRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Event not found. It may have been deleted by another user.",
			};
		}

		const currentStatus = snapshot.val().status || "active";
		const newStatus = currentStatus === "active" ? "inactive" : "active";

		// Update the status
		await eventRef.update({
			status: newStatus,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error toggling event status:", error);
		return {
			success: false,
			error:
				"Failed to toggle event status. Please check your connection and try again.",
		};
	}
}

// Toggle featured status
export async function toggleFeaturedStatusAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Event ID is required.",
			};
		}

		const eventRef = adminDatabase.ref(`events/${id}`);

		// Check if event exists
		const snapshot = await eventRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error: "Event not found. It may have been deleted by another user.",
			};
		}

		const currentFeatured = snapshot.val().featured || false;
		const newFeatured = !currentFeatured;

		// Update the featured status
		await eventRef.update({
			featured: newFeatured,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error toggling featured status:", error);
		return {
			success: false,
			error:
				"Failed to toggle featured status. Please check your connection and try again.",
		};
	}
}

// Get events by category
export async function getEventsByCategoryAction(
	category: string
): Promise<{ success: boolean; events?: Event[]; error?: string }> {
	try {
		const eventsRef = adminDatabase.ref("events");
		const snapshot = await eventsRef
			.orderByChild("category")
			.equalTo(category)
			.get();

		if (!snapshot.exists()) {
			return { success: true, events: [] };
		}

		const events = snapshot.val();
		const eventsList: Event[] = [];

		Object.entries(events).forEach(([id, event]: [string, any]) => {
			eventsList.push({
				...event,
				id, // Use Firebase key as ID (overwrites reference number from event data)
				status: event.status || "active",
				featured: event.featured || false,
				createdAt: event.createdAt || 0,
				updatedAt: event.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		eventsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, events: eventsList };
	} catch (error) {
		console.error("Error fetching events by category:", error);
		return {
			success: false,
			error: "Failed to fetch events by category. Please try again.",
		};
	}
}

// Get featured events
export async function getFeaturedEventsAction(): Promise<{
	success: boolean;
	events?: Event[];
	error?: string;
}> {
	try {
		const eventsRef = adminDatabase.ref("events");
		const snapshot = await eventsRef
			.orderByChild("featured")
			.equalTo(true)
			.get();

		if (!snapshot.exists()) {
			return { success: true, events: [] };
		}

		const events = snapshot.val();
		const eventsList: Event[] = [];

		Object.entries(events).forEach(([id, event]: [string, any]) => {
			eventsList.push({
				...event,
				id, // Use Firebase key as ID (overwrites reference number from event data)
				status: event.status || "active",
				featured: event.featured || false,
				createdAt: event.createdAt || 0,
				updatedAt: event.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		eventsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, events: eventsList };
	} catch (error) {
		console.error("Error fetching featured events:", error);
		return {
			success: false,
			error: "Failed to fetch featured events. Please try again.",
		};
	}
}

// Get count of events by status
export async function getEventsCountAction(): Promise<{
	success: boolean;
	counts?: {
		total: number;
		active: number;
		inactive: number;
		featured: number;
	};
	error?: string;
}> {
	try {
		const eventsRef = adminDatabase.ref("events");
		const snapshot = await eventsRef.get();

		if (!snapshot.exists()) {
			return {
				success: true,
				counts: {
					total: 0,
					active: 0,
					inactive: 0,
					featured: 0,
				},
			};
		}

		const events = snapshot.val();
		const counts = {
			total: 0,
			active: 0,
			inactive: 0,
			featured: 0,
		};

		Object.values(events).forEach((event: any) => {
			counts.total++;
			const status = event.status || "active";
			if (status === "active") counts.active++;
			if (status === "inactive") counts.inactive++;
			if (event.featured) counts.featured++;
		});

		return { success: true, counts };
	} catch (error) {
		console.error("Error fetching event counts:", error);
		return {
			success: false,
			error: "Failed to fetch event counts. Please try again.",
		};
	}
}
