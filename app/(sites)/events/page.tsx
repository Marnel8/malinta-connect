"use client";

import { useState } from "react";
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

export default function EventsPage() {
	const { t } = useLanguage();
	const [activeTab, setActiveTab] = useState("events");

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
						{t("events.allEvents")}
					</TabsTrigger>
					<TabsTrigger
						value="announcements"
						className="flex-1 text-[9px] md:text-sm sm:text-base bg-gray-100 md:bg-transparent py-2.5 md:py-1"
					>
						{t("events.announcements")}
					</TabsTrigger>
				</TabsList>

				<div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
					<div className="relative w-full sm:flex-1">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder={t("events.searchEvents")}
							className="pl-8 w-full"
						/>
					</div>
					<Select defaultValue="all">
						<SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
							<SelectValue placeholder={t("events.filterBy")} />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">{t("events.allCategories")}</SelectItem>
							<SelectItem value="community">{t("events.community")}</SelectItem>
							<SelectItem value="health">{t("events.health")}</SelectItem>
							<SelectItem value="education">{t("events.education")}</SelectItem>
							<SelectItem value="sports">{t("events.sports")}</SelectItem>
							<SelectItem value="culture">{t("events.culture")}</SelectItem>
							<SelectItem value="government">
								{t("events.government")}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<TabsContent value="events" className="mt-4 space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<Card className="overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop"
									alt="Community Clean-up Drive"
									fill
									className="object-cover"
								/>
								<div className="absolute top-2 right-2">
									<Badge className="bg-primary">{t("events.community")}</Badge>
								</div>
							</div>
							<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
								<CardTitle className="text-lg sm:text-xl">
									Barangay Clean-up Drive
								</CardTitle>
								<CardDescription>
									Join us for our monthly community clean-up initiative
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 py-0 space-y-2">
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.date")}: May 15, 2025</span>
								</div>
								<div className="flex items-center text-sm">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.time")}: 7:00 AM - 11:00 AM</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.location")}: Barangay Plaza</span>
								</div>
								<div className="flex items-center text-sm">
									<Users className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.organizer")}: Environmental Committee</span>
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
								<Button variant="ghost" size="sm" className="w-full sm:w-auto">
									<Share2 className="h-4 w-4 mr-2" />
									{t("events.shareEvent")}
								</Button>
							</CardFooter>
						</Card>

						<Card className="overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1170&auto=format&fit=crop"
									alt="Health Seminar"
									fill
									className="object-cover"
								/>
								<div className="absolute top-2 right-2">
									<Badge className="bg-red-500">{t("events.health")}</Badge>
								</div>
							</div>
							<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
								<CardTitle className="text-lg sm:text-xl">
									Free Health Seminar and Check-up
								</CardTitle>
								<CardDescription>
									Learn about preventive healthcare and get a free check-up
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 py-0 space-y-2">
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.date")}: May 20, 2025</span>
								</div>
								<div className="flex items-center text-sm">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.time")}: 9:00 AM - 3:00 PM</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.location")}: Barangay Health Center</span>
								</div>
								<div className="flex items-center text-sm">
									<Users className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.organizer")}: Health Committee</span>
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
								<Button variant="ghost" size="sm" className="w-full sm:w-auto">
									<Share2 className="h-4 w-4 mr-2" />
									{t("events.shareEvent")}
								</Button>
							</CardFooter>
						</Card>

						<Card className="overflow-hidden hover:shadow-md transition-all">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1540479859555-17af45c78602?q=80&w=1170&auto=format&fit=crop"
									alt="Basketball Tournament"
									fill
									className="object-cover"
								/>
								<div className="absolute top-2 right-2">
									<Badge className="bg-orange-500">{t("events.sports")}</Badge>
								</div>
							</div>
							<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
								<CardTitle className="text-lg sm:text-xl">
									Barangay Basketball Tournament
								</CardTitle>
								<CardDescription>
									Annual basketball competition for all age groups
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 py-0 space-y-2">
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.date")}: June 1-15, 2025</span>
								</div>
								<div className="flex items-center text-sm">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.time")}: 3:00 PM - 8:00 PM</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.location")}: Barangay Basketball Court</span>
								</div>
								<div className="flex items-center text-sm">
									<Users className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.organizer")}: Sports Committee</span>
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
								<Button variant="ghost" size="sm" className="w-full sm:w-auto">
									<Share2 className="h-4 w-4 mr-2" />
									{t("events.shareEvent")}
								</Button>
							</CardFooter>
						</Card>

						<Card className="overflow-hidden hover:shadow-md transition-all opacity-75">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1551972873-b7e8754e8e26?q=80&w=1170&auto=format&fit=crop"
									alt="Barangay Fiesta"
									fill
									className="object-cover grayscale"
								/>
								<div className="absolute top-2 right-2">
									<Badge className="bg-purple-500">{t("events.culture")}</Badge>
								</div>
								<div className="absolute top-2 left-2">
									<Badge variant="secondary">Past</Badge>
								</div>
							</div>
							<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
								<CardTitle className="text-lg sm:text-xl">
									Barangay Fiesta Celebration
								</CardTitle>
								<CardDescription>
									Annual celebration of our barangay's patron saint
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 py-0 space-y-2">
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.date")}: March 15, 2025</span>
								</div>
								<div className="flex items-center text-sm">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.time")}: All Day</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.location")}: Barangay Plaza</span>
								</div>
							</CardContent>
							<CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full px-4 sm:px-6 py-3 sm:py-4">
								<Button
									variant="outline"
									size="sm"
									className="w-full sm:w-auto"
								>
									{t("events.viewMore")}
								</Button>
							</CardFooter>
						</Card>

						<Card className="overflow-hidden hover:shadow-md transition-all opacity-75">
							<div className="relative h-40 sm:h-48 w-full">
								<Image
									src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1170&auto=format&fit=crop"
									alt="Vaccination Drive"
									fill
									className="object-cover grayscale"
								/>
								<div className="absolute top-2 right-2">
									<Badge className="bg-red-500">{t("events.health")}</Badge>
								</div>
								<div className="absolute top-2 left-2">
									<Badge variant="secondary">Past</Badge>
								</div>
							</div>
							<CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
								<CardTitle className="text-lg sm:text-xl">
									COVID-19 Vaccination Drive
								</CardTitle>
								<CardDescription>
									Free vaccination for all barangay residents
								</CardDescription>
							</CardHeader>
							<CardContent className="px-4 sm:px-6 py-0 space-y-2">
								<div className="flex items-center text-sm">
									<Calendar className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.date")}: February 10, 2025</span>
								</div>
								<div className="flex items-center text-sm">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.time")}: 8:00 AM - 5:00 PM</span>
								</div>
								<div className="flex items-center text-sm">
									<MapPin className="mr-2 h-4 w-4 text-primary" />
									<span>{t("events.location")}: Barangay Health Center</span>
								</div>
							</CardContent>
							<CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between w-full px-4 sm:px-6 py-3 sm:py-4">
								<Button
									variant="outline"
									size="sm"
									className="w-full sm:w-auto"
								>
									{t("events.viewMore")}
								</Button>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="announcements" className="mt-4 space-y-6">
					<Card className="hover:shadow-md transition-all">
						<CardHeader className="px-4 sm:px-6 py-4">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg sm:text-xl">
										Water Service Interruption Notice
									</CardTitle>
									<CardDescription>
										{t("events.postedOn")}: April 25, 2025
									</CardDescription>
								</div>
								<Badge>Important</Badge>
							</div>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 py-2">
							<p className="text-sm text-muted-foreground">
								Please be informed that there will be a scheduled water service
								interruption on May 2, 2025, from 10:00 PM to 5:00 AM the
								following day. This is due to maintenance work on the main water
								lines. We advise all residents to store enough water for their
								needs during this period.
							</p>
						</CardContent>
						<CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
							<Button variant="outline" size="sm" className="w-full sm:w-auto">
								{t("events.readMore")}
							</Button>
						</CardFooter>
					</Card>

					<Card className="hover:shadow-md transition-all">
						<CardHeader className="px-4 sm:px-6 py-4">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg sm:text-xl">
										New Garbage Collection Schedule
									</CardTitle>
									<CardDescription>
										{t("events.postedOn")}: April 20, 2025
									</CardDescription>
								</div>
								<Badge variant="outline">Notice</Badge>
							</div>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 py-2">
							<p className="text-sm text-muted-foreground">
								Starting May 1, 2025, we will implement a new garbage collection
								schedule. Biodegradable waste will be collected on Mondays and
								Thursdays, while non-biodegradable waste will be collected on
								Tuesdays and Fridays. Please ensure proper segregation of your
								waste.
							</p>
						</CardContent>
						<CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
							<Button variant="outline" size="sm" className="w-full sm:w-auto">
								{t("events.readMore")}
							</Button>
						</CardFooter>
					</Card>

					<Card className="hover:shadow-md transition-all">
						<CardHeader className="px-4 sm:px-6 py-4">
							<div className="flex justify-between items-start">
								<div>
									<CardTitle className="text-lg sm:text-xl">
										Barangay ID Renewal Period
									</CardTitle>
									<CardDescription>
										{t("events.postedOn")}: April 15, 2025
									</CardDescription>
								</div>
								<Badge variant="outline">Notice</Badge>
							</div>
						</CardHeader>
						<CardContent className="px-4 sm:px-6 py-2">
							<p className="text-sm text-muted-foreground">
								The annual Barangay ID renewal period will be from May 1 to June
								30, 2025. Residents can visit the Barangay Hall from Monday to
								Friday, 8:00 AM to 5:00 PM, to renew their IDs. Please bring
								your old Barangay ID and proof of residency.
							</p>
						</CardContent>
						<CardFooter className="px-4 sm:px-6 py-3 sm:py-4">
							<Button variant="outline" size="sm" className="w-full sm:w-auto">
								{t("events.readMore")}
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
