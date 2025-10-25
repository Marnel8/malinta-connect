"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Edit,
	Trash2,
	Plus,
	Eye,
	Mail,
	Phone,
	Users,
	Upload,
	Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { 
	getAllOfficialsAction, 
	createOfficialAction, 
	updateOfficialAction, 
	deleteOfficialAction,
	searchOfficialsAction,
	type Official 
} from "@/app/actions/officials";

export default function OfficialsManagementPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [officials, setOfficials] = useState<Official[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [positionFilter, setPositionFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentOfficial, setCurrentOfficial] = useState<Official | null>(null);
	const [isViewOfficialOpen, setIsViewOfficialOpen] = useState(false);
	const [committees, setCommittees] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string>("");
	const [selectedPosition, setSelectedPosition] = useState<string>("councilor");

	const isCaptain = (currentOfficial?.position === "captain" || selectedPosition === "captain");

	// Load officials on component mount
	useEffect(() => {
		loadOfficials();
	}, []);

	// Load officials from Firebase
	const loadOfficials = async () => {
		setIsLoading(true);
		try {
			const result = await getAllOfficialsAction();
			if (result.success && result.officials) {
				setOfficials(result.officials);
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || "Failed to load officials",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: "Failed to load officials",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Search and filter officials
	const handleSearch = async () => {
		setIsLoading(true);
		try {
			const result = await searchOfficialsAction(searchQuery, positionFilter, statusFilter);
			if (result.success && result.officials) {
				setOfficials(result.officials);
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || "Failed to search officials",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: "Failed to search officials",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle photo selection
	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid file type",
					description: "Please select an image file (JPG, PNG, GIF, WebP)",
					variant: "destructive",
				});
				return;
			}

			// Validate file size (10MB limit)
			if (file.size > 10 * 1024 * 1024) {
				toast({
					title: "File too large",
					description: "Please select an image smaller than 10MB",
					variant: "destructive",
				});
				return;
			}

			setSelectedPhoto(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setPhotoPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.currentTarget);
			
			// Add photo file if selected
			if (selectedPhoto) {
				formData.set("photo", selectedPhoto);
			}

			// Add committees
			formData.set("committees", (committees || []).filter(c => c.trim() !== "").join(","));

			// Only include biography if position is captain
			const position = formData.get("position") as string;
			if (position !== "captain") {
				formData.delete("biography");
			}

			let result;
			if (currentOfficial) {
				result = await updateOfficialAction(currentOfficial.id, formData);
			} else {
				result = await createOfficialAction(formData);
			}

			if (result.success) {
				toast({
					title: t("admin.success"),
					description: currentOfficial 
						? t("admin.officials.updateSuccess") 
						: t("admin.officials.saveSuccess"),
				});
				
				// Reset form and reload officials
				setIsAddOfficialOpen(false);
				setCurrentOfficial(null);
				setCommittees([]);
				setSelectedPhoto(null);
				setPhotoPreview("");
				setSelectedPosition("councilor");
				await loadOfficials();
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || "Failed to save official",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: "Failed to save official",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle delete official
	const handleDeleteOfficial = async () => {
		if (!currentOfficial) return;
		
		setIsDeleting(true);
		try {
			const result = await deleteOfficialAction(currentOfficial.id);
			if (result.success) {
				toast({
					title: t("admin.success"),
					description: t("admin.officials.deleteSuccess"),
				});
				
				setIsDeleteDialogOpen(false);
				setCurrentOfficial(null);
				await loadOfficials();
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || "Failed to delete official",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: "Failed to delete official",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	// Handle view official
	const handleViewOfficial = (official: Official) => {
		setCurrentOfficial(official);
		setIsViewOfficialOpen(true);
	};

	// Handle edit official
	const handleEditOfficial = (official: Official) => {
		setCurrentOfficial(official);
		setCommittees(official.committees || []);
		setSelectedPhoto(null);
		setPhotoPreview(official.photo || "");
		setSelectedPosition(official.position);
		setIsAddOfficialOpen(true);
	};

	// Handle add committee
	const handleAddCommittee = () => {
		setCommittees([...committees, ""]);
	};

	// Handle remove committee
	const handleRemoveCommittee = (index: number) => {
		const newCommittees = [...committees];
		newCommittees.splice(index, 1);
		setCommittees(newCommittees);
	};

	// Handle committee change
	const handleCommitteeChange = (index: number, value: string) => {
		const newCommittees = [...committees];
		newCommittees[index] = value;
		setCommittees(newCommittees);
	};

	// Reset form
	const resetForm = () => {
		setCurrentOfficial(null);
		setCommittees([]);
		setSelectedPhoto(null);
		setPhotoPreview("");
		setSelectedPosition("councilor");
		setIsAddOfficialOpen(true);
	};

	return (
		<div className="p-6 space-y-6 w-full">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("admin.officials.title")}
					</h1>
					<p className="text-muted-foreground mt-2">
						{t("admin.officials.description")}
					</p>
				</div>
				<Button
					onClick={resetForm}
					className="bg-primary hover:bg-primary/90"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("admin.officials.add")}
				</Button>
			</div>

			<div className="flex flex-col md:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-lg">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t("admin.officials.searchPlaceholder")}
						className="pl-8 bg-background"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
					/>
				</div>
				<Select value={positionFilter} onValueChange={setPositionFilter}>
					<SelectTrigger className="w-[180px] bg-background">
						<SelectValue placeholder={t("admin.officials.filterByPosition")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("events.allCategories")}</SelectItem>
						<SelectItem value="captain">{t("officials.captain")}</SelectItem>
						<SelectItem value="councilor">
							{t("officials.councilors")}
						</SelectItem>
						<SelectItem value="secretary">
							{t("officials.secretary")}
						</SelectItem>
						<SelectItem value="treasurer">
							{t("officials.treasurer")}
						</SelectItem>
						<SelectItem value="clerk">
							{t("officials.clerk")}
						</SelectItem>
						<SelectItem value="skChairperson">
							{t("officials.skChairperson")}
						</SelectItem>
					</SelectContent>
				</Select>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px] bg-background">
						<SelectValue placeholder={t("admin.officials.filterByStatus")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("events.allCategories")}</SelectItem>
						<SelectItem value="active">
							{t("admin.officials.active")}
						</SelectItem>
						<SelectItem value="inactive">
							{t("admin.officials.inactive")}
						</SelectItem>
					</SelectContent>
				</Select>
				<Button onClick={handleSearch} disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Search className="mr-2 h-4 w-4" />
					)}
					{t("admin.search")}
				</Button>
			</div>

			<div className="space-y-4">
				{isLoading ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center p-12">
							<Loader2 className="h-12 w-12 text-muted-foreground/50 mb-4 animate-spin" />
							<p className="text-muted-foreground text-center">
								{t("admin.loading")}
							</p>
						</CardContent>
					</Card>
				) : officials.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center p-12">
							<Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-muted-foreground text-center">
								{t("admin.noData")}
							</p>
							<Button
								className="mt-4"
								onClick={resetForm}
							>
								<Plus className="mr-2 h-4 w-4" />
								{t("admin.officials.add")}
							</Button>
						</CardContent>
					</Card>
				) : (
					officials.map((official) => (
						<Card
							key={official.id}
							className="overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="flex flex-col md:flex-row">
								<div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
									<Image
										src={official.photo || "/placeholder-user.jpg"}
										alt={official.name}
										fill
										className="object-cover"
										objectPosition="center top"
									/>
								</div>
								<div className="flex-1 p-6">
									<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
										<div>
											<h3 className="text-xl font-bold">{official.name}</h3>
											<p className="text-muted-foreground capitalize">
												{official.position}
											</p>
											<div className="flex items-center mt-2">
												<Badge
													variant={
														official.status === "active"
															? "default"
															: "secondary"
													}
												>
													{t(`admin.officials.${official.status}`)}
												</Badge>
											</div>
											<div className="space-y-1 mt-4">
												<div className="flex items-center text-sm">
													<Mail className="mr-2 h-4 w-4 text-primary" />
													<span>{official.email}</span>
												</div>
												<div className="flex items-center text-sm">
													<Phone className="mr-2 h-4 w-4 text-primary" />
													<span>{official.phone}</span>
												</div>
											</div>
										</div>
										<div className="flex flex-row md:flex-col gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleViewOfficial(official)}
												className="hover:bg-primary/10"
											>
												<Eye className="h-4 w-4 mr-2" />
												{t("admin.view")}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleEditOfficial(official)}
												className="hover:bg-primary/10"
											>
												<Edit className="h-4 w-4 mr-2" />
												{t("admin.edit")}
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => {
													setCurrentOfficial(official);
													setIsDeleteDialogOpen(true);
												}}
												className="hover:bg-red-500/90"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												{t("admin.delete")}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>
					))
				)}
			</div>

			{/* Add/Edit Official Dialog */}
			<Dialog open={isAddOfficialOpen} onOpenChange={setIsAddOfficialOpen}>
				<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{currentOfficial
								? "Edit Official"
								: "Add New Official"}
						</DialogTitle>
						<DialogDescription>
							{currentOfficial
								? "Update the official's information below."
								: "Fill in the official's information below."}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid gap-6 py-4">
							{/* Photo Upload Section */}
							<div className="space-y-3">
								<Label htmlFor="photo" className="text-sm font-medium">
									Image (Optional)
								</Label>
								<div className="flex items-center gap-4">
									<label htmlFor="photo" className="relative h-28 w-28 rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 transition-all duration-200 group cursor-pointer">
										{(photoPreview || currentOfficial?.photo) ? (
											<>
												<Image
													src={photoPreview || currentOfficial?.photo || "/placeholder-user.jpg"}
													alt="Preview"
													fill
													className="object-cover"
												/>
												<div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
												<div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
													<Upload className="h-6 w-6 text-white drop-shadow-lg mb-1" />
													<p className="text-xs text-white font-medium drop-shadow-lg">
														Change Photo
													</p>
												</div>
												{/* Remove Photo Button */}
												<button
													type="button"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setSelectedPhoto(null);
														setPhotoPreview("");
													}}
													className="absolute top-1 right-1 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg"
													title="Remove photo"
												>
													<svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</>
										) : (
											<div className="flex flex-col items-center justify-center h-full text-center p-2">
												<div className="relative">
													<Upload className="h-8 w-8 text-muted-foreground/60 group-hover:text-primary/70 transition-colors duration-200" />
													<div className="absolute -top-1 -right-1 h-3 w-3 bg-primary/20 rounded-full animate-pulse" />
												</div>
												<p className="text-xs text-muted-foreground/60 mt-1 font-medium">
													Click to upload
												</p>
											</div>
										)}
										<input
											id="photo"
											name="photo"
											type="file"
											accept="image/*"
											onChange={handlePhotoChange}
											className="hidden"
										/>
									</label>
									<div className="flex-1 space-y-3">
										<div className="p-3 bg-muted/20 rounded-lg border border-muted/30">
											<div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
												<div className="w-2 h-2 bg-green-500 rounded-full" />
												<span className="font-medium">Supported formats</span>
											</div>
											<p className="text-xs text-muted-foreground mb-2">
												JPG, PNG, GIF, WebP up to 10MB
											</p>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>•</span>
												<span>Click the preview area to upload</span>
											</div>
											{(photoPreview || currentOfficial?.photo) && (
												<div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-muted/30">
													<span>•</span>
													<span>Hover over the image to see options</span>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Basic Information Section */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground/80 border-b pb-2">
									{"Basic Information"}
								</h3>
								<div className="grid grid-cols-2 gap-4">
																	<div className="col-span-2">
									<Label htmlFor="name" className="text-sm font-medium">
										Full Name
									</Label>
									<Input
										id="name"
										name="name"
										defaultValue={currentOfficial?.name || ""}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="position" className="text-sm font-medium">
										Position
									</Label>
									<Select
										name="position"
										defaultValue={currentOfficial?.position || "councilor"}
										onValueChange={setSelectedPosition}
									>
										<SelectTrigger id="position" className="mt-1">
											<SelectValue
												placeholder="Select position"
											/>
										</SelectTrigger>
											<SelectContent>
												<SelectItem value="captain">
													Captain
												</SelectItem>
												<SelectItem value="councilor">
													Councilor
												</SelectItem>
												<SelectItem value="secretary">
													Secretary
												</SelectItem>
												<SelectItem value="treasurer">
													Treasurer
												</SelectItem>
												<SelectItem value="clerk">
													Clerk
												</SelectItem>
												<SelectItem value="skChairperson">
													SK Chairperson
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
																	<div>
									<Label htmlFor="term" className="text-sm font-medium">
										Current Term
									</Label>
									<Input
										id="term"
										name="term"
										defaultValue={currentOfficial?.term || "2022-2025"}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="birthday" className="text-sm font-medium">
										Birthday
									</Label>
									<Input
										id="birthday"
										name="birthday"
										type="date"
										defaultValue={currentOfficial?.birthday || ""}
										required
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="status" className="text-sm font-medium">
										Status
									</Label>
									<Select
										name="status"
										defaultValue={currentOfficial?.status || "active"}
									>
										<SelectTrigger id="status" className="mt-1">
											<SelectValue placeholder="Select status" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">
												Active
											</SelectItem>
											<SelectItem value="inactive">
												Inactive
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								</div>
							</div>

							{/* Contact Information Section */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-foreground/80 border-b pb-2">
									{"Contact Information"}
								</h3>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="email" className="text-sm font-medium">
											Email Address
										</Label>
										<Input
											id="email"
											name="email"
											type="email"
											defaultValue={currentOfficial?.email || ""}
											required
											className="mt-1"
										/>
									</div>
									<div>
										<Label htmlFor="phone" className="text-sm font-medium">
											Phone Number
										</Label>
										<Input
											id="phone"
											name="phone"
											defaultValue={currentOfficial?.phone || ""}
											required
											className="mt-1"
										/>
									</div>
								</div>
							</div>

							{/* Committees Section - Only show for captain, councilor, clerk, and sk chairperson */}
							{(selectedPosition === "captain" || selectedPosition === "councilor" || selectedPosition === "clerk" || selectedPosition === "skChairperson" || 
							  currentOfficial?.position === "captain" || currentOfficial?.position === "councilor" || currentOfficial?.position === "clerk" || currentOfficial?.position === "skChairperson") && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-foreground/80 border-b pb-2">
										Committees
									</h3>
									<div className="space-y-3">
										{(committees || []).map((committee, index) => (
											<div key={index} className="flex items-center gap-3">
												<Input
													value={committee}
													onChange={(e) =>
														handleCommitteeChange(index, e.target.value)
													}
													placeholder={`Committee ${index + 1}`}
													className="flex-1"
												/>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleRemoveCommittee(index)}
													className="shrink-0"
												>
													Remove
												</Button>
											</div>
										))}
										<Button
											type="button"
											variant="outline"
											onClick={handleAddCommittee}
											className="w-full"
										>
											<Plus className="h-4 w-4 mr-2" />
											Add Committee
										</Button>
									</div>
								</div>
							)}

							{/* Biography & Message Section - Only show for captain, councilor, clerk, and sk chairperson */}
							{(selectedPosition === "captain" || selectedPosition === "councilor" || selectedPosition === "clerk" || selectedPosition === "skChairperson" || 
							  currentOfficial?.position === "captain" || currentOfficial?.position === "councilor" || currentOfficial?.position === "clerk" || currentOfficial?.position === "skChairperson") && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-foreground/80 border-b pb-2">
										{isCaptain ? "Biography & Message" : "Personal Message"}
									</h3>
									<div className="space-y-4">
										{isCaptain && (
											<div>
												<Label htmlFor="biography" className="text-sm font-medium">
													Biography
												</Label>
												<Textarea
													id="biography"
													name="biography"
													rows={4}
													defaultValue={currentOfficial?.biography || ""}
													required
													className="mt-1"
													placeholder="Tell us about the official's background, experience, and qualifications..."
												/>
											</div>
										)}
										<div>
											<Label htmlFor="message" className="text-sm font-medium">
												Personal Message
											</Label>
											<Textarea
												id="message"
												name="message"
												rows={3}
												defaultValue={currentOfficial?.message || ""}
												className="mt-1"
												placeholder="Any special message or vision from this official..."
											/>
										</div>
									</div>
								</div>
							)}

							{/* Projects & Achievements Section */}
							{(selectedPosition === "captain" || selectedPosition === "councilor" || selectedPosition === "clerk" || selectedPosition === "skChairperson" || 
							  currentOfficial?.position === "captain" || currentOfficial?.position === "councilor" || currentOfficial?.position === "clerk" || currentOfficial?.position === "skChairperson") && (
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-foreground/80 border-b pb-2">
										{(selectedPosition === "captain" || currentOfficial?.position === "captain") ? "Projects & Achievements" : "Achievements"}
									</h3>
									<div className={`grid gap-4 ${(selectedPosition === "captain" || currentOfficial?.position === "captain") ? "grid-cols-2" : "grid-cols-1"}`}>
										{(selectedPosition === "captain" || currentOfficial?.position === "captain") && (
											<div>
												<Label htmlFor="projects" className="text-sm font-medium">
													Projects
												</Label>
												<Textarea
													id="projects"
													name="projects"
													rows={3}
													defaultValue={currentOfficial?.projects?.join(", ") || ""}
													className="mt-1"
													placeholder="Enter projects separated by commas..."
												/>
												<p className="text-xs text-muted-foreground mt-1">
													Separate multiple projects with commas
												</p>
											</div>
										)}
										<div>
											<Label htmlFor="achievements" className="text-sm font-medium">
												Achievements
											</Label>
											<Textarea
												id="achievements"
												name="achievements"
												rows={3}
												defaultValue={
													currentOfficial?.achievements?.join(", ") || ""
												}
												className="mt-1"
												placeholder="Enter achievements separated by commas..."
											/>
											<p className="text-xs text-muted-foreground mt-1">
												Separate multiple achievements with commas
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
						<DialogFooter className="pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddOfficialOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{currentOfficial ? "Updating..." : "Adding..."}
									</>
								) : (
									<>
										{currentOfficial ? "Save Changes" : "Add Official"}
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("admin.delete")}</DialogTitle>
						<DialogDescription>
							{t("admin.officials.confirmDelete")}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							{t("admin.cancel")}
						</Button>
						<Button 
							variant="destructive" 
							onClick={handleDeleteOfficial}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{t("admin.deleting")}
								</>
							) : (
								t("admin.delete")
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Official Dialog */}
			<Dialog open={isViewOfficialOpen} onOpenChange={setIsViewOfficialOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{t("admin.officials.view")}</DialogTitle>
					</DialogHeader>
					{currentOfficial && (
						<div className="space-y-4">
							<div className="relative h-48 w-full rounded-md overflow-hidden">
								<Image
									src={currentOfficial.photo || "/placeholder-user.jpg"}
									alt={currentOfficial.name}
									fill
									className="object-cover"
									objectPosition="center top"
								/>
							</div>
							<h2 className="text-2xl font-bold">{currentOfficial.name}</h2>
							<p className="text-lg text-muted-foreground">
								{t(`officials.${currentOfficial.position}`)}
							</p>
							<div className="flex flex-wrap gap-2">
								<Badge
									variant={
										currentOfficial.status === "active"
											? "default"
											: "secondary"
									}
								>
									{t(`admin.officials.${currentOfficial.status}`)}
								</Badge>
								<Badge variant="outline">{currentOfficial.term}</Badge>
							</div>
							<div className="space-y-2">
								<div className="flex items-center">
									<Mail className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("officials.email")}:</span>
									<span className="ml-2">{currentOfficial.email}</span>
								</div>
								<div className="flex items-center">
									<Phone className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("officials.phone")}:</span>
									<span className="ml-2">{currentOfficial.phone}</span>
								</div>
								{currentOfficial.birthday && (
									<div className="flex items-center">
										<svg className="mr-2 h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										<span className="font-medium">Birthday:</span>
										<span className="ml-2">{new Date(currentOfficial.birthday).toLocaleDateString()}</span>
									</div>
								)}
							</div>
							{/* Only show committees for captain, councilor, clerk, and sk chairperson */}
							{(currentOfficial.position === "captain" || currentOfficial.position === "councilor" || currentOfficial.position === "clerk" || currentOfficial.position === "skChairperson") && (
								<div>
									<h3 className="font-medium mb-2">
										{t("officials.committees")}
									</h3>
									<div className="flex flex-wrap gap-2">
										{(currentOfficial.committees || []).map(
											(committee: string, index: number) => (
												<Badge key={index} variant="outline">
													{committee}
												</Badge>
											)
										)}
									</div>
								</div>
							)}
							{currentOfficial.position === "captain" && (
								<div>
									<h3 className="font-medium mb-2">{t("officials.biography")}</h3>
									<p className="text-muted-foreground">
										{currentOfficial.biography}
									</p>
								</div>
							)}
							{/* Only show personal message for captain, councilor, clerk, and sk chairperson */}
							{(currentOfficial.position === "captain" || currentOfficial.position === "councilor" || currentOfficial.position === "clerk" || currentOfficial.position === "skChairperson") && 
							 currentOfficial.message && (
								<div>
									<h3 className="font-medium mb-2">
										{t("admin.officials.message")}
									</h3>
									<p className="text-muted-foreground">
										{currentOfficial.message}
									</p>
								</div>
							)}
							{/* Show projects and achievements based on position */}
							{(currentOfficial.position === "captain" || currentOfficial.position === "councilor" || currentOfficial.position === "clerk" || currentOfficial.position === "skChairperson") && (
								<>
									{currentOfficial.position === "captain" && currentOfficial.projects &&
										currentOfficial.projects.length > 0 && (
											<div>
												<h3 className="font-medium mb-2">
													{t("admin.officials.projects")}
												</h3>
												<ul className="list-disc list-inside text-muted-foreground">
													{(currentOfficial.projects || []).map(
														(project: string, index: number) => (
															<li key={index}>{project}</li>
														)
													)}
												</ul>
											</div>
										)}
									{currentOfficial.achievements &&
										currentOfficial.achievements.length > 0 && (
											<div>
												<h3 className="font-medium mb-2">
													{t("admin.officials.achievements")}
												</h3>
												<ul className="list-disc list-inside text-muted-foreground">
													{(currentOfficial.achievements || []).map(
														(achievement: string, index: number) => (
															<li key={index}>{achievement}</li>
														)
													)}
												</ul>
											</div>
										)}
								</>
							)}
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setIsViewOfficialOpen(false)}>
							{t("admin.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
