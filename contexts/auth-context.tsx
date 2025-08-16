"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/firebase/firebase";

interface UserProfile {
	uid: string;
	email: string;
	role: "resident" | "official" | "admin";
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	address?: string;
	position?: string;
	createdAt: number;
	updatedAt: number;
	permissions?: {
		canManageUsers: boolean;
		canManageEvents: boolean;
		canManageCertificates: boolean;
		canManageAppointments: boolean;
		canViewAnalytics: boolean;
		canManageSettings: boolean;
	};
}

interface AuthContextType {
	user: User | null;
	userProfile: UserProfile | null;
	loading: boolean;
	logout: () => Promise<void>;
	updateUserProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user);

			if (user) {
				// Try to get user profile from localStorage first
				const storedProfile = localStorage.getItem(`userProfile_${user.uid}`);
				if (storedProfile) {
					try {
						const profile = JSON.parse(storedProfile) as UserProfile;
						setUserProfile(profile);
					} catch (error) {
						console.error("Error parsing stored profile:", error);
						// If parsing fails, create a basic profile
						const basicProfile: UserProfile = {
							uid: user.uid,
							email: user.email || "",
							role: "resident",
							createdAt: Date.now(),
							updatedAt: Date.now(),
						};
						setUserProfile(basicProfile);
					}
				} else {
					// No stored profile, try to get role from localStorage
					const storedRole = localStorage.getItem(`userRole_${user.uid}`);
					if (storedRole) {
						// Create a basic profile with stored role
						const basicProfile: UserProfile = {
							uid: user.uid,
							email: user.email || "",
							role: storedRole as "resident" | "official" | "admin",
							createdAt: Date.now(),
							updatedAt: Date.now(),
						};
						setUserProfile(basicProfile);
						localStorage.setItem(
							`userProfile_${user.uid}`,
							JSON.stringify(basicProfile)
						);
					} else {
						// No stored data, create default resident profile
						const defaultProfile: UserProfile = {
							uid: user.uid,
							email: user.email || "",
							role: "resident",
							createdAt: Date.now(),
							updatedAt: Date.now(),
						};
						setUserProfile(defaultProfile);
					}
				}
			} else {
				setUserProfile(null);
			}

			setLoading(false);
		});

		return () => unsubscribe();
	}, []); // Remove userProfile from dependencies to prevent infinite loop

	const logout = async () => {
		try {
			if (user) {
				// Clear stored profile and role
				localStorage.removeItem(`userProfile_${user.uid}`);
				localStorage.removeItem(`userRole_${user.uid}`);
			}
			await signOut(auth);
			setUserProfile(null);
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const updateUserProfile = (profile: UserProfile) => {
		setUserProfile(profile);
		if (profile.uid) {
			localStorage.setItem(
				`userProfile_${profile.uid}`,
				JSON.stringify(profile)
			);
			localStorage.setItem(`userRole_${profile.uid}`, profile.role);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				userProfile,
				loading,
				logout,
				updateUserProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
