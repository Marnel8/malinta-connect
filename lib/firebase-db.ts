import {
	ref,
	set,
	get,
	push,
	update,
	remove,
	onValue,
	off,
	query,
	orderByChild,
	equalTo,
	limitToFirst,
	limitToLast,
	startAt,
	endAt,
} from "firebase/database";
import { database } from "@/app/firebase/firebase";

// Types for common operations
export interface DatabaseReference {
	path: string;
}

// Create or update data at a specific path
export const setData = async (path: string, data: any) => {
	try {
		const dbRef = ref(database, path);
		await set(dbRef, data);
		return { success: true };
	} catch (error) {
		console.error("Error setting data:", error);
		return { success: false, error };
	}
};

// Get data from a specific path
export const getData = async (path: string) => {
	try {
		const dbRef = ref(database, path);
		const snapshot = await get(dbRef);
		if (snapshot.exists()) {
			return { success: true, data: snapshot.val() };
		} else {
			return { success: true, data: null };
		}
	} catch (error) {
		console.error("Error getting data:", error);
		return { success: false, error };
	}
};

// Push new data to a list (auto-generates key)
export const pushData = async (path: string, data: any) => {
	try {
		const dbRef = ref(database, path);
		const newRef = push(dbRef);
		await set(newRef, data);
		return { success: true, key: newRef.key };
	} catch (error) {
		console.error("Error pushing data:", error);
		return { success: false, error };
	}
};

// Update specific fields without overwriting entire object
export const updateData = async (path: string, updates: any) => {
	try {
		const dbRef = ref(database, path);
		await update(dbRef, updates);
		return { success: true };
	} catch (error) {
		console.error("Error updating data:", error);
		return { success: false, error };
	}
};

// Delete data at a specific path
export const deleteData = async (path: string) => {
	try {
		const dbRef = ref(database, path);
		await remove(dbRef);
		return { success: true };
	} catch (error) {
		console.error("Error deleting data:", error);
		return { success: false, error };
	}
};

// Set up real-time listener for data changes
export const listenToData = (
	path: string,
	callback: (data: any) => void,
	errorCallback?: (error: any) => void
) => {
	const dbRef = ref(database, path);

	const unsubscribe = onValue(
		dbRef,
		(snapshot) => {
			if (snapshot.exists()) {
				callback(snapshot.val());
			} else {
				callback(null);
			}
		},
		(error) => {
			console.error("Error listening to data:", error);
			if (errorCallback) errorCallback(error);
		}
	);

	// Return unsubscribe function
	return () => off(dbRef, "value", unsubscribe);
};

// Query data with filters
export const queryData = async (
	path: string,
	options: {
		orderBy?: string;
		equalTo?: any;
		limit?: number;
		startAt?: any;
		endAt?: any;
	} = {}
) => {
	try {
		let dbRef = ref(database, path);
		let dbQuery = dbRef;

		// Apply ordering
		if (options.orderBy) {
			dbQuery = query(dbQuery, orderByChild(options.orderBy));
		}

		// Apply equality filter
		if (options.equalTo !== undefined) {
			dbQuery = query(dbQuery, equalTo(options.equalTo));
		}

		// Apply limit
		if (options.limit) {
			dbQuery = query(dbQuery, limitToFirst(options.limit));
		}

		// Apply range filters
		if (options.startAt !== undefined) {
			dbQuery = query(dbQuery, startAt(options.startAt));
		}

		if (options.endAt !== undefined) {
			dbQuery = query(dbQuery, endAt(options.endAt));
		}

		const snapshot = await get(dbQuery);
		if (snapshot.exists()) {
			return { success: true, data: snapshot.val() };
		} else {
			return { success: true, data: null };
		}
	} catch (error) {
		console.error("Error querying data:", error);
		return { success: false, error };
	}
};

// Listen to query results in real-time
export const listenToQuery = (
	path: string,
	callback: (data: any) => void,
	options: {
		orderBy?: string;
		equalTo?: any;
		limit?: number;
		startAt?: any;
		endAt?: any;
	} = {},
	errorCallback?: (error: any) => void
) => {
	let dbRef = ref(database, path);
	let dbQuery = dbRef;

	// Apply ordering
	if (options.orderBy) {
		dbQuery = query(dbQuery, orderByChild(options.orderBy));
	}

	// Apply equality filter
	if (options.equalTo !== undefined) {
		dbQuery = query(dbQuery, equalTo(options.equalTo));
	}

	// Apply limit
	if (options.limit) {
		dbQuery = query(dbQuery, limitToFirst(options.limit));
	}

	// Apply range filters
	if (options.startAt !== undefined) {
		dbQuery = query(dbQuery, startAt(options.startAt));
	}

	if (options.endAt !== undefined) {
		dbQuery = query(dbQuery, endAt(options.endAt));
	}

	const unsubscribe = onValue(
		dbQuery,
		(snapshot) => {
			if (snapshot.exists()) {
				callback(snapshot.val());
			} else {
				callback(null);
			}
		},
		(error) => {
			console.error("Error listening to query:", error);
			if (errorCallback) errorCallback(error);
		}
	);

	// Return unsubscribe function
	return () => off(dbQuery, "value", unsubscribe);
};
