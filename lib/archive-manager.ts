"use server";

import { adminDatabase } from "@/app/firebase/admin";

export interface ArchivePath {
	path: string;
	value: unknown;
}

export interface ArchiveEntry {
	entity: string;
	id: string;
	archivedAt: number;
	archivedBy?: string | null;
	paths: ArchivePath[];
	preview?: Record<string, unknown>;
}

interface ArchiveRecordInput {
	entity: string;
	id: string;
	paths: Record<string, unknown>;
	preview?: Record<string, unknown>;
	archivedBy?: string | null;
}

export async function archiveRecord({
	entity,
	id,
	paths,
	preview,
	archivedBy = null,
}: ArchiveRecordInput): Promise<ArchiveEntry> {
	if (!entity || !id) {
		throw new Error("Entity and id are required to archive a record.");
	}

	if (!paths || Object.keys(paths).length === 0) {
		throw new Error("At least one path is required to archive a record.");
	}

	const pathsArray: ArchivePath[] = Object.entries(paths).map(([path, value]) => ({
		path,
		value,
	}));

	let sanitizedPreview: Record<string, unknown> | undefined;
	if (preview && Object.keys(preview).length > 0) {
		const filteredEntries = Object.entries(preview).filter(
			([, value]) => value !== undefined
		);
		if (filteredEntries.length > 0) {
			sanitizedPreview = Object.fromEntries(filteredEntries);
		}
	}

	const archiveEntry: ArchiveEntry = {
		entity,
		id,
		archivedAt: Date.now(),
		archivedBy,
		paths: pathsArray,
		preview: sanitizedPreview,
	};

	const updates: Record<string, unknown | null> = {};
	for (const path of Object.keys(paths)) {
		updates[path] = null;
	}
	updates[`archives/${entity}/${id}`] = archiveEntry;

	await adminDatabase.ref().update(updates);

	return archiveEntry;
}

export async function restoreArchivedRecord(
	entity: string,
	id: string
): Promise<ArchiveEntry> {
	if (!entity || !id) {
		throw new Error("Entity and id are required to restore a record.");
	}

	const archiveRef = adminDatabase.ref(`archives/${entity}/${id}`);
	const snapshot = await archiveRef.get();

	if (!snapshot.exists()) {
		throw new Error("Archived record not found.");
	}

	const entry = snapshot.val() as any;
	const normalizedPaths = normalizePaths(entry.paths || []);

	const updates: Record<string, unknown | null> = {};
	for (const { path, value } of normalizedPaths) {
		updates[path] = value;
	}
	updates[`archives/${entity}/${id}`] = null;

	await adminDatabase.ref().update(updates);

	return {
		...entry,
		paths: normalizedPaths,
	} as ArchiveEntry;
}

export async function deleteArchivedRecord(
	entity: string,
	id: string
): Promise<ArchiveEntry> {
	if (!entity || !id) {
		throw new Error("Entity and id are required to delete an archived record.");
	}

	const archiveRef = adminDatabase.ref(`archives/${entity}/${id}`);
	const snapshot = await archiveRef.get();

	if (!snapshot.exists()) {
		throw new Error("Archived record not found.");
	}

	const entry = snapshot.val() as ArchiveEntry;

	await archiveRef.remove();

	return entry;
}

function normalizePaths(paths: ArchivePath[] | Record<string, unknown>): ArchivePath[] {
	if (Array.isArray(paths)) {
		return paths;
	}
	// Backward compatibility: convert object to array
	return Object.entries(paths).map(([path, value]) => ({
		path,
		value,
	}));
}

export async function getArchivedRecords(
	entity?: string
): Promise<ArchiveEntry[]> {
	const archivesRef = entity
		? adminDatabase.ref(`archives/${entity}`)
		: adminDatabase.ref("archives");
	const snapshot = await archivesRef.get();

	if (!snapshot.exists()) {
		return [];
	}

	if (entity) {
		const archives = snapshot.val() as Record<string, any>;
		return Object.entries(archives).map(([id, entry]) => ({
			...entry,
			id,
			entity,
			paths: normalizePaths(entry.paths || []),
		}));
	}

	const archives = snapshot.val() as Record<string, Record<string, any>>;
	const entries: ArchiveEntry[] = [];

	Object.entries(archives).forEach(([entityKey, entityEntries]) => {
		Object.entries(entityEntries).forEach(([id, entry]) => {
			entries.push({
				...entry,
				id,
				entity: entityKey,
				paths: normalizePaths(entry.paths || []),
			});
		});
	});

	entries.sort((a, b) => b.archivedAt - a.archivedAt);

	return entries;
}

