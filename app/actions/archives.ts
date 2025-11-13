"use server";

import {
	type ArchiveEntry,
	deleteArchivedRecord,
	getArchivedRecords,
	restoreArchivedRecord,
} from "@/lib/archive-manager";

export async function getArchivedItemsAction(
	entity?: string
): Promise<{ success: boolean; archives?: ArchiveEntry[]; error?: string }> {
	try {
		const archives = await getArchivedRecords(entity);
		return { success: true, archives };
	} catch (error) {
		console.error("Error fetching archived items:", error);
		return {
			success: false,
			error: "Failed to fetch archived items. Please try again.",
		};
	}
}

export async function restoreArchivedItemAction(
	entity: string,
	id: string
): Promise<{ success: boolean; restored?: ArchiveEntry; error?: string }> {
	try {
		if (!entity || !id) {
			return { success: false, error: "Entity and id are required." };
		}

		const restored = await restoreArchivedRecord(entity, id);

		if (["residents", "staff", "users"].includes(restored.entity)) {
			try {
				const { getAuth } = await import("firebase-admin/auth");
				const auth = getAuth();
				await auth.updateUser(restored.id, { disabled: false });
			} catch (authError: any) {
				if (authError.code !== "auth/user-not-found") {
					console.error(
						"Failed to re-enable auth user during restore:",
						authError
					);
				}
			}
		}

		return { success: true, restored };
	} catch (error) {
		console.error("Error restoring archived item:", error);
		return {
			success: false,
			error: "Failed to restore the archived item. Please try again.",
		};
	}
}

export async function deleteArchivedItemAction(
	entity: string,
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		if (!entity || !id) {
			return { success: false, error: "Entity and id are required." };
		}

		const entry = await deleteArchivedRecord(entity, id);

		if (["residents", "staff", "users"].includes(entry.entity)) {
			try {
				const { getAuth } = await import("firebase-admin/auth");
				const auth = getAuth();
				await auth.deleteUser(entry.id);
			} catch (authError: any) {
				if (authError.code !== "auth/user-not-found") {
					console.error("Failed to permanently delete auth user:", authError);
				}
			}
		}

		const preview = entry.preview as Record<string, unknown> | undefined;
		const photoPublicId =
			preview && typeof preview["photoPublicId"] === "string"
				? (preview["photoPublicId"] as string)
				: undefined;

		if (photoPublicId) {
			try {
				const { deleteFromCloudinary } = await import(
					"@/cloudinary/cloudinary"
				);
				await deleteFromCloudinary(photoPublicId);
			} catch (cloudinaryError) {
				console.error("Failed to delete Cloudinary asset:", cloudinaryError);
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error deleting archived item:", error);
		return {
			success: false,
			error: "Failed to delete the archived item. Please try again.",
		};
	}
}

