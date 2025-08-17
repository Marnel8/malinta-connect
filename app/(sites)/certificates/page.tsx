"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

import { useLanguage } from "@/contexts/language-context";
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
	"Other",
];

interface CertificateFormData {
	type: string;
	requestedBy: string;
	emailToNotify: string;
	purpose: string;
	estimatedCompletion: string;
	notes: string;
}

export default function CertificatesPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [certificates, setCertificates] = useState<Certificate[]>([]);
	const [loading, setLoading] = useState(true);
	const [formOpen, setFormOpen] = useState(false);
	const [formLoading, setFormLoading] = useState(false);
	const [formData, setFormData] = useState<CertificateFormData>({
		type: "",
		requestedBy: "",
		emailToNotify: "",
		purpose: "",
		estimatedCompletion: "",
		notes: "",
	});

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
			!formData.purpose
		) {
			toast({
				title: "Error",
				description: "Please fill in all required fields",
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
			});

			if (result.success) {
				toast({
					title: "Success",
					description: "Certificate request submitted successfully",
				});

				// Reset form and close dialog
				setFormData({
					type: "",
					requestedBy: "",
					emailToNotify: "",
					purpose: "",
					estimatedCompletion: "",
					notes: "",
				});
				setFormOpen(false);

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
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
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
		<div className="container py-10">
			<div className="mb-10">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("certificates.title")}
				</h1>
				<p className="text-muted-foreground mt-2">
					{t("certificates.description")}
				</p>
			</div>

			<Tabs defaultValue="request" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-8">
					<TabsTrigger value="request">{t("certificates.request")}</TabsTrigger>
					<TabsTrigger value="track">{t("certificates.track")}</TabsTrigger>
				</TabsList>

				<TabsContent value="request" className="space-y-6">
					<div>
						<h2 className="text-xl font-semibold">Available Certificates</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>{t("certificates.barangayClearance")}</CardTitle>
								<CardDescription>
									General purpose clearance for various transactions.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm text-muted-foreground">
									<Clock className="mr-1 h-4 w-4" />
									{t("certificates.processing")}: 1-2 business days
								</div>
								<div className="mt-4 text-sm">
									<p>{t("certificates.requiredFor")}:</p>
									<ul className="list-disc pl-5 mt-2 space-y-1">
										<li>Job applications</li>
										<li>Business permits</li>
										<li>School requirements</li>
									</ul>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											type: "Barangay Clearance",
										}));
										setFormOpen(true);
									}}
									className="w-full"
								>
									{t("certificates.requestNow")}
								</Button>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("certificates.residency")}</CardTitle>
								<CardDescription>
									Proof that you are a resident of the barangay.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm text-muted-foreground">
									<Clock className="mr-1 h-4 w-4" />
									{t("certificates.processing")}: 1 business day
								</div>
								<div className="mt-4 text-sm">
									<p>{t("certificates.requiredFor")}:</p>
									<ul className="list-disc pl-5 mt-2 space-y-1">
										<li>Scholarship applications</li>
										<li>Voter's registration</li>
										<li>Government IDs</li>
									</ul>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											type: "Certificate of Residency",
										}));
										setFormOpen(true);
									}}
									className="w-full"
								>
									{t("certificates.requestNow")}
								</Button>
							</CardFooter>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t("certificates.indigency")}</CardTitle>
								<CardDescription>
									Certifies that you are from a low-income household.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex items-center text-sm text-muted-foreground">
									<Clock className="mr-1 h-4 w-4" />
									{t("certificates.processing")}: 2-3 business days
								</div>
								<div className="mt-4 text-sm">
									<p>{t("certificates.requiredFor")}:</p>
									<ul className="list-disc pl-5 mt-2 space-y-1">
										<li>Medical assistance</li>
										<li>Educational assistance</li>
										<li>Fee waivers</li>
									</ul>
								</div>
							</CardContent>
							<CardFooter>
								<Button
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											type: "Certificate of Indigency",
										}));
										setFormOpen(true);
									}}
									className="w-full"
								>
									{t("certificates.requestNow")}
								</Button>
							</CardFooter>
						</Card>
					</div>

					{/* Certificate Request Form Dialog */}
					<Dialog open={formOpen} onOpenChange={setFormOpen}>
						<DialogContent className="sm:max-w-[500px]">
							<DialogHeader>
								<DialogTitle>Request New Certificate</DialogTitle>
								<DialogDescription>
									Submit a new certificate request. Please fill in all required
									information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
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
										<Label htmlFor="requestedBy">Your Full Name *</Label>
										<Input
											id="requestedBy"
											placeholder="Enter your full name"
											value={formData.requestedBy}
											onChange={(e) =>
												handleInputChange("requestedBy", e.target.value)
											}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emailToNotify">
										Email for Notifications *
									</Label>
									<Input
										id="emailToNotify"
										type="email"
										placeholder="Enter your email address"
										value={formData.emailToNotify}
										onChange={(e) =>
											handleInputChange("emailToNotify", e.target.value)
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

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setFormOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={formLoading}>
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
