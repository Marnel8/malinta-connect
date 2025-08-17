"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface BlotterEntry {
	id: string;
	title: string;
	description: string;
	reportedBy: string;
	contactNumber: string;
	email: string;
	status: "pending" | "investigating" | "resolved" | "closed";
	priority: "low" | "medium" | "high" | "urgent";
	location?: string;
	incidentDate?: string;
	notes?: string;
	createdAt: number;
	updatedAt: number;
}

export interface CreateBlotterData {
	title: string;
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
}

// Create new blotter entry
export async function createBlotterEntryAction(
	blotterData: CreateBlotterData
): Promise<{ success: boolean; entryId?: string; error?: string }> {
	try {
		// Validate required fields
		if (
			!blotterData.title ||
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
			id: referenceNumber, // Set the meaningful reference number
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
				...entry,
				status: entry.status || "pending",
				priority: entry.priority || "medium",
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
