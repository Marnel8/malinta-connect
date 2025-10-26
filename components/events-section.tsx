"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChevronRight, Calendar, Megaphone, Users } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useEffect, useState } from "react";
import { getAllEventsAction, Event } from "@/app/actions/events";

export function EventsSection() {
	const { t } = useLanguage();
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setLoading(true);
				const result = await getAllEventsAction();

				if (result.success && result.events) {
					// Filter for active events and limit to 3 for display
					const activeEvents = result.events
						.filter((event) => event.status === "active")
						.slice(0, 3);
					setEvents(activeEvents);
				} else {
					setError(result.error || "Failed to fetch events");
				}
			} catch (err) {
				setError("An error occurred while fetching events");
				console.error("Error fetching events:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	if (loading) {
		return (
			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
						<div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{t("home.events.title")}
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
							{t("home.events.subtitle")}
						</h2>
						<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
							{t("home.events.description")}
						</p>
					</div>

					<div className="flex justify-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
					</div>
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
						<div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
							{t("home.events.title")}
						</div>
						<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
							{t("home.events.subtitle")}
						</h2>
						<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
							{t("home.events.description")}
						</p>
					</div>

					<div className="text-center text-muted-foreground">
						<p>Unable to load events at this time. Please try again later.</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
			<div className="container px-4 md:px-6">
				<div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
					<div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
						{t("home.events.title")}
					</div>
					<h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
						{t("home.events.subtitle")}
					</h2>
					<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
						{t("home.events.description")}
					</p>
				</div>

				{events.length > 0 ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
							{events.map((event) => {
								// Get category-specific image and color
								const getCategoryInfo = (category: string) => {
									const categoryMap: Record<string, { image: string; color: string; bgColor: string }> = {
										community: {
											image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1170&auto=format&fit=crop",
											color: "text-green-600",
											bgColor: "bg-green-50 dark:bg-green-950/20"
										},
										health: {
											image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=1170&auto=format&fit=crop",
											color: "text-blue-600",
											bgColor: "bg-blue-50 dark:bg-blue-950/20"
										},
										education: {
											image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1170&auto=format&fit=crop",
											color: "text-purple-600",
											bgColor: "bg-purple-50 dark:bg-purple-950/20"
										},
										sports: {
											image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1170&auto=format&fit=crop",
											color: "text-orange-600",
											bgColor: "bg-orange-50 dark:bg-orange-950/20"
										},
										culture: {
											image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop",
											color: "text-red-600",
											bgColor: "bg-red-50 dark:bg-red-950/20"
										},
										government: {
											image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1170&auto=format&fit=crop",
											color: "text-indigo-600",
											bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
										}
									};
									return categoryMap[category] || categoryMap.community;
								};

								const categoryInfo = getCategoryInfo(event.category);
								const eventDate = new Date(event.date);
								const isUpcoming = eventDate >= new Date();

								return (
									<Card
										key={event.id}
										className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-card/50 backdrop-blur-sm"
									>
										<div className="relative h-56 w-full overflow-hidden">
											<Image
												src={event.image || categoryInfo.image}
												alt={event.name}
												fill
												className="object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
											
											{/* Date Badge */}
											<div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg">
												{eventDate.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</div>

											{/* Category Badge */}
											<div className={`absolute top-4 left-4 ${categoryInfo.bgColor} ${categoryInfo.color} text-xs font-medium px-2.5 py-1 rounded-full border border-current/20`}>
												{event.category.charAt(0).toUpperCase() + event.category.slice(1)}
											</div>

											{/* Featured Badge */}
											{event.featured && (
												<div className="absolute bottom-4 left-4 bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
													Featured
												</div>
											)}
										</div>

										<CardHeader className="pb-3">
											<CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
												{event.name}
											</CardTitle>
											<CardDescription className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
												{event.description}
											</CardDescription>
										</CardHeader>

										<CardContent className="pt-0 pb-4">
											<div className="space-y-3">
												<div className="flex items-center text-sm text-muted-foreground">
													<Calendar className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
													<span className="font-medium">{event.time}</span>
												</div>
												<div className="flex items-center text-sm text-muted-foreground">
													<svg className="mr-2 h-4 w-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
													<span className="line-clamp-1">{event.location}</span>
												</div>
												{event.organizer && (
													<div className="flex items-center text-sm text-muted-foreground">
														<Users className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
														<span className="line-clamp-1">{event.organizer}</span>
													</div>
												)}
											</div>
										</CardContent>

										<CardFooter className="pt-0">
											<Button
												variant="outline"
												size="sm"
												className="w-full group/btn border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
												asChild
											>
												<Link href="/events">
													<span className="flex items-center justify-center">
														<Megaphone className="mr-2 h-4 w-4" />
														{t("events.viewMore")}
														<ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
													</span>
												</Link>
											</Button>
										</CardFooter>
									</Card>
								);
							})}
						</div>

						<div className="flex justify-center">
							<Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
								<Link href="/events">
									{t("home.events.viewAll")}
									<ChevronRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</>
				) : (
					<div className="text-center py-16">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
								<Calendar className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
							<p className="text-muted-foreground mb-6">
								Check back soon for exciting community events and activities!
							</p>
							<Button asChild variant="outline">
								<Link href="/events">
									View All Events
									<ChevronRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
