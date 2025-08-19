"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileText,
	Clock,
	CheckCircle,
	AlertCircle,
	Loader2,
	UploadCloud,
	X,
} from "lucide-react";

import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
	getAllCertificatesAction,
	createCertificateAction,
	type Certificate,
} from "@/app/actions/certificates";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { uploadGoodMoralPhotoAction } from "@/app/actions/uploads";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const certificateTypes = [
	"Barangay Clearance",
	"Certificate of Residency",
	"Certificate of Indigency",
	"Certificate of Good Moral Character",
	"Certificate of Employment",
	"Certificate of No Pending Case",
	"Certificate of Live Birth",
	"Certificate of Death",
	"Business Closure",
	"For Bail",
	"Good Moral (With 1X1 Picture)",
	"Income",
	"Non-residence",
	"No Income",
	"Other",
];

// Card definitions for Available Certificates section
const certificateCards: {
	type: string;
	title: string;
	description: string;
	processing: string;
	bullets: string[];
}[] = [
	{
		type: "Barangay Clearance",
		title: "Barangay Clearance",
		description: "General purpose clearance for various transactions.",
		processing: "1-2 business days",
		bullets: ["Job applications", "Business permits", "School requirements"],
	},
	{
		type: "Certificate of Residency",
		title: "Certificate of Residency",
		description: "Proof that you are a resident of the barangay.",
		processing: "1 business day",
		bullets: [
			"Scholarship applications",
			"Voter's registration",
			"Government IDs",
		],
	},
	{
		type: "Certificate of Indigency",
		title: "Indigency Certificate",
		description: "Certifies that you are from a low-income household.",
		processing: "2-3 business days",
		bullets: ["Medical assistance", "Educational assistance", "Fee waivers"],
	},
	{
		type: "Certificate of Good Moral Character",
		title: "Good Moral Character",
		description:
			"Certifies good moral character and no adverse records in the barangay.",
		processing: "1-2 business days",
		bullets: ["Board examinations", "Work/School application", "Clearances"],
	},
	{
		type: "Certificate of Employment",
		title: "Certificate of Employment",
		description:
			"Verifies employment status for barangay workers or related purposes.",
		processing: "1-3 business days",
		bullets: ["Job verification", "Loans", "Government requirements"],
	},
	{
		type: "Certificate of No Pending Case",
		title: "No Pending Case",
		description:
			"Certifies that the bearer has no pending case in the barangay.",
		processing: "1-2 business days",
		bullets: ["Employment", "Travel", "Clearances"],
	},
	{
		type: "Certificate of Live Birth",
		title: "Certificate of Live Birth",
		description: "Assists with civil registry requirements for birth records.",
		processing: "2-3 business days",
		bullets: ["School requirements", "IDs", "Legal processing"],
	},
	{
		type: "Certificate of Death",
		title: "Certificate of Death",
		description: "Assists with civil registry requirements for death records.",
		processing: "2-3 business days",
		bullets: ["Insurance claims", "Legal processing", "Benefits"],
	},
	{
		type: "Business Closure",
		title: "Business Closure",
		description:
			"Certifies closure of business operations within the barangay.",
		processing: "2-3 business days",
		bullets: ["BIR/DTI requirements", "Permit cancellation", "Legal purposes"],
	},
	{
		type: "For Bail",
		title: "For Bail",
		description: "Indigency certification for bail requirements.",
		processing: "1-2 business days",
		bullets: ["Court requirement", "Legal purposes"],
	},
	{
		type: "Good Moral (With 1X1 Picture)",
		title: "Good Moral (with 1x1 Picture)",
		description: "Good moral certificate requiring a 1x1 photo.",
		processing: "1-2 business days",
		bullets: ["Board examinations", "Professional requirements"],
	},
	{
		type: "Income",
		title: "Income Certificate",
		description: "Certifies source and level of income.",
		processing: "2-3 business days",
		bullets: ["Scholarship", "Financial assistance", "Requirement submission"],
	},
	{
		type: "Non-residence",
		title: "Non-residence Certificate",
		description: "Certifies that the person is not a resident of the barangay.",
		processing: "1-2 business days",
		bullets: ["School transfer", "Legal purposes", "Clearances"],
	},
	{
		type: "No Income",
		title: "No Income Certificate",
		description: "Certifies lack of permanent source of income.",
		processing: "2-3 business days",
		bullets: ["Medical assistance", "DSWD assistance", "Charity support"],
	},
	{
		type: "Other",
		title: "Other Certificate",
		description: "For other certificate requests not listed.",
		processing: "Varies",
		bullets: ["Special requests"],
	},
];

