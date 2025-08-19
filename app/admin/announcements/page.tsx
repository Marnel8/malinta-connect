"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Megaphone, Clock, CheckCircle, AlertCircle, Eye, EyeOff, Plus, Edit, Trash2, FileText, MoreHorizontal } from "lucide-react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	getAllAnnouncementsAction,
	createAnnouncementAction,
	updateAnnouncementAction,
	deleteAnnouncementAction,
	publishAnnouncementAction,
	unpublishAnnouncementAction,
	type Announcement,
	type CreateAnnouncementData,
} from "@/app/actions/announcements";

export default function AdminAnnouncementsPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
	const [isViewAnnouncementOpen, setIsViewAnnouncementOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishingAnnouncementId, setPublishingAnnouncementId] = useState<string | null>(null);
	const [isUnpublishing, setIsUnpublishing] = useState(false);
	const [unpublishingAnnouncementId, setUnpublishingAnnouncementId] = useState<string | null>(null);

	// Load announcements on component mount
	useEffect(() => {
		loadAnnouncements();
	}, []);

	const loadAnnouncements = async () => {
		setIsLoading(true);
		try {
			const result = await getAllAnnouncementsAction();
			if (result.success && result.announcements) {
				setAnnouncements(result.announcements);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to load announcements",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load announcements",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const formData = new FormData(e.currentTarget);
			const announcementData: CreateAnnouncementData = {
				title: formData.get("title") as string,
				description: formData.get("description") as string,
				category: formData.get("category") as "Event" | "Notice" | "Important" | "Emergency",
				visibility: formData.get("visibility") as "public" | "residents",
				author: formData.get("author") as string,
				expiresOn: formData.get("expiresOn") as string,
			};

			let result;
			if (currentAnnouncement) {
				// Update existing announcement
				result = await updateAnnouncementAction({
					id: currentAnnouncement.id,
					...announcementData,
				});
			} else {
				// Create new announcement
				result = await createAnnouncementAction(announcementData);
			}

			if (result.success) {
				toast({
					title: "Success",
					description: currentAnnouncement
						? "Announcement updated successfully"
						: "Announcement created successfully",
				});
				setIsAddAnnouncementOpen(false);
				setCurrentAnnouncement(null);
				loadAnnouncements();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to save announcement",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to save announcement",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteAnnouncement = async () => {
		if (!currentAnnouncement) return;

		setIsDeleting(true);
		try {
			const result = await deleteAnnouncementAction(currentAnnouncement.id);
			if (result.success) {
				toast({
					title: "Success",
					description: "Announcement deleted successfully",
				});
				setIsDeleteDialogOpen(false);
				setCurrentAnnouncement(null);
				loadAnnouncements();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete announcement",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete announcement",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handlePublishAnnouncement = async (id: string) => {
		setIsPublishing(true);
		setPublishingAnnouncementId(id);
		try {
			const result = await publishAnnouncementAction(id);
			if (result.success) {
				toast({
					title: "Success",
					description: "Announcement published successfully",
				});
				loadAnnouncements();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to publish announcement",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to publish announcement",
				variant: "destructive",
			});
		} finally {
			setIsPublishing(false);
			setPublishingAnnouncementId(null);
		}
	};

	const handleUnpublishAnnouncement = async (id: string) => {
		setIsUnpublishing(true);
		setUnpublishingAnnouncementId(id);
		try {
			const result = await unpublishAnnouncementAction(id);
			if (result.success) {
				toast({
					title: "Success",
					description: "Announcement unpublished successfully",
				});
				loadAnnouncements();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to unpublish announcement",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to unpublish announcement",
				variant: "destructive",
			});
		} finally {
			setIsUnpublishing(false);
			setUnpublishingAnnouncementId(null);
		}
	};

	const handleViewAnnouncement = (announcement: Announcement) => {
		setCurrentAnnouncement(announcement);
		setIsViewAnnouncementOpen(true);
	};

	const handleEditAnnouncement = (announcement: Announcement) => {
		setCurrentAnnouncement(announcement);
		setIsAddAnnouncementOpen(true);
	};

	const handleAddNewAnnouncement = () => {
		setCurrentAnnouncement(null);
		setIsAddAnnouncementOpen(true);
	};

	// Filter announcements based on search and filters
	const filteredAnnouncements = announcements.filter((announcement) => {
		const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			announcement.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
			announcement.author.toLowerCase().includes(searchQuery.toLowerCase());
		
		const matchesCategory = categoryFilter === "all" || announcement.category.toLowerCase() === categoryFilter.toLowerCase();
		const matchesStatus = statusFilter === "all" || announcement.status === statusFilter;

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "published":
				return (
					<Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
						<CheckCircle className="mr-1 h-3 w-3" />
						Published
					</Badge>
				);
			case "draft":
				return (
					<Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
						<Clock className="mr-1 h-3 w-3" />
						Draft
					</Badge>
				);
			case "expired":
				return (
					<Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
						<AlertCircle className="mr-1 h-3 w-3" />
						Expired
					</Badge>
				);
			default:
				return null;
		}
	};

	const getVisibilityBadge = (visibility: string) => {
		switch (visibility) {
			case "public":
				return (
					<Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
						<Eye className="mr-1 h-3 w-3" />
						Public
					</Badge>
				);
			case "residents":
				return (
					<Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
						<EyeOff className="mr-1 h-3 w-3" />
						Residents Only
					</Badge>
				);
			default:
				return null;
		}
	};

	if (isLoading) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
					<p className="text-muted-foreground mt-2">Create and manage barangay announcements</p>
				</div>
				<Button onClick={handleAddNewAnnouncement}>
					<Plus className="mr-2 h-4 w-4" />
					New Announcement
				</Button>
			</div>

			<div className="flex items-center space-x-2 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search announcements..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="published">Published</SelectItem>
						<SelectItem value="draft">Draft</SelectItem>
						<SelectItem value="expired">Expired</SelectItem>
					</SelectContent>
				</Select>
				<Select value={categoryFilter} onValueChange={setCategoryFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						<SelectItem value="event">Events</SelectItem>
						<SelectItem value="notice">Notices</SelectItem>
						<SelectItem value="important">Important</SelectItem>
						<SelectItem value="emergency">Emergency</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Published On</TableHead>
							<TableHead>Author</TableHead>
							<TableHead>Expires On</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Visibility</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAnnouncements.map((announcement) => (
							<TableRow key={announcement.id}>
								<TableCell>
									<div className="flex items-center">
										<Megaphone className="mr-2 h-4 w-4 text-primary" />
										<div className="font-medium">{announcement.title}</div>
									</div>
								</TableCell>
								<TableCell>{announcement.category}</TableCell>
								<TableCell>
									{announcement.publishedOn ? new Date(announcement.publishedOn).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									}) : 'Not published'}
								</TableCell>
								<TableCell>{announcement.author}</TableCell>
								<TableCell>
									{new Date(announcement.expiresOn).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</TableCell>
								<TableCell>{getStatusBadge(announcement.status)}</TableCell>
								<TableCell>{getVisibilityBadge(announcement.visibility)}</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">Open menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleViewAnnouncement(announcement)}>
												<Eye className="mr-2 h-4 w-4" />
												View
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleEditAnnouncement(announcement)}>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											
											{announcement.status === "draft" && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem 
														onClick={() => handlePublishAnnouncement(announcement.id)}
														disabled={isPublishing && publishingAnnouncementId === announcement.id}
														className={isPublishing && publishingAnnouncementId === announcement.id ? "opacity-50 cursor-not-allowed" : ""}
													>
														{isPublishing && publishingAnnouncementId === announcement.id ? (
															<>
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
																Publishing...
															</>
														) : (
															<>
																<CheckCircle className="mr-2 h-4 w-4" />
																Publish
															</>
														)}
													</DropdownMenuItem>
												</>
											)}
											
											{announcement.status === "published" && (
												<>
													<DropdownMenuSeparator />
													<DropdownMenuItem 
														onClick={() => handleUnpublishAnnouncement(announcement.id)}
														disabled={isUnpublishing && unpublishingAnnouncementId === announcement.id}
														className={isUnpublishing && unpublishingAnnouncementId === announcement.id ? "opacity-50 cursor-not-allowed" : ""}
													>
														{isUnpublishing && unpublishingAnnouncementId === announcement.id ? (
															<>
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
																Unpublishing...
															</>
														) : (
															<>
																<Clock className="mr-2 h-4 w-4" />
																Unpublish
															</>
														)}
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem 
														onClick={() => {
															setCurrentAnnouncement(announcement);
															setIsDeleteDialogOpen(true);
														}}
														disabled={deletingAnnouncementId === announcement.id}
														className={`text-red-600 ${deletingAnnouncementId === announcement.id ? "opacity-50 cursor-not-allowed" : ""}`}
													>
														{deletingAnnouncementId === announcement.id ? (
															<>
																<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
																Deleting...
															</>
														) : (
															<>
																<Trash2 className="mr-2 h-4 w-4" />
																Delete
															</>
														)}
													</DropdownMenuItem>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Add/Edit Announcement Dialog */}
			<Dialog open={isAddAnnouncementOpen} onOpenChange={setIsAddAnnouncementOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>
							{currentAnnouncement ? "Edit Announcement" : "New Announcement"}
						</DialogTitle>
						<DialogDescription>
							{currentAnnouncement
								? "Update the announcement details below."
								: "Create a new announcement by filling out the form below."}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleFormSubmit}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<Label htmlFor="title" className="mb-2">
										Title
									</Label>
									<Input
										id="title"
										name="title"
										defaultValue={currentAnnouncement?.title || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="description" className="mb-2">
										Description
									</Label>
									<Textarea
										id="description"
										name="description"
										defaultValue={currentAnnouncement?.description || ""}
										required
										rows={4}
									/>
								</div>
								<div>
									<Label htmlFor="category" className="mb-2">
										Category
									</Label>
									<Select
										name="category"
										defaultValue={currentAnnouncement?.category || "Notice"}
									>
										<SelectTrigger id="category">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Event">Event</SelectItem>
											<SelectItem value="Notice">Notice</SelectItem>
											<SelectItem value="Important">Important</SelectItem>
											<SelectItem value="Emergency">Emergency</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="visibility" className="mb-2">
										Visibility
									</Label>
									<Select
										name="visibility"
										defaultValue={currentAnnouncement?.visibility || "public"}
									>
										<SelectTrigger id="visibility">
											<SelectValue placeholder="Select visibility" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="public">Public</SelectItem>
											<SelectItem value="residents">Residents Only</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="author" className="mb-2">
										Author
									</Label>
									<Input
										id="author"
										name="author"
										defaultValue={currentAnnouncement?.author || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="expiresOn" className="mb-2">
										Expires On
									</Label>
									<Input
										id="expiresOn"
										name="expiresOn"
										type="date"
										defaultValue={currentAnnouncement?.expiresOn || ""}
										required
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddAnnouncementOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										{currentAnnouncement ? "Updating..." : "Creating..."}
									</>
								) : (
									currentAnnouncement ? "Update" : "Create"
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
						<DialogTitle>Delete Announcement</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this announcement? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAnnouncement}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Announcement Dialog */}
			<Dialog open={isViewAnnouncementOpen} onOpenChange={setIsViewAnnouncementOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>View Announcement</DialogTitle>
					</DialogHeader>
					{currentAnnouncement && (
						<div className="space-y-4">
							<div className="flex items-center">
								<Megaphone className="mr-2 h-5 w-5 text-primary" />
								<h2 className="text-2xl font-bold">{currentAnnouncement.title}</h2>
							</div>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">
									{currentAnnouncement.category}
								</Badge>
								{getStatusBadge(currentAnnouncement.status)}
								{getVisibilityBadge(currentAnnouncement.visibility)}
							</div>
							<div className="space-y-2">
								<div className="flex items-center">
									<FileText className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">Description:</span>
									<span className="ml-2">{currentAnnouncement.description}</span>
								</div>
								<div className="flex items-center">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">Published On:</span>
									<span className="ml-2">
										{currentAnnouncement.publishedOn ? new Date(currentAnnouncement.publishedOn).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										}) : 'Not published'}
									</span>
								</div>
								<div className="flex items-center">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">Expires On:</span>
									<span className="ml-2">
										{new Date(currentAnnouncement.expiresOn).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</span>
								</div>
								<div className="flex items-center">
									<FileText className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">Author:</span>
									<span className="ml-2">{currentAnnouncement.author}</span>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setIsViewAnnouncementOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
} 