"use server";

import { adminDatabase } from "@/app/firebase/admin";
import { sendBlotterStatusEmail, type BlotterEmailData } from "@/mails";

export interface BlotterEntry {
	id: string;
	referenceNumber: string;
	type: string;
	description: string;
	reportedBy: string;
	contactNumber: string;
	email: string;
	status:
		| "pending"
		| "investigating"
		| "resolved"
		| "additionalInfo"
		| "closed";
	priority: "low" | "medium" | "high" | "urgent";
	location?: string;
	incidentDate?: string;
	date: string;
	notes?: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreateBlotterData {
	type: string;
	description: string;
	reportedBy: string;
	contactNumber: string;
	email: string;
	priority: BlotterEntry["priority"];
	location?: string;
	incidentDate?: string;
	notes?: string;
}

export interface UpdateBlotterData extends Partial<CreateBlotterData> {
	id: string;
	status?: BlotterEntry["status"];
	notes?: string;
}

// Create new blotter entry
export async function createBlotterEntryAction(
	blotterData: CreateBlotterData
): Promise<{ success: boolean; entryId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!blotterData.type ||
			!blotterData.description ||
			!blotterData.reportedBy ||
			!blotterData.contactNumber ||
			!blotterData.email ||
			!blotterData.priority
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

		// Get total blotter count to generate sequential number
		const blotterRef = adminDatabase.ref("blotter");
		const snapshot = await blotterRef.get();

		let totalCount = 0;
		if (snapshot.exists()) {
			totalCount = Object.keys(snapshot.val()).length;
		}

		const sequenceNumber = String(totalCount + 1).padStart(3, "0");
		const referenceNumber = `BLT-${year}-${month}${day}-${sequenceNumber}`;

		const newBlotterRef = blotterRef.push();

		const blotterEntry: Omit<BlotterEntry, "id"> = {
			...blotterData,
			referenceNumber,
			date: new Date().toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
			status: "pending",
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};

		await newBlotterRef.set(blotterEntry);

		return {
			success: true,
			entryId: referenceNumber,
		};
	} catch (error) {
		console.error("Error creating blotter entry:", error);
		return {
			success: false,
			error:
				"Failed to create blotter entry. Please check your connection and try again.",
		};
	}
}