interface CertificateFormData {
	type: string;
	requestedBy: string;
	emailToNotify: string;
	purpose: string;
	estimatedCompletion: string;
	notes: string;
	// Additional fields for specific certificate types
	age: string;
	address: string;
	businessName: string;
	businessLocation: string;
	closureDate: string;
	closureReason: string;
	relationship: string;
	occupation: string;
	income: string;
	incomeYear: string;
	employmentPeriod: string;
	jobTitle: string;
	nonResidenceDuration: string;
	supportDetails: string;
	allowanceAmount: string;
	requiresPicture: boolean;
	photoUrl?: string; // Added for photo upload
}

// Helper function to get required fields based on certificate type
const getRequiredFieldsForCertificate = (type: string) => {
	switch (type) {
		case "Business Closure":
			return [
				"businessName",
				"businessLocation",
				"closureDate",
				"closureReason",
			];
		case "For Bail":
			return ["relationship"];
		case "Good Moral (With 1X1 Picture)":
			return ["age", "requiresPicture"];
		case "Certificate of Indigency":
			return ["address"];
		case "Income":
			return ["occupation", "income", "incomeYear"];
		case "Certificate of Employment":
			return ["jobTitle", "employmentPeriod"];
		case "Non-residence":
			return ["nonResidenceDuration"];
		case "No Income":
			return ["supportDetails", "allowanceAmount"];
		default:
			return [];
	}
};

// Helper function to get field labels
const getFieldLabel = (field: string) => {
	const labels: Record<string, string> = {
		businessName: "Business Name",
		businessLocation: "Business Location",
		closureDate: "Closure Date",
		closureReason: "Reason for Closure",
		relationship: "Relationship to Person",
		age: "Age",
		address: "Complete Address",
		occupation: "Occupation/Job",
		income: "Annual Income (₱)",
		incomeYear: "Income Year",
		jobTitle: "Job Title/Position",
		employmentPeriod: "Employment Period",
		nonResidenceDuration: "Duration of Non-Residence",
		supportDetails: "Support Details",
		allowanceAmount: "Monthly Allowance (₱)",
		requiresPicture: "Requires 1x1 Picture",
	};
	return labels[field] || field;
};

