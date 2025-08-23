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
import { ChevronRight, Calendar, Megaphone } from "lucide-react";
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

				{events.length > 0 ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
							{events.map((event) => (
								<Card
									key={event.id}
									className="overflow-hidden hover:shadow-md transition-all"
								>
									<div className="relative h-48 w-full">
										<Image
											src={
												event.image ||
												"https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop"
											}
											alt={event.name}
											fill
											className="object-cover"
										/>
										<div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
											{new Date(event.date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</div>
									</div>
									<CardHeader>
										<CardTitle>{event.name}</CardTitle>
										<CardDescription>{event.description}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex items-center text-sm">
											<Calendar className="mr-2 h-4 w-4 text-primary" />
											<span>
												{event.time} @ {event.location}
											</span>
										</div>
									</CardContent>
									<CardFooter>
										<Button
											variant="outline"
											size="sm"
											className="w-full group"
											asChild
										>
											<Link href="/events">
												<span className="flex items-center">
													<Megaphone className="mr-2 h-4 w-4" />
													{t("events.viewMore")}
													<ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
												</span>
											</Link>
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>

						<div className="flex justify-center">
							<Button asChild size="lg">
								<Link href="/events">
									{t("home.events.viewAll")}
									<ChevronRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</>
				) : (
					<div className="text-center text-muted-foreground mb-10">
						<p>No upcoming events at the moment. Check back soon!</p>
					</div>
				)}
			</div>
		</section>
	);
}