// Get all blotter entries
export async function getAllBlotterAction(): Promise<{
	success: boolean;
	entries?: BlotterEntry[];
	error?: string;
}> {
	try {
		const blotterRef = adminDatabase.ref("blotter");
		const snapshot = await blotterRef.get();

		if (!snapshot.exists()) {
			return { success: true, entries: [] };
		}

		const entries = snapshot.val();
		const entriesList: BlotterEntry[] = [];

		Object.entries(entries).forEach(([id, entry]: [string, any]) => {
			entriesList.push({
				id,
				referenceNumber: entry.referenceNumber || id,
				type: entry.type || entry.title || "General Report",
				description: entry.description,
				reportedBy: entry.reportedBy,
				contactNumber: entry.contactNumber,
				email: entry.email,
				status: entry.status || "pending",
				priority: entry.priority || "medium",
				location: entry.location,
				incidentDate: entry.incidentDate,
				date:
					entry.date ||
					new Date(entry.createdAt || Date.now()).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				notes: entry.notes,
				createdAt: entry.createdAt || 0,
				updatedAt: entry.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		entriesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, entries: entriesList };
	} catch (error) {
		console.error("Error fetching blotter entries:", error);
		return {
			success: false,
			error:
				"Failed to fetch blotter entries. Please check your connection and try again.",
		};
	}
}

// Get count of blotter entries by status
export async function getBlotterCountAction(): Promise<{
	success: boolean;
	counts?: {
		total: number;
		pending: number;
		investigating: number;
		resolved: number;
		closed: number;
		urgent: number;
	};
	error?: string;
}> {
	try {
		const blotterRef = adminDatabase.ref("blotter");
		const snapshot = await blotterRef.get();

		if (!snapshot.exists()) {
			return {
				success: true,
				counts: {
					total: 0,
					pending: 0,
					investigating: 0,
					resolved: 0,
					closed: 0,
					urgent: 0,
				},
			};
		}

		const entries = snapshot.val();
		const counts = {
			total: 0,
			pending: 0,
			investigating: 0,
			resolved: 0,
			closed: 0,
			urgent: 0,
		};

		Object.values(entries).forEach((entry: any) => {
			counts.total++;
			const status = entry.status || "pending";
			if (status in counts) {
				counts[status as keyof typeof counts]++;
			}
			if (entry.priority === "urgent") counts.urgent++;
		});

		return { success: true, counts };
	} catch (error) {
		console.error("Error fetching blotter counts:", error);
		return {
			success: false,
			error: "Failed to fetch blotter counts. Please try again.",
		};
	}
}

// Update blotter status
export async function updateBlotterStatusAction(
	id: string,
	status: BlotterEntry["status"],
	notes?: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Blotter ID is required.",
			};
		}

		if (!status) {
			return {
				success: false,
				error: "Status is required.",
			};
		}

		const blotterRef = adminDatabase.ref(`blotter/${id}`);

		// Check if blotter entry exists
		const snapshot = await blotterRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error:
					"Blotter entry not found. It may have been deleted by another user.",
			};
		}

		const updateData: any = {
			status,
			updatedAt: Date.now(),
		};

		if (notes) {
			updateData.notes = notes;
		}

		// Update the status
		await blotterRef.update(updateData);

		// Send email notification (best-effort)
		try {
			const current = snapshot.val();
			const emailToNotify: string | undefined = current?.email;
			if (emailToNotify) {
				const emailData: BlotterEmailData = {
					userName: current.reportedBy || emailToNotify,
					referenceNumber: current.referenceNumber || id,
					reportType: current.type || current.title || "General Report",
					dateReported:
						current.date ||
						new Date(current.createdAt || Date.now()).toLocaleDateString(
							"en-US",
							{ year: "numeric", month: "long", day: "numeric" }
						),
					location: current.location,
					description: current.description || "",
					notes: notes || current.notes,
					contactPhone: current.contactNumber,
					contactEmail: emailToNotify,
				};

				await sendBlotterStatusEmail(emailToNotify, status, emailData);
			}
		} catch (emailError) {
			console.error("Failed to send blotter status email:", emailError);
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating blotter status:", error);
		return {
			success: false,
			error:
				"Failed to update blotter status. Please check your connection and try again.",
		};
	}
}

// Update blotter entry
export async function updateBlotterEntryAction(
	blotterData: UpdateBlotterData
): Promise<{ success: boolean; error?: string }> {
	try {
		const { id, ...updateData } = blotterData;

		// Validate required fields
		if (!id) {
			return {
				success: false,
				error: "Blotter ID is required for updates.",
			};
		}

		const blotterRef = adminDatabase.ref(`blotter/${id}`);

		// Check if blotter entry exists
		const snapshot = await blotterRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error:
					"Blotter entry not found. It may have been deleted by another user.",
			};
		}

		// Update the blotter entry with new data and timestamp
		await blotterRef.update({
			...updateData,
			updatedAt: Date.now(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error updating blotter entry:", error);
		return {
			success: false,
			error:
				"Failed to update blotter entry. Please check your connection and try again.",
		};
	}
}

// Delete blotter entry
export async function deleteBlotterEntryAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!id) {
			return {
				success: false,
				error: "Blotter ID is required for deletion.",
			};
		}

		const blotterRef = adminDatabase.ref(`blotter/${id}`);

		// Check if blotter entry exists
		const snapshot = await blotterRef.get();
		if (!snapshot.exists()) {
			return {
				success: false,
				error:
					"Blotter entry not found. It may have been deleted by another user.",
			};
		}

		// Delete the blotter entry
		await blotterRef.remove();

		return { success: true };
	} catch (error) {
		console.error("Error deleting blotter entry:", error);
		return {
			success: false,
			error:
				"Failed to delete blotter entry. Please check your connection and try again.",
		};
	}
}

