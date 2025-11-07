"use client";

import { useState, useEffect, useTransition } from "react";
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
	MessageSquare,
	Clock,
	CheckCircle,
	AlertCircle,
	Search,
	Loader2,
	Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
	getAllBlotterAction,
	searchBlotterEntriesAction,
	getBlotterEntriesByStatusAction,
	createBlotterEntryAction,
	type BlotterEntry,
	type CreateBlotterData,
} from "@/app/actions/blotter";

export default function BlotterPage() {
	const { t } = useLanguage();
	const { user, userProfile } = useAuth();
	const { toast } = useToast();
	const [isPending, startTransition] = useTransition();

	// State management
	const [blotterEntries, setBlotterEntries] = useState<BlotterEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedEntry, setSelectedEntry] = useState<BlotterEntry | null>(null);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

	// Form state for new report - auto-populate with user data
	const [newReportForm, setNewReportForm] = useState<CreateBlotterData>({
		type: "",
		description: "",
		reportedBy: userProfile
			? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() ||
			  "Unknown"
			: "",
		contactNumber: userProfile?.phoneNumber || "",
		email: userProfile?.email || "",
		priority: "medium",
		location: userProfile?.address || "",
		incidentDate: "",
		notes: "",
	});

	// Update form when userProfile changes
	useEffect(() => {
		if (userProfile) {
			setNewReportForm((prev) => ({
				...prev,
				reportedBy:
					`${userProfile.firstName || ""} ${
						userProfile.lastName || ""
					}`.trim() ||
					userProfile.email ||
					"Unknown",
				contactNumber: userProfile.phoneNumber || prev.contactNumber,
				email: userProfile.email || prev.email,
				location: userProfile.address || prev.location,
			}));
		}
	}, [userProfile]);

	// Load blotter entries on component mount
	useEffect(() => {
		loadBlotterEntries();
	}, []);

	const loadBlotterEntries = async () => {
		setLoading(true);
		try {
			const result = await getAllBlotterAction();
			if (result.success && result.entries) {
				setBlotterEntries(result.entries);
			} else {
				console.error("Failed to load blotter entries:", result.error);
				toast({
					title: "Error",
					description: result.error || "Failed to load blotter entries",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error loading blotter entries:", error);
			toast({
				title: "Error",
				description: "Failed to load blotter entries",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Handle search
	const handleSearch = async (query: string) => {
		setSearchQuery(query);
		if (!query.trim()) {
			loadBlotterEntries();
			return;
		}

		setLoading(true);
		try {
			const result = await searchBlotterEntriesAction(query);
			if (result.success && result.entries) {
				setBlotterEntries(result.entries);
			} else {
				console.error("Failed to search blotter entries:", result.error);
				toast({
					title: "Error",
					description: result.error || "Failed to search blotter entries",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error searching blotter entries:", error);
			toast({
				title: "Error",
				description: "Failed to search blotter entries",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Handle status filter
	const handleStatusFilter = async (status: string) => {
		setStatusFilter(status);
		if (status === "all") {
			loadBlotterEntries();
			return;
		}

		setLoading(true);
		try {
			const result = await getBlotterEntriesByStatusAction(
				status as BlotterEntry["status"]
			);
			if (result.success && result.entries) {
				setBlotterEntries(result.entries);
			} else {
				console.error("Failed to filter blotter entries:", result.error);
				toast({
					title: "Error",
					description: result.error || "Failed to filter blotter entries",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error filtering blotter entries:", error);
			toast({
				title: "Error",
				description: "Failed to filter blotter entries",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Handle new report submission
	const handleNewReportSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check if user is authenticated
		if (!userProfile) {
			console.error("Blotter report failed: User not authenticated");
			toast({
				title: "Authentication Required",
				description: "Please log in to file a blotter report",
				variant: "destructive",
			});
			return;
		}

		startTransition(async () => {
			try {
				const result = await createBlotterEntryAction(newReportForm);
				if (result.success) {
					console.log(
						"Blotter report created successfully with ID:",
						result.entryId
					);
					toast({
						title: "Success",
						description: `New blotter report created with ID: ${result.entryId}`,
					});
					// Reset form but keep user info
					setNewReportForm({
						type: "",
						description: "",
						reportedBy: userProfile
							? `${userProfile.firstName || ""} ${
									userProfile.lastName || ""
							  }`.trim() ||
							  userProfile.email ||
							  "Unknown"
							: "",
						contactNumber: userProfile?.phoneNumber || "",
						email: userProfile?.email || "",
						priority: "medium",
						location: userProfile?.address || "",
						incidentDate: "",
						notes: "",
					});
					loadBlotterEntries();
				} else {
					console.error("Failed to create blotter report:", result.error);
					toast({
						title: "Error",
						description: result.error || "Failed to create blotter report",
						variant: "destructive",
					});
				}
			} catch (error) {
				console.error("Error creating blotter report:", error);
				toast({
					title: "Error",
					description: "Failed to create blotter report",
					variant: "destructive",
				});
			}
		});
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Badge
						variant="outline"
						className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
					>
						<Clock className="mr-1 h-3 w-3" />
						Pending
					</Badge>
				);
			case "investigating":
				return (
					<Badge
						variant="outline"
						className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
					>
						<Clock className="mr-1 h-3 w-3" />
						{t("blotter.status.investigating")}
					</Badge>
				);
			case "resolved":
				return (
					<Badge
						variant="outline"
						className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
					>
						<CheckCircle className="mr-1 h-3 w-3" />
						{t("blotter.status.resolved")}
					</Badge>
				);
			case "additionalInfo":
				return (
					<Badge
						variant="outline"
						className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					>
						<AlertCircle className="mr-1 h-3 w-3" />
						{t("certificates.status.additionalInfo")}
					</Badge>
				);
			case "closed":
				return (
					<Badge
						variant="outline"
						className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
					>
						<CheckCircle className="mr-1 h-3 w-3" />
						Closed
					</Badge>
				);
			default:
				return null;
		}
	};

	return (
		<div className="container py-10">
			<div className="mb-10">
				<h1 className="text-3xl font-bold tracking-tight">
					{t("blotter.title")}
				</h1>
				<p className="text-muted-foreground mt-2">{t("blotter.description")}</p>
			</div>

			<Tabs defaultValue="file" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-8">
					<TabsTrigger value="file">{t("blotter.file")}</TabsTrigger>
					<TabsTrigger value="track">{t("blotter.track")}</TabsTrigger>
				</TabsList>

				<TabsContent value="file">
					<Card>
						<CardHeader>
							<CardTitle>{t("blotter.newReport")}</CardTitle>
							<CardDescription>{t("blotter.provideDetails")}</CardDescription>
						</CardHeader>
						<form onSubmit={handleNewReportSubmit}>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="incident-type">
										{t("blotter.incidentType")} *
									</Label>
									<Select
										value={newReportForm.type}
										onValueChange={(value) =>
											setNewReportForm((prev) => ({ ...prev, type: value }))
										}
									>
										<SelectTrigger id="incident-type">
											<SelectValue placeholder="Select incident type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Theft/Robbery">
												Theft/Robbery
											</SelectItem>
											<SelectItem value="Noise Complaint">
												Noise/Public Disturbance
											</SelectItem>
											<SelectItem value="Property Damage">
												Property Damage
											</SelectItem>
											<SelectItem value="Neighbor Dispute">
												Neighbor Dispute
											</SelectItem>
											<SelectItem value="Violence/Assault">
												Violence/Assault
											</SelectItem>
											<SelectItem value="Public Disturbance">
												Public Disturbance
											</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="incident-date">
											{t("blotter.incidentDate")}
										</Label>
										<Input
											type="date"
											id="incident-date"
											value={newReportForm.incidentDate}
											onChange={(e) =>
												setNewReportForm((prev) => ({
													...prev,
													incidentDate: e.target.value,
												}))
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="priority">Priority *</Label>
										<Select
											value={newReportForm.priority}
											onValueChange={(value) =>
												setNewReportForm((prev) => ({
													...prev,
													priority: value as CreateBlotterData["priority"],
												}))
											}
										>
											<SelectTrigger id="priority">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="low">Low</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="high">High</SelectItem>
												<SelectItem value="urgent">Urgent</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="incident-location">
										{t("blotter.incidentLocation")}
										{userProfile?.address && (
											<span className="text-xs text-green-600 ml-1">
												(auto-filled with your address)
											</span>
										)}
									</Label>
									<Input
										id="incident-location"
										value={newReportForm.location}
										onChange={(e) =>
											setNewReportForm((prev) => ({
												...prev,
												location: e.target.value,
											}))
										}
										placeholder="Enter the location where the incident occurred"
										className={
											userProfile?.address ? "border-green-200 bg-green-50" : ""
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="incident-description">
										{t("blotter.incidentDescription")} *
									</Label>
									<Textarea
										id="incident-description"
										value={newReportForm.description}
										onChange={(e) =>
											setNewReportForm((prev) => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder="Please provide a detailed description of what happened"
										className="min-h-[150px]"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="reported-by">
											Your Name *
											{userProfile &&
												(userProfile.firstName || userProfile.lastName) && (
													<span className="text-xs text-green-600 ml-1">
														(auto-filled)
													</span>
												)}
										</Label>
										<Input
											id="reported-by"
											value={newReportForm.reportedBy}
											onChange={(e) =>
												setNewReportForm((prev) => ({
													...prev,
													reportedBy: e.target.value,
												}))
											}
											placeholder="Your full name"
											className={
												userProfile &&
												(userProfile.firstName || userProfile.lastName)
													? "border-green-200 bg-green-50"
													: ""
											}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="contact-number">
											Contact Number *
											{userProfile?.phoneNumber && (
												<span className="text-xs text-green-600 ml-1">
													(auto-filled)
												</span>
											)}
										</Label>
										<Input
											id="contact-number"
											value={newReportForm.contactNumber}
											onChange={(e) =>
												setNewReportForm((prev) => ({
													...prev,
													contactNumber: e.target.value,
												}))
											}
											placeholder="Your phone number"
											className={
												userProfile?.phoneNumber
													? "border-green-200 bg-green-50"
													: ""
											}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email">
										Email Address *
										{userProfile?.email && (
											<span className="text-xs text-green-600 ml-1">
												(auto-filled)
											</span>
										)}
									</Label>
									<Input
										id="email"
										type="email"
										value={newReportForm.email}
										onChange={(e) =>
											setNewReportForm((prev) => ({
												...prev,
												email: e.target.value,
											}))
										}
										placeholder="Your email address"
										className={
											userProfile?.email ? "border-green-200 bg-green-50" : ""
										}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="additional-notes">Additional Notes</Label>
									<Textarea
										id="additional-notes"
										value={newReportForm.notes}
										onChange={(e) =>
											setNewReportForm((prev) => ({
												...prev,
												notes: e.target.value,
											}))
										}
										placeholder="Any additional information or notes"
										className="min-h-[100px]"
									/>
								</div>
							</CardContent>
							<CardFooter>
								<Button 
									type="submit" 
									className="w-full" 
									disabled={isPending || !user || !userProfile}
								>
									{isPending ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Submitting...
										</>
									) : (
										t("blotter.submitReport")
									)}
								</Button>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				<TabsContent value="track">
					<Card>
						<CardHeader>
							<CardTitle>{t("blotter.yourReports")}</CardTitle>
							<CardDescription>{t("blotter.trackStatus")}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center space-x-2 mb-6">
								<div className="relative flex-1">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										type="search"
										placeholder="Search reports..."
										className="pl-8"
										value={searchQuery}
										onChange={(e) => handleSearch(e.target.value)}
									/>
								</div>
								<Select value={statusFilter} onValueChange={handleStatusFilter}>
									<SelectTrigger className="w-[180px]">
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Reports</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="investigating">
											Under Investigation
										</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="additionalInfo">Needs Info</SelectItem>
										<SelectItem value="closed">Closed</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{loading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin mr-2" />
									<p>Loading your reports...</p>
								</div>
							) : blotterEntries.length === 0 ? (
								<div className="text-center py-8">
									<MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
									<p className="text-muted-foreground">No reports found</p>
									<p className="text-sm text-muted-foreground mt-1">
										{searchQuery
											? "Try adjusting your search terms"
											: "File your first blotter report to get started"}
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{blotterEntries.map((entry) => (
										<div key={entry.id} className="rounded-lg border p-4">
											<div className="flex items-start justify-between">
												<div>
													<div className="flex items-center">
														<MessageSquare className="mr-2 h-5 w-5 text-primary" />
														<h3 className="font-medium">{entry.type}</h3>
													</div>
													<p className="text-sm text-muted-foreground mt-1">
														Filed on: {entry.date}
													</p>
												</div>
												<div className="flex items-center">
													{getStatusBadge(entry.status)}
												</div>
											</div>
											<div className="mt-4">
												<p className="text-sm">
													{t("certificates.reference")}: {entry.referenceNumber}
												</p>
												{entry.location && (
													<p className="text-sm text-muted-foreground mt-1">
														{t("blotter.incidentLocation")}: {entry.location}
													</p>
												)}
												{entry.status === "additionalInfo" && entry.notes && (
													<p className="text-sm text-red-600 mt-2">
														{entry.notes}
													</p>
												)}
												<Button
													variant="outline"
													size="sm"
													className="mt-4"
													onClick={() => {
														setSelectedEntry(entry);
														setIsViewDialogOpen(true);
													}}
												>
													<Eye className="mr-1 h-3 w-3" />
													{t("blotter.viewDetails")}
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* View Details Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Blotter Report Details</DialogTitle>
					</DialogHeader>
					{selectedEntry && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Reference Number
									</Label>
									<p className="font-medium">{selectedEntry.referenceNumber}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Status
									</Label>
									<div className="mt-1">
										{getStatusBadge(selectedEntry.status)}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Report Type
									</Label>
									<p>{selectedEntry.type}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Priority
									</Label>
									<Badge
										variant={
											selectedEntry.priority === "urgent"
												? "destructive"
												: selectedEntry.priority === "high"
												? "default"
												: "secondary"
										}
									>
										{selectedEntry.priority.toUpperCase()}
									</Badge>
								</div>
							</div>

							<div>
								<Label className="text-sm font-medium text-muted-foreground">
									Description
								</Label>
								<p className="mt-1 text-sm">{selectedEntry.description}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Reported By
									</Label>
									<p>{selectedEntry.reportedBy}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Contact Number
									</Label>
									<p>{selectedEntry.contactNumber}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Email
									</Label>
									<p>{selectedEntry.email}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Location
									</Label>
									<p>{selectedEntry.location || "Not specified"}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Date Reported
									</Label>
									<p>{selectedEntry.date}</p>
								</div>
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Incident Date
									</Label>
									<p>{selectedEntry.incidentDate || "Not specified"}</p>
								</div>
							</div>

							{selectedEntry.notes && (
								<div>
									<Label className="text-sm font-medium text-muted-foreground">
										Notes
									</Label>
									<p className="mt-1 text-sm">{selectedEntry.notes}</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