export default function CertificatesPage() {
	const { t } = useLanguage();
	const { userProfile } = useAuth();
	const { toast } = useToast();
	const [certificates, setCertificates] = useState<Certificate[]>([]);
	const [loading, setLoading] = useState(true);
	const [formOpen, setFormOpen] = useState(false);
	const [formLoading, setFormLoading] = useState(false);
	const [photoUploading, setPhotoUploading] = useState(false);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const photoInputRef = useRef<HTMLInputElement | null>(null);
	const [formData, setFormData] = useState<CertificateFormData>({
		type: "",
		requestedBy: userProfile
			? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
			  userProfile.email ||
			  "Unknown"
			: "",
		emailToNotify: userProfile?.email || "",
		purpose: "",
		estimatedCompletion: "",
		notes: "",
		// Additional fields for specific certificate types
		age: "",
		address: "",
		businessName: "",
		businessLocation: "",
		closureDate: "",
		closureReason: "",
		relationship: "",
		occupation: "",
		income: "",
		incomeYear: "",
		employmentPeriod: "",
		jobTitle: "",
		nonResidenceDuration: "",
		supportDetails: "",
		allowanceAmount: "",
		requiresPicture: false,
	});

	// Update form when userProfile changes
	useEffect(() => {
		if (userProfile) {
			setFormData((prev) => ({
				...prev,
				requestedBy:
					`${userProfile.firstName || ""} ${
						userProfile.lastName || ""
					}`.trim() ||
					userProfile.email ||
					"Unknown",
				emailToNotify: userProfile.email || prev.emailToNotify,
			}));
		}
	}, [userProfile]);

	// Fetch certificates on component mount
	useEffect(() => {
		fetchCertificates();
	}, []);

	const fetchCertificates = async () => {
		try {
			setLoading(true);
			const result = await getAllCertificatesAction();

			if (result.success && result.certificates) {
				setCertificates(result.certificates);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to fetch certificates",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to fetch certificates",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.type ||
			!formData.requestedBy ||
			!formData.emailToNotify ||
			!formData.purpose ||
			(formData.type === "Good Moral (With 1X1 Picture)" &&
				!formData.requiresPicture)
		) {
			toast({
				title: "Error",
				description:
					"Please fill in all required fields" +
					(formData.type === "Good Moral (With 1X1 Picture)"
						? " and confirm the 1x1 picture requirement"
						: ""),
				variant: "destructive",
			});
			return;
		}

		setFormLoading(true);

		try {
			const result = await createCertificateAction({
				type: formData.type,
				requestedBy: formData.requestedBy,
				emailToNotify: formData.emailToNotify,
				purpose: formData.purpose,
				estimatedCompletion: formData.estimatedCompletion || undefined,
				notes: formData.notes || undefined,
				// Include dynamic fields
				age: formData.age || undefined,
				address: formData.address || undefined,
				businessName: formData.businessName || undefined,
				businessLocation: formData.businessLocation || undefined,
				closureDate: formData.closureDate || undefined,
				closureReason: formData.closureReason || undefined,
				relationship: formData.relationship || undefined,
				occupation: formData.occupation || undefined,
				income: formData.income || undefined,
				incomeYear: formData.incomeYear || undefined,
				employmentPeriod: formData.employmentPeriod || undefined,
				jobTitle: formData.jobTitle || undefined,
				nonResidenceDuration: formData.nonResidenceDuration || undefined,
				supportDetails: formData.supportDetails || undefined,
				allowanceAmount: formData.allowanceAmount || undefined,
				requiresPicture: formData.requiresPicture || undefined,
				photoUrl: formData.photoUrl || undefined, // Include photoUrl
			});

			if (result.success) {
				toast({
					title: "Success",
					description: "Certificate request submitted successfully",
				});

				// Reset form but keep user info and close dialog
				setFormData({
					type: "",
					requestedBy: userProfile
						? `${userProfile.firstName || ""} ${
								userProfile.lastName || ""
						  }`.trim() ||
						  userProfile.email ||
						  "Unknown"
						: "",
					emailToNotify: userProfile?.email || "",
					purpose: "",
					estimatedCompletion: "",
					notes: "",
					age: "",
					address: "",
					businessName: "",
					businessLocation: "",
					closureDate: "",
					closureReason: "",
					relationship: "",
					occupation: "",
					income: "",
					incomeYear: "",
					employmentPeriod: "",
					jobTitle: "",
					nonResidenceDuration: "",
					supportDetails: "",
					allowanceAmount: "",
					requiresPicture: false,
					photoUrl: undefined, // Clear photoUrl on success
				});
				setFormOpen(false);
				setPhotoPreview(null); // Clear preview on success

				// Refresh certificates
				await fetchCertificates();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to submit certificate request",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to submit certificate request",
				variant: "destructive",
			});
		} finally {
			setFormLoading(false);
		}
	};

	const handleInputChange = (
		field: keyof CertificateFormData,
		value: string | boolean
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value as any,
		}));
	};

	const getStatusBadge = (status: Certificate["status"]) => {
		switch (status) {
			case "pending":
				return (
					<Badge
						variant="outline"
						className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
					>
						<Clock className="mr-1 h-3 w-3" />
						Pending
					</Badge>
				);
			case "processing":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
					>
						<Clock className="mr-1 h-3 w-3" />
						Processing
					</Badge>
				);
			case "ready":
				return (
					<Badge
						variant="outline"
						className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						<CheckCircle className="mr-1 h-3 w-3" />
						Ready
					</Badge>
				);
			case "completed":
				return (
					<Badge
						variant="outline"
						className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						<CheckCircle className="mr-1 h-3 w-3" />
						Completed
					</Badge>
				);
			case "rejected":
				return (
					<Badge
						variant="outline"
						className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					>
						<AlertCircle className="mr-1 h-3 w-3" />
						Rejected
					</Badge>
				);
			case "additionalInfo":
				return (
					<Badge
						variant="outline"
						className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
					>
						<AlertCircle className="mr-1 h-3 w-3" />
						Needs Info
					</Badge>
				);
			default:
				return null;
		}
	};

	const getEstimatedCompletion = (cert: Certificate) => {
		if (cert.status === "completed") return cert.completedOn || "Completed";
		if (cert.status === "rejected") return "Rejected";
		if (cert.status === "additionalInfo") return "Pending requirements";
		return cert.estimatedCompletion || "Not specified";
	};

	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
			<div className="mb-6 sm:mb-10">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					{t("certificates.title")}
				</h1>
				<p className="text-muted-foreground mt-2">
					{t("certificates.description")}
				</p>
			</div>

			<Tabs defaultValue="request" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8">
					<TabsTrigger value="request">{t("certificates.request")}</TabsTrigger>
					<TabsTrigger value="track">{t("certificates.track")}</TabsTrigger>
				</TabsList>

				<TabsContent value="request" className="space-y-4 sm:space-y-6">
					<div>
						<h2 className="text-lg sm:text-xl font-semibold">
							Available Certificates
						</h2>
					</div>

					{certificateCards && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
							{certificateCards.map((card) => (
								<Card key={card.type}>
									<CardHeader>
										<CardTitle>{card.title}</CardTitle>
										<CardDescription>{card.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center text-sm text-muted-foreground">
											<Clock className="mr-1 h-4 w-4" />
											{t("certificates.processing")}: {card.processing}
										</div>
										<div className="mt-4 text-sm">
											<p>{t("certificates.requiredFor")}:</p>
											<ul className="list-disc pl-5 mt-2 space-y-1">
												{card.bullets.map((b, i) => (
													<li key={i}>{b}</li>
												))}
											</ul>
										</div>
									</CardContent>
									<CardFooter>
										<Button
											onClick={() => {
												setFormData((prev) => ({
													...prev,
													type: card.type,
													requestedBy: userProfile
														? `${userProfile.firstName || ""} ${
																userProfile.lastName || ""
														  }`.trim() ||
														  userProfile.email ||
														  "Unknown"
														: prev.requestedBy,
													emailToNotify:
														userProfile?.email || prev.emailToNotify,
												}));
												setFormOpen(true);
											}}
											className="w-full"
										>
											{t("certificates.requestNow")}
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}

					{/* Certificate Request Form Dialog */}
					<Dialog open={formOpen} onOpenChange={setFormOpen}>
						<DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Request New Certificate</DialogTitle>
								<DialogDescription>
									Submit a new certificate request. Please fill in all required
									information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4 px-1">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="type">Certificate Type *</Label>
										<Select
											value={formData.type}
											onValueChange={(value) =>
												handleInputChange("type", value)
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select type" />
											</SelectTrigger>
											<SelectContent>
												{certificateTypes.map((type) => (
													<SelectItem key={type} value={type}>
														{type}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="requestedBy">
											Your Full Name *
											{userProfile &&
												(userProfile.firstName || userProfile.lastName) && (
													<span className="text-xs text-green-600 ml-1">
														(auto-filled)
													</span>
												)}
										</Label>
										<Input
											id="requestedBy"
											placeholder="Enter your full name"
											value={formData.requestedBy}
											onChange={(e) =>
												handleInputChange("requestedBy", e.target.value)
											}
											className={
												userProfile &&
												(userProfile.firstName || userProfile.lastName)
													? "border-green-200 bg-green-50"
													: ""
											}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emailToNotify">
										Email for Notifications *
										{userProfile?.email && (
											<span className="text-xs text-green-600 ml-1">
												(auto-filled)
											</span>
										)}
									</Label>
									<Input
										id="emailToNotify"
										type="email"
										placeholder="Enter your email address"
										value={formData.emailToNotify}
										onChange={(e) =>
											handleInputChange("emailToNotify", e.target.value)
										}
										className={
											userProfile?.email ? "border-green-200 bg-green-50" : ""
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="purpose">Purpose *</Label>
									<Input
										id="purpose"
										placeholder="e.g., Job application, Voter's registration"
										value={formData.purpose}
										onChange={(e) =>
											handleInputChange("purpose", e.target.value)
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="estimatedCompletion">
										Preferred Completion Date
									</Label>
									<Input
										id="estimatedCompletion"
										type="date"
										value={formData.estimatedCompletion}
										onChange={(e) =>
											handleInputChange("estimatedCompletion", e.target.value)
										}
									/>
								</div>

								{/* Dynamic fields based on certificate type */}
								{getRequiredFieldsForCertificate(formData.type).length > 0 && (
									<div className="border-t pt-4">
										<h4 className="text-sm font-medium text-gray-900 mb-3">
											Additional Information Required
										</h4>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{getRequiredFieldsForCertificate(formData.type).map(
												(field) => (
													<div key={field} className="space-y-2 sm:col-span-1">
														<Label htmlFor={field}>
															{getFieldLabel(field)} *
														</Label>
														{field === "requiresPicture" ? (
															<div className="flex items-center space-x-2">
																<input
																	type="checkbox"
																	id={field}
																	checked={
																		formData[
																			field as keyof CertificateFormData
																		] as boolean
																	}
																	onChange={(e) =>
																		handleInputChange(
																			field as keyof CertificateFormData,
																			e.target.checked
																		)
																	}
																	className="h-4 w-4"
																/>
																<Label
																	htmlFor={field}
																	className="text-sm font-normal"
																>
																	I understand this certificate requires a 1x1
																	picture
																</Label>
															</div>
														) : field === "age" &&
														  formData.type ===
																"Good Moral (With 1X1 Picture)" ? (
															<div className="space-y-2">
																<Input
																	id="age"
																	placeholder="e.g., 23"
																	value={formData.age}
																	onChange={(e) =>
																		handleInputChange("age", e.target.value)
																	}
																	type="number"
																	required
																/>
																<div className="space-y-2">
																	<Label htmlFor="photo">1x1 Picture *</Label>
																	<div
																		className="group relative rounded-lg border border-dashed p-4 sm:p-5 transition hover:border-primary/60 hover:bg-muted/40"
																		onDragOver={(e) => e.preventDefault()}
																		onDrop={async (e) => {
																			e.preventDefault();
																			const file = e.dataTransfer.files?.[0];
																			if (!file) return;
																			const reader = new FileReader();
																			reader.onload = async () => {
																				const dataUrl = reader.result as string;
																				setPhotoPreview(dataUrl);
																				setPhotoUploading(true);
																				try {
																					const res =
																						await uploadGoodMoralPhotoAction(
																							dataUrl
																						);
																					if (res.success && res.url) {
																						handleInputChange(
																							"requiresPicture",
																							true
																						);
																						setFormData(
																							(prev) =>
																								({
																									...prev,
																									photoUrl: res.url,
																								} as any)
																						);
																					}
																				} finally {
																					setPhotoUploading(false);
																				}
																			};
																			reader.readAsDataURL(file);
																		}}
																	>
																		<div className="flex items-center gap-3">
																			<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
																				<UploadCloud className="h-6 w-6" />
																			</div>
																			<div className="flex-1">
																				<p className="text-sm font-medium">
																					Drag & drop your 1x1 photo here
																				</p>
																				<p className="text-xs text-muted-foreground">
																					PNG, JPG up to ~5MB
																				</p>
																			</div>
																			<Button
																				type="button"
																				variant="outline"
																				className="h-8 px-3"
																				onClick={() =>
																					photoInputRef.current?.click()
																				}
																			>
																				Browse
																			</Button>
																		</div>
																	</div>
																	<input
																		ref={photoInputRef}
																		type="file"
																		accept="image/*"
																		className="hidden"
																		onChange={async (e) => {
																			const file = e.target.files?.[0];
																			if (!file) return;
																			const reader = new FileReader();
																			reader.onload = async () => {
																				const dataUrl = reader.result as string;
																				setPhotoPreview(dataUrl);
																				setPhotoUploading(true);
																				try {
																					const res =
																						await uploadGoodMoralPhotoAction(
																							dataUrl
																						);
																					if (res.success && res.url) {
																						handleInputChange(
																							"requiresPicture",
																							true
																						);
																						setFormData(
																							(prev) =>
																								({
																									...prev,
																									photoUrl: res.url,
																								} as any)
																						);
																					}
																				} finally {
																					setPhotoUploading(false);
																				}
																			};
																			reader.readAsDataURL(file);
																		}}
																	/>

																	{photoPreview && (
																		<div className="mt-2 flex items-center gap-3">
																			<Image
																				src={photoPreview}
																				alt="1x1 Preview"
																				width={72}
																				height={72}
																				className="rounded border"
																			/>
																			{photoUploading ? (
																				<span className="text-xs text-muted-foreground">
																					Uploading...
																				</span>
																			) : (
																				<Button
																					type="button"
																					variant="ghost"
																					size="sm"
																					className="text-xs"
																					onClick={() => {
																						setPhotoPreview(null);
																						setFormData(
																							(prev) =>
																								({
																									...prev,
																									photoUrl: undefined,
																								} as any)
																						);
																					}}
																				>
																					<X className="h-4 w-4 mr-1" />
																					Remove
																				</Button>
																			)}
																		</div>
																	)}
																</div>
															</div>
														) : field === "closureDate" ? (
															<Input
																id={field}
																type="date"
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onChange={(e) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		e.target.value
																	)
																}
																required
															/>
														) : field === "closureReason" ? (
															<Select
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onValueChange={(value) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		value
																	)
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select reason" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="Financial Difficulties">
																		Financial Difficulties
																	</SelectItem>
																	<SelectItem value="Relocation">
																		Relocation
																	</SelectItem>
																	<SelectItem value="Change of Business">
																		Change of Business
																	</SelectItem>
																	<SelectItem value="Retirement">
																		Retirement
																	</SelectItem>
																	<SelectItem value="Other">Other</SelectItem>
																</SelectContent>
															</Select>
														) : field === "relationship" ? (
															<Select
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onValueChange={(value) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		value
																	)
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select relationship" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="Mother">Mother</SelectItem>
																	<SelectItem value="Father">Father</SelectItem>
																	<SelectItem value="Spouse">Spouse</SelectItem>
																	<SelectItem value="Child">Child</SelectItem>
																	<SelectItem value="Sibling">
																		Sibling
																	</SelectItem>
																	<SelectItem value="Guardian">
																		Guardian
																	</SelectItem>
																	<SelectItem value="Other">Other</SelectItem>
																</SelectContent>
															</Select>
														) : field === "incomeYear" ? (
															<Select
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onValueChange={(value) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		value
																	)
																}
															>
																<SelectTrigger>
																	<SelectValue placeholder="Select year" />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="2024">2024</SelectItem>
																	<SelectItem value="2023">2023</SelectItem>
																	<SelectItem value="2022">2022</SelectItem>
																	<SelectItem value="2021">2021</SelectItem>
																</SelectContent>
															</Select>
														) : field === "supportDetails" ||
														  field === "employmentPeriod" ? (
															<Textarea
																id={field}
																placeholder={
																	field === "supportDetails"
																		? "Describe support details..."
																		: "e.g., 2018 to present, January 2020 - December 2023"
																}
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onChange={(e) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		e.target.value
																	)
																}
																rows={2}
																required
															/>
														) : (
															<Input
																id={field}
																placeholder={
																	field === "businessName"
																		? "e.g., J'S FOOD HUB"
																		: field === "businessLocation"
																		? "e.g., Purok 2 Barangay Malinta Los Baños Laguna"
																		: field === "age"
																		? "e.g., 23"
																		: field === "address"
																		? "e.g., 1093 Purok 5 Malinta, Los Baños, Laguna"
																		: field === "occupation"
																		? "e.g., Custom Sewer, Massage Therapist"
																		: field === "income"
																		? "e.g., 42000"
																		: field === "jobTitle"
																		? "e.g., Massage Therapist, Hilot Wellness"
																		: field === "nonResidenceDuration"
																		? "e.g., more than 5 months"
																		: field === "allowanceAmount"
																		? "e.g., 4000"
																		: "Enter " +
																		  getFieldLabel(field).toLowerCase()
																}
																value={
																	formData[
																		field as keyof CertificateFormData
																	] as string
																}
																onChange={(e) =>
																	handleInputChange(
																		field as keyof CertificateFormData,
																		e.target.value
																	)
																}
																type={
																	field === "income" ||
																	field === "allowanceAmount"
																		? "number"
																		: "text"
																}
																required
															/>
														)}
													</div>
												)
											)}
										</div>
									</div>
								)}

								<div className="space-y-2">
									<Label htmlFor="notes">Additional Notes</Label>
									<Textarea
										id="notes"
										placeholder="Any special requirements or additional information..."
										value={formData.notes}
										onChange={(e) => handleInputChange("notes", e.target.value)}
										rows={3}
									/>
								</div>

								<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
									<Button
										type="button"
										variant="outline"
										onClick={() => setFormOpen(false)}
										className="w-full sm:w-auto"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={formLoading}
										className="w-full sm:w-auto"
									>
										{formLoading ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin mr-2" />
												Submitting...
											</>
										) : (
											"Submit Request"
										)}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</TabsContent>

				<TabsContent value="track">
					<Card>
						<CardHeader>
							<CardTitle>{t("certificates.yourRequests")}</CardTitle>
							<CardDescription>{t("certificates.trackStatus")}</CardDescription>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin mr-2" />
									<span>Loading your requests...</span>
								</div>
							) : certificates.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
									<p className="text-lg font-medium">
										No certificate requests found
									</p>
									<p className="text-sm">
										Submit your first request to get started
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{certificates.map((cert) => (
										<div key={cert.id} className="rounded-lg border p-4">
											<div className="flex items-start justify-between">
												<div>
													<div className="flex items-center">
														<FileText className="mr-2 h-5 w-5 text-primary" />
														<h3 className="font-medium">{cert.type}</h3>
													</div>
													<p className="text-sm text-muted-foreground mt-1">
														{t("certificates.requestedOn")}: {cert.requestedOn}
													</p>
												</div>
												<div className="flex items-center">
													{getStatusBadge(cert.status)}
												</div>
											</div>
											<div className="mt-4">
												<p className="text-sm">
													{t("certificates.reference")}: {cert.id}
												</p>
												<p className="text-sm text-muted-foreground mt-1">
													{cert.status === "ready"
														? "Available for pickup at the Barangay Hall"
														: cert.status === "rejected"
														? `Rejected: ${cert.rejectedReason}`
														: cert.status === "additionalInfo"
														? "Additional information required"
														: `Estimated completion: ${getEstimatedCompletion(
																cert
														  )}`}
												</p>
												{cert.notes && (
													<p className="text-sm text-muted-foreground mt-1">
														Notes: {cert.notes}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
