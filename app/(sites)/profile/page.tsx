"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Shield,
	Edit,
	Save,
	X,
	Camera,
	Loader2,
} from "lucide-react";
import {
	updateUserProfileAction,
	updateUserAvatarWithUploadAction,
} from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
	const { user, userProfile, refreshUserProfile } = useAuth();
	const { t } = useLanguage();
	const { toast } = useToast();
	const router = useRouter();

	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		middleName: "",
		lastName: "",
		suffix: "",
		phoneNumber: "",
		address: "",
	});

	useEffect(() => {
		if (userProfile) {
			setFormData({
				firstName: userProfile.firstName || "",
				middleName: userProfile.middleName || "",
				lastName: userProfile.lastName || "",
				suffix: userProfile.suffix || "",
				phoneNumber: userProfile.phoneNumber || "",
				address: userProfile.address || "",
			});
		}
	}, [userProfile]);

	useEffect(() => {
		if (!user) {
			router.push("/login");
		}
	}, [user, router]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		if (!user?.uid) return;

		setIsLoading(true);
		try {
			const result = await updateUserProfileAction(user.uid, formData);

			if (result.success) {
				toast({
					title: "Profile Updated",
					description: "Your profile has been updated successfully.",
					variant: "default",
				});
				setIsEditing(false);
				await refreshUserProfile();
			} else {
				toast({
					title: "Update Failed",
					description:
						result.error || "Failed to update profile. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Profile update error:", error);
			toast({
				title: "Update Failed",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		if (userProfile) {
			setFormData({
				firstName: userProfile.firstName || "",
				middleName: userProfile.middleName || "",
				lastName: userProfile.lastName || "",
				suffix: userProfile.suffix || "",
				phoneNumber: userProfile.phoneNumber || "",
				address: userProfile.address || "",
			});
		}
		setIsEditing(false);
	};

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file || !user?.uid) return;

		setIsUploading(true);
		try {
			// Convert file to data URL
			const reader = new FileReader();
			reader.onload = async (e) => {
				const dataUrl = e.target?.result as string;

				const result = await updateUserAvatarWithUploadAction(
					user.uid,
					dataUrl
				);

				if (result.success) {
					toast({
						title: "Avatar Updated",
						description: "Your profile picture has been updated successfully.",
						variant: "default",
					});
					await refreshUserProfile();
				} else {
					toast({
						title: "Upload Failed",
						description:
							result.error || "Failed to upload avatar. Please try again.",
						variant: "destructive",
					});
				}
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Avatar upload error:", error);
			toast({
				title: "Upload Failed",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
		}
	};

	const getInitials = (firstName?: string, lastName?: string) => {
		if (firstName && lastName) {
			return `${firstName.charAt(0)}${lastName.charAt(0)}`;
		}
		if (user?.email) {
			return user.email.charAt(0).toUpperCase();
		}
		return "U";
	};

	const getAvatarUrl = () => {
		if (userProfile?.avatarUrl) {
			return userProfile.avatarUrl;
		}
		return "/placeholder-user.jpg";
	};

	if (!user || !userProfile) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="space-y-6">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold tracking-tight">
						{t("profile.title") || "Profile"}
					</h1>
					<p className="text-muted-foreground">
						{t("profile.description") ||
							"Manage your account information and preferences"}
					</p>
				</div>

				{/* Profile Card */}
				<Card>
					<CardHeader className="text-center">
						<div className="relative mx-auto mb-4">
							<Avatar className="h-24 w-24">
								<AvatarImage
									src={getAvatarUrl()}
									alt={`${userProfile.firstName || "User"} ${
										userProfile.lastName || ""
									}`}
								/>
								<AvatarFallback className="text-2xl">
									{getInitials(userProfile.firstName, userProfile.lastName)}
								</AvatarFallback>
							</Avatar>

							{/* Avatar Upload Button */}
							<label
								htmlFor="avatar-upload"
								className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
							>
								<Camera className="h-4 w-4" />
								<input
									id="avatar-upload"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleAvatarUpload}
									disabled={isUploading}
								/>
							</label>

							{isUploading && (
								<div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
									<Loader2 className="h-6 w-6 animate-spin" />
								</div>
							)}
						</div>

						<CardTitle className="text-xl">
							{userProfile.firstName && userProfile.lastName
								? `${userProfile.firstName} ${userProfile.lastName}`
								: user.email}
						</CardTitle>
						<CardDescription>
							<Badge variant="secondary" className="mt-2">
								{userProfile.role?.charAt(0).toUpperCase() +
									userProfile.role?.slice(1) || "User"}
							</Badge>
						</CardDescription>
					</CardHeader>
				</Card>

				{/* Profile Information */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="flex items-center gap-2">
									<User className="h-5 w-5" />
									{t("profile.personalInfo") || "Personal Information"}
								</CardTitle>
								<CardDescription>
									{t("profile.personalInfoDesc") ||
										"Your basic profile information"}
								</CardDescription>
							</div>

							{!isEditing ? (
								<Button
									onClick={() => setIsEditing(true)}
									variant="outline"
									size="sm"
								>
									<Edit className="h-4 w-4 mr-2" />
									{t("profile.edit") || "Edit"}
								</Button>
							) : (
								<div className="flex gap-2">
									<Button onClick={handleSave} disabled={isLoading} size="sm">
										{isLoading ? (
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										) : (
											<Save className="h-4 w-4 mr-2" />
										)}
										{t("profile.save") || "Save"}
									</Button>
									<Button onClick={handleCancel} variant="outline" size="sm">
										<X className="h-4 w-4 mr-2" />
										{t("profile.cancel") || "Cancel"}
									</Button>
								</div>
							)}
						</div>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">
									{t("profile.firstName") || "First Name"}
								</Label>
								{isEditing ? (
									<Input
										id="firstName"
										value={formData.firstName}
										onChange={(e) =>
											handleInputChange("firstName", e.target.value)
										}
										placeholder={
											t("profile.firstNamePlaceholder") || "Enter first name"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										{userProfile.firstName ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="middleName">
									{t("profile.middleName") || "Middle Name"}
								</Label>
								{isEditing ? (
									<Input
										id="middleName"
										value={formData.middleName}
										onChange={(e) =>
											handleInputChange("middleName", e.target.value)
										}
										placeholder={
											t("profile.middleNamePlaceholder") || "Enter middle name"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										{userProfile.middleName ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="lastName">
									{t("profile.lastName") || "Last Name"}
								</Label>
								{isEditing ? (
									<Input
										id="lastName"
										value={formData.lastName}
										onChange={(e) =>
											handleInputChange("lastName", e.target.value)
										}
										placeholder={
											t("profile.lastNamePlaceholder") || "Enter last name"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										{userProfile.lastName ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="suffix">
									{t("profile.suffix") || "Suffix"}
								</Label>
								{isEditing ? (
									<Input
										id="suffix"
										value={formData.suffix}
										onChange={(e) =>
											handleInputChange("suffix", e.target.value)
										}
										placeholder={
											t("profile.suffixPlaceholder") || "e.g., Jr., Sr., III"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground">
										{userProfile.suffix ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>
						</div>

						<Separator />

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="phoneNumber">
									{t("profile.phoneNumber") || "Phone Number"}
								</Label>
								{isEditing ? (
									<Input
										id="phoneNumber"
										value={formData.phoneNumber}
										onChange={(e) =>
											handleInputChange("phoneNumber", e.target.value)
										}
										placeholder={
											t("profile.phoneNumberPlaceholder") ||
											"Enter phone number"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground flex items-center gap-2">
										<Phone className="h-4 w-4" />
										{userProfile.phoneNumber ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="address">
									{t("profile.address") || "Address"}
								</Label>
								{isEditing ? (
									<Input
										id="address"
										value={formData.address}
										onChange={(e) =>
											handleInputChange("address", e.target.value)
										}
										placeholder={
											t("profile.addressPlaceholder") || "Enter address"
										}
									/>
								) : (
									<p className="text-sm text-muted-foreground flex items-center gap-2">
										<MapPin className="h-4 w-4" />
										{userProfile.address ||
											t("profile.notProvided") ||
											"Not provided"}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Account Information */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="h-5 w-5" />
							{t("profile.accountInfo") || "Account Information"}
						</CardTitle>
						<CardDescription>
							{t("profile.accountInfoDesc") ||
								"Your account details and verification status"}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>{t("profile.email") || "Email"}</Label>
								<p className="text-sm text-muted-foreground flex items-center gap-2">
									<Mail className="h-4 w-4" />
									{user.email}
								</p>
							</div>

							<div className="space-y-2">
								<Label>{t("profile.role") || "Role"}</Label>
								<div className="text-sm text-muted-foreground">
									<Badge variant="outline">
										{userProfile.role?.charAt(0).toUpperCase() +
											userProfile.role?.slice(1) || "User"}
									</Badge>
								</div>
							</div>

							<div className="space-y-2">
								<Label>
									{t("profile.verificationStatus") || "Verification Status"}
								</Label>
								<div className="text-sm text-muted-foreground">
									<Badge
										variant={
											userProfile.verificationStatus === "verified"
												? "default"
												: userProfile.verificationStatus === "pending"
												? "secondary"
												: userProfile.verificationStatus === "rejected"
												? "destructive"
												: "outline"
										}
									>
										{userProfile.verificationStatus === "verified"
											? "Verified"
											: userProfile.verificationStatus === "pending"
											? "Pending"
											: userProfile.verificationStatus === "rejected"
											? "Rejected"
											: "Unknown"}
									</Badge>
								</div>
							</div>

							<div className="space-y-2">
								<Label>{t("profile.memberSince") || "Member Since"}</Label>
								<p className="text-sm text-muted-foreground flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{userProfile.createdAt
										? new Date(userProfile.createdAt).toLocaleDateString()
										: "Unknown"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
