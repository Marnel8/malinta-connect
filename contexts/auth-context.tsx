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
import { getCurrentUserProfileAction, UserProfile } from "@/app/actions/auth";
import { removeFCMTokenFromLocalStorage } from "@/app/firebase/firebase";

interface AuthContextType {
	user: User | null;
	userProfile: UserProfile | null;
	loading: boolean;
	logout: () => Promise<void>;
	updateUserProfile: (profile: UserProfile) => void;
	refreshUserProfile: () => Promise<void>;
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
				try {
					// Fetch user profile from server action
					const result = await getCurrentUserProfileAction(user.uid);
					if (result.success && result.user) {
						setUserProfile(result.user);
					} else {
						console.error("Failed to fetch user profile:", result.error);
						// Set a basic profile as fallback
						const basicProfile: UserProfile = {
							uid: user.uid,
							email: user.email || "",
							role: "resident",
							createdAt: Date.now(),
							updatedAt: Date.now(),
						};
						setUserProfile(basicProfile);
					}
				} catch (error) {
					console.error("Error fetching user profile:", error);
					// Set a basic profile as fallback
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
				setUserProfile(null);
			}

			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const logout = async () => {
		try {
			// Clean up FCM token before logout
			if (user?.uid) {
				try {
					// Remove from localStorage
					removeFCMTokenFromLocalStorage();
					
					// Remove from server
					const { removeFCMTokenAction } = await import(
						"@/app/actions/notifications"
					);
					await removeFCMTokenAction(user.uid);
				} catch (error) {
					console.error("Error removing FCM token:", error);
					// Don't block logout if FCM cleanup fails
				}
			}

			await signOut(auth);
			setUserProfile(null);
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const updateUserProfile = (profile: UserProfile) => {
		setUserProfile(profile);
	};

	const refreshUserProfile = async () => {
		if (!user) return;

		try {
			const result = await getCurrentUserProfileAction(user.uid);
			if (result.success && result.user) {
				setUserProfile(result.user);
			}
		} catch (error) {
			console.error("Error refreshing user profile:", error);
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
				refreshUserProfile,
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
