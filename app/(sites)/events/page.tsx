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
import { Calendar, Clock, MapPin, Users, Search, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { getAllEventsAction, type Event } from "@/app/actions/events";
import {
	getPublicAnnouncementsAction,
	type Announcement,
} from "@/app/actions/announcements";

export default function EventsPage() {
	const { t } = useLanguage();
	const [activeTab, setActiveTab] = useState("events");
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [announcements, setAnnouncements] = useState<Announcement[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [isLoading, setIsLoading] = useState(true);
	const [isFiltering, setIsFiltering] = useState(false);
	const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

	// Load events and announcements on component mount
	useEffect(() => {
		loadEvents();
		loadAnnouncements();
	}, []);

	// Filter events when search or category changes
	useEffect(() => {
		setIsFiltering(true);
		const timer = setTimeout(() => {
			const filtered = events.filter((event) => {
				const matchesSearch =
					event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					event.description.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesCategory =
					categoryFilter === "all" || event.category === categoryFilter;
				const isActive = event.status === "active";
				return matchesSearch && matchesCategory && isActive;
			});
			setFilteredEvents(filtered);
			setIsFiltering(false);
		}, 300);

		return () => clearTimeout(timer);
	}, [events, searchQuery, categoryFilter]);

	const loadEvents = async () => {
		setIsLoading(true);
		try {
			const result = await getAllEventsAction();
			if (result.success && result.events) {
				setEvents(result.events);
			}
		} catch (error) {
			console.error("Error loading events:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadAnnouncements = async () => {
		setIsLoadingAnnouncements(true);
		try {
			const result = await getPublicAnnouncementsAction();
			if (result.success && result.announcements) {
				setAnnouncements(result.announcements);
			}
		} catch (error) {
			console.error("Error loading announcements:", error);
		} finally {
			setIsLoadingAnnouncements(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatTime = (timeString: string) => {
		// Assuming time is in format "HH:MM - HH:MM"
		return timeString;
	};

	const getCategoryBadgeVariant = (category: string) => {
		switch (category) {
			case "Important":
				return "destructive";
			case "Emergency":
				return "destructive";
			case "Notice":
				return "secondary";
			case "Event":
				return "default";
			default:
				return "outline";
		}
	};

	if (isLoading) {
		return (
			<div className="container py-6 sm:py-10">
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading events...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container py-6 sm:py-10">
			<div className="mb-6 sm:mb-10">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
					{t("events.title")}
				</h1>
				<p className="text-muted-foreground mt-2">{t("events.description")}</p>
			</div>

			<Tabs
				defaultValue="events"
				className="w-full mb-10"
				onValueChange={setActiveTab}
			>
				<TabsList className="flex w-full gap-4 bg-gray-100">
					<TabsTrigger
						value="events"
						className="flex-1 text-[9px] md:text-sm sm:text-base"
					>
						{t("All Events")}
					</TabsTrigger>
					<TabsTrigger
						value="announcements"
						className="flex-1 text-[9px] md:text-sm sm:text-base bg-gray-100 md:bg-transparent py-2.5 md:py-1"
					>
						{t("Announcements")}
					</TabsTrigger>
				</TabsList>

				<div className="relative flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
					{isFiltering && (
						<div className="absolute top-2 right-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
						</div>
					)}
					<div className="relative w-full sm:flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("events.searchEvents")}
							className="pl-8 w-full"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
							<SelectValue placeholder={t("Filter by")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("All Categories")}</SelectItem>
							<SelectItem value="community">{t("Community")}</SelectItem>
							<SelectItem value="health">{t("Health")}</SelectItem>
							<SelectItem value="education">{t("Education")}</SelectItem>
							<SelectItem value="sports">{t("Sports")}</SelectItem>
							<SelectItem value="culture">{t("Culture")}</SelectItem>
							<SelectItem value="government">{t("Government")}</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<TabsContent value="events" className="mt-4 space-y-6">
					{isFiltering && (
						<div className="flex justify-center py-4">
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
								<span className="text-sm text-muted-foreground">
									Filtering...
								</span>
							</div>
						</div>
					)}
					{filteredEvents.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground text-lg">
								{searchQuery || categoryFilter !== "all"
									? t("events.noEventsFound")
									: t("events.noEvents")}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							{filteredEvents.map((event) => (
								<Card
									key={event.id}
									className="overflow-hidden hover:shadow-md transition-all"
								>
									<div className="relative h-40 sm:h-48 w-full">
										<Image
											src={event.image || "/placeholder.svg"}
											alt={event.name}
											fill
											className="object-cover"
										/>
										<div className="absolute top-2 right-2">
											<Badge className="bg-primary">
												{t(`events.${event.category}`)}
											</Badge>
										</div>
										{event.featured && (
											<div className="absolute top-2 left-2">
												<Badge variant="secondary">{t("Featured")}</Badge>
											</div>
										)}
									</div>
									<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
										<CardTitle className="text-lg sm:text-xl">
											{event.name}
										</CardTitle>
										<CardDescription>{event.description}</CardDescription>
									</CardHeader>
									<CardContent className="px-4 sm:px-6 py-0 space-y-2">
										<div className="flex items-center text-sm">
											<Calendar className="mr-2 h-4 w-4 text-primary" />
											<span>
												{t("events.date")}: {formatDate(event.date)}
											</span>
										</div>
										<div className="flex items-center text-sm">
											<Clock className="mr-2 h-4 w-4 text-primary" />
											<span>
												{t("events.time")}: {formatTime(event.time)}
											</span>
										</div>
										<div className="flex items-center text-sm">
											<MapPin className="mr-2 h-4 w-4 text-primary" />
											<span>
												{t("events.location")}: {event.location}
											</span>
										</div>
										<div className="flex items-center text-sm">
											<Users className="mr-2 h-4 w-4 text-primary" />
											<span>
												{t("events.organizer")}: {event.organizer}
											</span>
										</div>
									</CardContent>
									<CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full px-4 sm:px-6 py-3 sm:py-4">
										<Button
											variant="outline"
											size="sm"
											className="w-full sm:w-auto"
										>
											{t("events.register")}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="w-full sm:w-auto"
										>
											<Share2 className="h-4 w-4 mr-2" />
											{t("events.shareEvent")}
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="announcements" className="mt-4 space-y-6">
					{isLoadingAnnouncements ? (
						<div className="flex justify-center py-8">
							<div className="flex items-center space-x-2">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
								<span className="text-muted-foreground">
									Loading announcements...
								</span>
							</div>
						</div>
					) : announcements.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground text-lg">
								No announcements available at the moment.
							</p>
						</div>
					) : (
						announcements.map((announcement) => (
							<Card
								key={announcement.id}
								className="hover:shadow-md transition-all"
							>
								<CardHeader className="px-4 sm:px-6 py-4">
									<div className="flex justify-between items-start">
										<div>
											<CardTitle className="text-lg sm:text-xl">
												{announcement.title}
											</CardTitle>
											<CardDescription>
												{t("events.postedOn")}:{" "}
												{formatDate(announcement.publishedOn)}
											</CardDescription>
										</div>
										<Badge
											variant={getCategoryBadgeVariant(announcement.category)}
										>
											{announcement.category}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="px-4 sm:px-6 py-2">
									<p className="text-sm text-muted-foreground">
										{announcement.description}
									</p>
								</CardContent>
								<CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
									<Button
										variant="outline"
										size="sm"
										className="w-full sm:w-auto"
									>
										{t("events.readMore")}
									</Button>
								</CardFooter>
							</Card>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
