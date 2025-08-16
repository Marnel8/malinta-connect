import { useState, useEffect, useCallback } from "react";
import {
	setData,
	getData,
	pushData,
	updateData,
	deleteData,
	listenToData,
	queryData,
	listenToQuery,
} from "@/lib/firebase-db";

// Hook for real-time data listening
export const useRealtimeData = <T = any>(
	path: string,
	initialValue: T | null = null
) => {
	const [data, setDataState] = useState<T | null>(initialValue);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);

		// Set up real-time listener
		const unsubscribe = listenToData(
			path,
			(newData) => {
				setDataState(newData);
				setLoading(false);
			},
			(error) => {
				setError(error);
				setLoading(false);
			}
		);

		// Cleanup listener on unmount
		return unsubscribe;
	}, [path]);

	return { data, loading, error };
};

// Hook for real-time query listening
export const useRealtimeQuery = <T = any>(
	path: string,
	queryOptions: {
		orderBy?: string;
		equalTo?: any;
		limit?: number;
		startAt?: any;
		endAt?: any;
	} = {},
	initialValue: T | null = null
) => {
	const [data, setDataState] = useState<T | null>(initialValue);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);

		// Set up real-time query listener
		const unsubscribe = listenToQuery(
			path,
			(newData) => {
				setDataState(newData);
				setLoading(false);
			},
			queryOptions,
			(error) => {
				setError(error);
				setLoading(false);
			}
		);

		// Cleanup listener on unmount
		return unsubscribe;
	}, [path, JSON.stringify(queryOptions)]);

	return { data, loading, error };
};

// Hook for database operations
export const useDatabaseOperations = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const createData = useCallback(async (path: string, data: any) => {
		setLoading(true);
		setError(null);

		try {
			const result = await setData(path, data);
			if (!result.success) {
				throw new Error("Failed to create data");
			}
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const readData = useCallback(async (path: string) => {
		setLoading(true);
		setError(null);

		try {
			const result = await getData(path);
			if (!result.success) {
				throw new Error("Failed to read data");
			}
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const addToList = useCallback(async (path: string, data: any) => {
		setLoading(true);
		setError(null);

		try {
			const result = await pushData(path, data);
			if (!result.success) {
				throw new Error("Failed to add data to list");
			}
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateDataFields = useCallback(async (path: string, updates: any) => {
		setLoading(true);
		setError(null);

		try {
			const result = await updateData(path, updates);
			if (!result.success) {
				throw new Error("Failed to update data");
			}
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const removeData = useCallback(async (path: string) => {
		setLoading(true);
		setError(null);

		try {
			const result = await deleteData(path);
			if (!result.success) {
				throw new Error("Failed to delete data");
			}
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error("Unknown error");
			setError(error);
			throw error;
		} finally {
			setLoading(false);
		}
	}, []);

	const executeQuery = useCallback(
		async (
			path: string,
			queryOptions: {
				orderBy?: string;
				equalTo?: any;
				limit?: number;
				startAt?: any;
				endAt?: any;
			} = {}
		) => {
			setLoading(true);
			setError(null);

			try {
				const result = await queryData(path, queryOptions);
				if (!result.success) {
					throw new Error("Failed to execute query");
				}
				return result;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Unknown error");
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		loading,
		error,
		createData,
		readData,
		addToList,
		updateDataFields,
		removeData,
		executeQuery,
		clearError,
	};
};
