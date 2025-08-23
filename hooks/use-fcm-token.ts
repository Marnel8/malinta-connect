"use client";

import { useState, useEffect } from 'react';
import { 
	getFCMTokenFromLocalStorage, 
	isFCMTokenValid,
	storeFCMTokenInLocalStorage,
	removeFCMTokenFromLocalStorage
} from '@/app/firebase/firebase';

export function useFCMToken() {
	const [token, setToken] = useState<string | null>(null);
	const [uid, setUid] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);
	const [isValid, setIsValid] = useState(false);

	useEffect(() => {
		// Get token from localStorage on mount
		const { token: storedToken, uid: storedUid, role: storedRole } = getFCMTokenFromLocalStorage();
		const tokenValid = isFCMTokenValid();
		
		setToken(storedToken);
		setUid(storedUid);
		setRole(storedRole);
		setIsValid(tokenValid);
	}, []);

	const updateToken = (newToken: string, newUid: string, newRole: string) => {
		storeFCMTokenInLocalStorage(newToken, newUid, newRole);
		setToken(newToken);
		setUid(newUid);
		setRole(newRole);
		setIsValid(true);
	};

	const clearToken = () => {
		removeFCMTokenFromLocalStorage();
		setToken(null);
		setUid(null);
		setRole(null);
		setIsValid(false);
	};

	return {
		token,
		uid,
		role,
		isValid,
		updateToken,
		clearToken,
		hasToken: !!token && isValid
	};
}