// Get blotter entries by status
export async function getBlotterEntriesByStatusAction(
	status: BlotterEntry["status"]
): Promise<{ success: boolean; entries?: BlotterEntry[]; error?: string }> {
	try {
		const blotterRef = adminDatabase.ref("blotter");
		const snapshot = await blotterRef
			.orderByChild("status")
			.equalTo(status)
			.get();

		if (!snapshot.exists()) {
			return { success: true, entries: [] };
		}

		const entries = snapshot.val();
		const entriesList: BlotterEntry[] = [];

		Object.entries(entries).forEach(([id, entry]: [string, any]) => {
			entriesList.push({
				id,
				referenceNumber: entry.referenceNumber || id,
				type: entry.type || entry.title || "General Report",
				description: entry.description,
				reportedBy: entry.reportedBy,
				contactNumber: entry.contactNumber,
				email: entry.email,
				status: entry.status || "pending",
				priority: entry.priority || "medium",
				location: entry.location,
				incidentDate: entry.incidentDate,
				date:
					entry.date ||
					new Date(entry.createdAt || Date.now()).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				notes: entry.notes,
				createdAt: entry.createdAt || 0,
				updatedAt: entry.updatedAt || 0,
			});
		});

		// Sort by creation date (newest first)
		entriesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, entries: entriesList };
	} catch (error) {
		console.error("Error fetching blotter entries by status:", error);
		return {
			success: false,
			error: "Failed to fetch blotter entries by status. Please try again.",
		};
	}
}

// Search blotter entries
export async function searchBlotterEntriesAction(
	query: string
): Promise<{ success: boolean; entries?: BlotterEntry[]; error?: string }> {
	try {
		if (!query || query.trim().length === 0) {
			return getAllBlotterAction();
		}

		const blotterRef = adminDatabase.ref("blotter");
		const snapshot = await blotterRef.get();

		if (!snapshot.exists()) {
			return { success: true, entries: [] };
		}

		const entries = snapshot.val();
		const entriesList: BlotterEntry[] = [];
		const searchQuery = query.toLowerCase().trim();

		Object.entries(entries).forEach(([id, entry]: [string, any]) => {
			const matchesSearch =
				entry.type?.toLowerCase().includes(searchQuery) ||
				entry.description?.toLowerCase().includes(searchQuery) ||
				entry.reportedBy?.toLowerCase().includes(searchQuery) ||
				entry.location?.toLowerCase().includes(searchQuery) ||
				entry.referenceNumber?.toLowerCase().includes(searchQuery) ||
				id.toLowerCase().includes(searchQuery);

			if (matchesSearch) {
				entriesList.push({
					id,
					referenceNumber: entry.referenceNumber || id,
					type: entry.type || entry.title || "General Report",
					description: entry.description,
					reportedBy: entry.reportedBy,
					contactNumber: entry.contactNumber,
					email: entry.email,
					status: entry.status || "pending",
					priority: entry.priority || "medium",
					location: entry.location,
					incidentDate: entry.incidentDate,
					date:
						entry.date ||
						new Date(entry.createdAt || Date.now()).toLocaleDateString(
							"en-US",
							{
								year: "numeric",
								month: "long",
								day: "numeric",
							}
						),
					notes: entry.notes,
					createdAt: entry.createdAt || 0,
					updatedAt: entry.updatedAt || 0,
				});
			}
		});

		// Sort by creation date (newest first)
		entriesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

		return { success: true, entries: entriesList };
	} catch (error) {
		console.error("Error searching blotter entries:", error);
		return {
			success: false,
			error: "Failed to search blotter entries. Please try again.",
		};
	}
}
