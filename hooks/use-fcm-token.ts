"use client";

import { useState, useEffect } from 'react';
import { 
	getFCMTokenFromLocalStorage, 
	isFCMTokenValid,
	storeFCMTokenInLocalStorage,
	removeFCMTokenFromLocalStorage,
	ensureServiceWorkerRegistered
} from '@/app/firebase/firebase';

export function useFCMToken() {
	const [token, setToken] = useState<string | null>(null);
	const [uid, setUid] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [isValid, setIsValid] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Get token from localStorage on mount
		const { token: storedToken, uid: storedUid, role: storedRole } = getFCMTokenFromLocalStorage();
		const tokenValid = isFCMTokenValid();
		
		setToken(storedToken);
		setUid(storedUid);
		setRole(storedRole);
		setIsValid(tokenValid);
	}, []);

	// Initialize service worker on mount
	useEffect(() => {
		const initServiceWorker = async () => {
			try {
				await ensureServiceWorkerRegistered();
			} catch (error) {
				console.error("Failed to initialize service worker:", error);
				setError("Failed to initialize notifications");
			}
		};

		initServiceWorker();
	}, []);

	const updateToken = (newToken: string, newUid: string, newRole: string) => {
		storeFCMTokenInLocalStorage(newToken, newUid, newRole);
		setToken(newToken);
		setUid(newUid);
		setRole(newRole);
		setIsValid(true);
		setError(null);
	};

	const clearToken = () => {
		removeFCMTokenFromLocalStorage();
		setToken(null);
		setUid(null);
		setRole(null);
		setIsValid(false);
		setError(null);
	};

	const setLoading = (loading: boolean) => {
		setIsLoading(loading);
	};

	const setErrorState = (errorMessage: string | null) => {
		setError(errorMessage);
	};

	return {
		token,
		uid,
		role,
		isValid,
		isLoading,
		error,
		updateToken,
		clearToken,
		setLoading,
		setError: setErrorState,
		hasToken: !!token && isValid
	};
}
