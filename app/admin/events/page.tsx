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
	Calendar,
	Clock,
	MapPin,
	Search,
	Edit,
	Trash2,
	Plus,
	Eye,
	FileText,
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
	getAllEventsAction,
	createEventAction,
	updateEventAction,
	deleteEventAction,
	type Event,
	type CreateEventData,
} from "@/app/actions/events";

// Utility function to format date as "Oct 15, 2025"
const formatEventDate = (dateString: string): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	} catch (error) {
		// If date parsing fails, return the original string
		return dateString;
	}
};

export default function EventsManagementPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [events, setEvents] = useState<Event[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddEventOpen, setIsAddEventOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
	const [isViewEventOpen, setIsViewEventOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

	const [isAddingEvent, setIsAddingEvent] = useState(false);
	const [isFiltering, setIsFiltering] = useState(false);

	// Load events on component mount
	useEffect(() => {
		loadEvents();
	}, []);

	// Debounced search effect
	useEffect(() => {
		setIsFiltering(true);
		const timer = setTimeout(() => {
			setIsFiltering(false);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery, categoryFilter, statusFilter]);

	const loadEvents = async () => {
		setIsLoading(true);
		try {
			const result = await getAllEventsAction();
			if (result.success && result.events) {
				setEvents(result.events);
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || t("admin.events.loadError"),
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: t("admin.events.loadError"),
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Filter events based on search query, category, and status
	const filteredEvents = events.filter((event) => {
		const matchesSearch =
			event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			categoryFilter === "all" || event.category === categoryFilter;
		const matchesStatus =
			statusFilter === "all" || event.status === statusFilter;
		return matchesSearch && matchesCategory && matchesStatus;
	});

	const handleAddEvent = async (eventData: CreateEventData) => {
		setIsSubmitting(true);
		try {
			const result = await createEventAction(eventData);
			if (result.success) {
				toast({
					title: t("admin.success"),
					description: t("admin.events.saveSuccess"),
				});
				setIsAddEventOpen(false);
				loadEvents(); // Reload events to show the new one
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || t("admin.events.saveError"),
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: t("admin.events.saveError"),
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditEvent = async (eventData: Event) => {
		setIsSubmitting(true);
		try {
			const result = await updateEventAction(eventData);
			if (result.success) {
				toast({
					title: t("admin.success"),
					description: t("admin.events.updateSuccess"),
				});
				setIsAddEventOpen(false);
				loadEvents(); // Reload events to show the updated one
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || t("admin.events.updateError"),
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: t("admin.events.updateError"),
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteEvent = async () => {
		if (!currentEvent) return;

		setIsDeleting(true);
		setDeletingEventId(currentEvent.id);
		try {
			const result = await deleteEventAction(currentEvent.id);
			if (result.success) {
				toast({
					title: t("admin.success"),
					description: t("admin.events.deleteSuccess"),
				});
				setIsDeleteDialogOpen(false);
				setCurrentEvent(null);
				loadEvents(); // Reload events to remove the deleted one
			} else {
				toast({
					title: t("admin.error"),
					description: result.error || t("admin.events.deleteError"),
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: t("admin.error"),
				description: t("admin.events.deleteError"),
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setDeletingEventId(null);
		}
	};

	const handleViewEvent = (event: Event) => {
		setCurrentEvent(event);
		setIsViewEventOpen(true);
	};

	const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const eventData: CreateEventData = {
			name: formData.get("name") as string,
			date: formData.get("date") as string,
			time: formData.get("time") as string,
			location: formData.get("location") as string,
			description: formData.get("description") as string,
			category: formData.get("category") as
				| "community"
				| "health"
				| "education"
				| "sports"
				| "culture"
				| "government",
			organizer: formData.get("organizer") as string,
			contact: formData.get("contact") as string,
			image:
				currentEvent?.image ||
				"https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop",
			featured: formData.get("featured") === "on",
		};

		if (currentEvent) {
			const updateData = {
				...currentEvent,
				...eventData,
				status: formData.get("status") as "active" | "inactive",
			};
			await handleEditEvent(updateData);
		} else {
			await handleAddEvent(eventData);
		}
	};

	if (isLoading) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">{t("admin.loading")}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Update the page header with better styling */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("admin.events.title")}
					</h1>
					<p className="text-muted-foreground mt-2">
						{t("admin.events.description")}
					</p>
				</div>
				<Button
					onClick={() => {
						setIsAddingEvent(true);
						setCurrentEvent(null);
						setIsAddEventOpen(true);
						setTimeout(() => setIsAddingEvent(false), 500); // Reset after dialog opens
					}}
					className="bg-primary hover:bg-primary/90"
					disabled={isAddingEvent}
				>
					{isAddingEvent ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Adding...
						</>
					) : (
						<>
							<Plus className="mr-2 h-4 w-4" />
							{t("admin.events.add")}
						</>
					)}
				</Button>
			</div>

			{/* Update the search and filter section with better styling */}
			<div className="relative flex flex-col md:flex-row gap-4 mb-8 bg-muted/30 p-4 rounded-lg">
				{isFiltering && (
					<div className="absolute top-2 right-2">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
					</div>
				)}
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t("admin.events.searchPlaceholder")}
						className="pl-8 bg-background"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Select value={categoryFilter} onValueChange={setCategoryFilter}>
					<SelectTrigger className="w-[180px] bg-background">
						<SelectValue placeholder={t("admin.events.filterByCategory")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("events.allCategories")}</SelectItem>
						<SelectItem value="community">{t("events.community")}</SelectItem>
						<SelectItem value="health">{t("events.health")}</SelectItem>
						<SelectItem value="education">{t("events.education")}</SelectItem>
						<SelectItem value="sports">{t("events.sports")}</SelectItem>
						<SelectItem value="culture">{t("events.culture")}</SelectItem>
						<SelectItem value="government">{t("events.government")}</SelectItem>
					</SelectContent>
				</Select>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-[180px] bg-background">
						<SelectValue placeholder={t("admin.events.filterByStatus")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t("events.allCategories")}</SelectItem>
						<SelectItem value="active">{t("admin.events.active")}</SelectItem>
						<SelectItem value="inactive">
							{t("admin.events.inactive")}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Update the event cards with better styling */}
			<div className="space-y-4">
				{isFiltering && (
					<div className="flex justify-center py-4">
						<div className="flex items-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
							<span className="text-sm text-muted-foreground">
								{t("admin.filtering")}
							</span>
						</div>
					</div>
				)}
				{filteredEvents.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center p-12">
							<FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-muted-foreground text-center">
								{t("admin.noData")}
							</p>
							<Button
								className="mt-4"
								onClick={() => {
									setIsAddingEvent(true);
									setCurrentEvent(null);
									setIsAddEventOpen(true);
									setTimeout(() => setIsAddingEvent(false), 500); // Reset after dialog opens
								}}
								disabled={isAddingEvent}
							>
								{isAddingEvent ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Adding...
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										{t("admin.events.add")}
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				) : (
					filteredEvents.map((event) => (
						<Card
							key={event.id}
							className="overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="flex flex-col md:flex-row">
								<div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
									<Image
										src={event.image || "/placeholder.svg"}
										alt={event.name}
										fill
										className="object-cover"
									/>
									{event.featured && (
										<div className="absolute top-2 left-2">
											<Badge className="bg-primary">
												{t("admin.events.featured")}
											</Badge>
										</div>
									)}
								</div>
								<div className="flex-1 p-6">
									<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
										<div>
											<h3 className="text-xl font-bold">{event.name}</h3>
											<div className="flex items-center mt-2">
												<Badge variant="outline" className="mr-2">
													{t(`events.${event.category}`)}
												</Badge>
												<Badge
													variant={
														event.status === "active" ? "default" : "secondary"
													}
												>
													{t(`admin.events.${event.status}`)}
												</Badge>
											</div>
											<div className="space-y-1 mt-4">
												<div className="flex items-center text-sm">
													<Calendar className="mr-2 h-4 w-4 text-primary" />
													<span>{formatEventDate(event.date)}</span>
												</div>
												<div className="flex items-center text-sm">
													<Clock className="mr-2 h-4 w-4 text-primary" />
													<span>{event.time}</span>
												</div>
												<div className="flex items-center text-sm">
													<MapPin className="mr-2 h-4 w-4 text-primary" />
													<span>{event.location}</span>
												</div>
											</div>
										</div>
										<div className="flex flex-row md:flex-col gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleViewEvent(event)}
												className="hover:bg-primary/10"
											>
												<Eye className="h-4 w-4 mr-2" />
												{t("admin.view")}
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setCurrentEvent(event);
													setIsAddEventOpen(true);
												}}
												className="hover:bg-primary/10"
											>
												<Edit className="h-4 w-4 mr-2" />
												{t("admin.edit")}
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => {
													setCurrentEvent(event);
													setIsDeleteDialogOpen(true);
												}}
												className="hover:bg-red-500/90"
												disabled={deletingEventId === event.id}
											>
												{deletingEventId === event.id ? (
													<>
														<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
														Deleting...
													</>
												) : (
													<>
														<Trash2 className="h-4 w-4 mr-2" />
														{t("admin.delete")}
													</>
												)}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>
					))
				)}
			</div>

			{/* Add/Edit Event Dialog */}
			<Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>
							{currentEvent ? t("admin.events.edit") : t("admin.events.add")}
						</DialogTitle>
						<DialogDescription>
							{currentEvent
								? t("admin.events.description")
								: t("admin.events.description")}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleFormSubmit}>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<Label htmlFor="name" className="mb-2">
										{t("admin.events.eventName")}
									</Label>
									<Input
										id="name"
										name="name"
										defaultValue={currentEvent?.name || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="date" className="mb-2">
										{t("admin.events.eventDate")}
									</Label>
									<Input
										id="date"
										name="date"
										type="date"
										defaultValue={currentEvent?.date || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="time" className="mb-2">
										{t("admin.events.eventTime")}
									</Label>
									<Input
										id="time"
										name="time"
										defaultValue={currentEvent?.time || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="location" className="mb-2">
										{t("admin.events.eventLocation")}
									</Label>
									<Input
										id="location"
										name="location"
										defaultValue={currentEvent?.location || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="category" className="mb-2">
										{t("admin.events.eventCategory")}
									</Label>
									<Select
										name="category"
										defaultValue={currentEvent?.category || "community"}
									>
										<SelectTrigger id="category">
											<SelectValue placeholder={t("events.category")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="community">
												{t("events.community")}
											</SelectItem>
											<SelectItem value="health">
												{t("events.health")}
											</SelectItem>
											<SelectItem value="education">
												{t("events.education")}
											</SelectItem>
											<SelectItem value="sports">
												{t("events.sports")}
											</SelectItem>
											<SelectItem value="culture">
												{t("events.culture")}
											</SelectItem>
											<SelectItem value="government">
												{t("events.government")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="status" className="mb-2">
										{t("admin.events.status")}
									</Label>
									<Select
										name="status"
										defaultValue={currentEvent?.status || "active"}
									>
										<SelectTrigger id="status">
											<SelectValue placeholder={t("admin.events.status")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">
												{t("admin.events.active")}
											</SelectItem>
											<SelectItem value="inactive">
												{t("admin.events.inactive")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="organizer" className="mb-2">
										{t("admin.events.eventOrganizer")}
									</Label>
									<Input
										id="organizer"
										name="organizer"
										defaultValue={currentEvent?.organizer || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="contact" className="mb-2">
										{t("admin.events.eventContact")}
									</Label>
									<Input
										id="contact"
										name="contact"
										defaultValue={currentEvent?.contact || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="description" className="mb-2">
										{t("admin.events.eventDescription")}
									</Label>
									<Textarea
										id="description"
										name="description"
										rows={4}
										defaultValue={currentEvent?.description || ""}
										required
									/>
								</div>
								<div className="col-span-2 flex items-center space-x-2">
									<input
										type="checkbox"
										id="featured"
										name="featured"
										defaultChecked={currentEvent?.featured || false}
										className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
									/>
									<Label htmlFor="featured">{t("admin.events.featured")}</Label>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddEventOpen(false)}
								disabled={isSubmitting}
							>
								{t("admin.cancel")}
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										{currentEvent ? "Updating..." : "Adding..."}
									</>
								) : currentEvent ? (
									t("admin.save")
								) : (
									t("admin.events.save")
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
							{t("admin.events.confirmDelete")}
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
							onClick={handleDeleteEvent}
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Deleting...
								</>
							) : (
								t("admin.delete")
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Event Dialog */}
			<Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{t("admin.events.view")}</DialogTitle>
					</DialogHeader>
					{currentEvent && (
						<div className="space-y-4">
							<div className="relative h-48 w-full rounded-md overflow-hidden">
								<Image
									src={currentEvent.image || "/placeholder.svg"}
									alt={currentEvent.name}
									fill
									className="object-cover"
								/>
							</div>
							<h2 className="text-2xl font-bold">{currentEvent.name}</h2>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">
									{t(`events.${currentEvent.category}`)}
								</Badge>
								<Badge
									variant={
										currentEvent.status === "active" ? "default" : "secondary"
									}
								>
									{t(`admin.events.${currentEvent.status}`)}
								</Badge>
								{currentEvent.featured && (
									<Badge className="bg-primary">
										{t("admin.events.featured")}
									</Badge>
								)}
							</div>
							<div className="space-y-2">
								<div className="flex items-center">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("events.date")}:</span>
									<span className="ml-2">{formatEventDate(currentEvent.date)}</span>
								</div>
								<div className="flex items-center">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("events.time")}:</span>
									<span className="ml-2">{currentEvent.time}</span>
								</div>
								<div className="flex items-center">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("events.location")}:</span>
									<span className="ml-2">{currentEvent.location}</span>
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-2">
									{t("admin.events.eventDescription")}
								</h3>
								<p className="text-muted-foreground">
									{currentEvent.description}
								</p>
							</div>
							<div className="space-y-2">
								<div>
									<span className="font-medium">{t("events.organizer")}:</span>
									<span className="ml-2">{currentEvent.organizer}</span>
								</div>
								<div>
									<span className="font-medium">{t("events.contact")}:</span>
									<span className="ml-2">{currentEvent.contact}</span>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setIsViewEventOpen(false)}>
							{t("admin.close")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
