"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	FileText,
	Calendar,
	MessageSquare,
	Users,
	Clock,
	CheckCircle,
	AlertCircle,
	Search,
	Filter,
	Download,
	TrendingUp,
	TrendingDown,
	Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import {
	getDashboardStats,
	getRecentCertificateRequests,
	getRecentAppointments,
	getRecentBlotterCases,
	getUserDisplayName,
} from "@/app/actions/admin-dashboard";
import { useEffect, useState } from "react";
import {
	DashboardStats,
	CertificateRequest,
	AppointmentItem,
	BlotterItem,
} from "@/app/actions/admin-dashboard";

export default function AdminDashboardPage() {
	const { t } = useLanguage();
	const { userProfile } = useAuth();
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null
	);
	const [certificateRequests, setCertificateRequests] = useState<
		CertificateRequest[]
	>([]);
	const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
	const [blotterCases, setBlotterCases] = useState<BlotterItem[]>([]);
	const [loading, setLoading] = useState(true);

	// Check if user has any admin permissions
	const hasAdminAccess =
		userProfile?.role === "admin" ||
		userProfile?.permissions?.canManageUsers ||
		userProfile?.permissions?.canManageEvents ||
		userProfile?.permissions?.canManageCertificates ||
		userProfile?.permissions?.canManageAppointments ||
		userProfile?.permissions?.canManageBlotter ||
		userProfile?.permissions?.canManageOfficials ||
		userProfile?.permissions?.canManageResidents ||
		userProfile?.permissions?.canViewAnalytics ||
		userProfile?.permissions?.canManageSettings ||
		userProfile?.permissions?.canManageAnnouncements;

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async () => {
			if (!hasAdminAccess) return;

			try {
				setLoading(true);
				const [stats, certs, apts, blotter] = await Promise.all([
					getDashboardStats(),
					getRecentCertificateRequests(5),
					getRecentAppointments(5),
					getRecentBlotterCases(5),
				]);

				setDashboardStats(stats);
				setCertificateRequests(certs);
				setAppointments(apts);
				setBlotterCases(blotter);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [hasAdminAccess]);

	// If no admin access, show access denied
	if (!hasAdminAccess) {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="flex items-center justify-center py-16">
						<div className="text-center">
							<div className="h-12 w-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
								<Users className="h-12 w-12" />
							</div>
							<h3 className="text-lg font-semibold">Access Denied</h3>
							<p className="text-muted-foreground">
								You don't have permission to access the admin dashboard.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
					<p className="text-muted-foreground mt-2">
						Welcome back,{" "}
						{userProfile?.firstName || userProfile?.email || "Admin"}. Here's
						what's happening in your barangay.
					</p>
				</div>
				{(userProfile?.role === "admin" ||
					userProfile?.permissions?.canViewAnalytics) && (
					<div className="flex items-center gap-2">
						<Button variant="outline">
							<Download className="mr-2 h-4 w-4" />
							Export Data
						</Button>
						<Button>
							<Filter className="mr-2 h-4 w-4" />
							Filter
						</Button>
					</div>
				)}
			</div>


			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{(userProfile?.role === "admin" ||
					userProfile?.permissions?.canManageCertificates) && (
					<Card className="border-l-4 border-l-blue-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Pending Certificates
							</CardTitle>
							<FileText className="h-4 w-4 text-blue-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{loading ? "..." : dashboardStats?.pendingCertificates || 0}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{dashboardStats?.certificatesChange !== undefined && (
									<>
										{dashboardStats.certificatesChange >= 0 ? (
											<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
										) : (
											<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
										)}
										<span>
											{dashboardStats.certificatesChange >= 0 ? "+" : ""}
											{dashboardStats.certificatesChange}% vs. last month
										</span>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				)}
				{(userProfile?.role === "admin" ||
					userProfile?.permissions?.canManageAppointments) && (
					<Card className="border-l-4 border-l-green-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Upcoming Appointments
							</CardTitle>
							<Calendar className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{loading ? "..." : dashboardStats?.upcomingAppointments || 0}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{dashboardStats?.appointmentsChange !== undefined && (
									<>
										{dashboardStats.appointmentsChange >= 0 ? (
											<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
										) : (
											<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
										)}
										<span>
											{dashboardStats.appointmentsChange >= 0 ? "+" : ""}
											{dashboardStats.appointmentsChange}% vs. last month
										</span>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				)}
				{(userProfile?.role === "admin" ||
					userProfile?.permissions?.canManageBlotter) && (
					<Card className="border-l-4 border-l-red-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Active Blotter Cases
							</CardTitle>
							<MessageSquare className="h-4 w-4 text-red-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{loading ? "..." : dashboardStats?.activeBlotterCases || 0}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{dashboardStats?.blotterChange !== undefined && (
									<>
										{dashboardStats.blotterChange >= 0 ? (
											<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
										) : (
											<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
										)}
										<span>
											{dashboardStats.blotterChange >= 0 ? "+" : ""}
											{dashboardStats.blotterChange}% vs. last month
										</span>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				)}
				{(userProfile?.role === "admin" ||
					userProfile?.permissions?.canManageResidents) && (
					<Card className="border-l-4 border-l-purple-500">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Registered Residents
							</CardTitle>
							<Users className="h-4 w-4 text-purple-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{loading ? "..." : dashboardStats?.registeredResidents || 0}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								{dashboardStats?.residentsChange !== undefined && (
									<>
										{dashboardStats.residentsChange >= 0 ? (
											<TrendingUp className="mr-1 h-3 w-3 text-green-500" />
										) : (
											<TrendingDown className="mr-1 h-3 w-3 text-red-500" />
										)}
										<span>
											{dashboardStats.residentsChange >= 0 ? "+" : ""}
											{dashboardStats.residentsChange}% vs. last month
										</span>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Main Dashboard Content */}
			{(userProfile?.role === "admin" ||
				userProfile?.permissions?.canManageCertificates ||
				userProfile?.permissions?.canManageAppointments ||
				userProfile?.permissions?.canManageBlotter) && (
				<Tabs defaultValue="certificates" className="w-full">
					<TabsList
						className={`grid w-full mb-8 rounded-lg bg-muted/50 p-1 ${
							[
								userProfile?.role === "admin" ||
									userProfile?.permissions?.canManageCertificates,
								userProfile?.role === "admin" ||
									userProfile?.permissions?.canManageAppointments,
								userProfile?.role === "admin" ||
									userProfile?.permissions?.canManageBlotter,
							].filter(Boolean).length === 1
								? "grid-cols-1"
								: [
										userProfile?.role === "admin" ||
											userProfile?.permissions?.canManageCertificates,
										userProfile?.role === "admin" ||
											userProfile?.permissions?.canManageAppointments,
										userProfile?.role === "admin" ||
											userProfile?.permissions?.canManageBlotter,
								  ].filter(Boolean).length === 2
								? "grid-cols-2"
								: "grid-cols-3"
						}`}
					>
						{(userProfile?.role === "admin" ||
							userProfile?.permissions?.canManageCertificates) && (
							<TabsTrigger
								value="certificates"
								className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
							>
								Certificate Requests
							</TabsTrigger>
						)}
						{(userProfile?.role === "admin" ||
							userProfile?.permissions?.canManageAppointments) && (
							<TabsTrigger
								value="appointments"
								className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
							>
								Appointments
							</TabsTrigger>
						)}
						{(userProfile?.role === "admin" ||
							userProfile?.permissions?.canManageBlotter) && (
							<TabsTrigger
								value="blotter"
								className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
							>
								Blotter Reports
							</TabsTrigger>
						)}
					</TabsList>

					{(userProfile?.role === "admin" ||
						userProfile?.permissions?.canManageCertificates) && (
						<TabsContent value="certificates">
							<Card>
								<CardHeader>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div>
											<CardTitle>Certificate Requests</CardTitle>
											<CardDescription>
												Manage and process certificate requests from residents.
											</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											<div className="relative">
												<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<input
													type="search"
													placeholder="Search requests..."
													className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												/>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{loading ? (
											<div className="text-center py-8">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
												<p className="text-muted-foreground mt-2">
													Loading certificate requests...
												</p>
											</div>
										) : certificateRequests.length === 0 ? (
											<div className="text-center py-8">
												<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													No certificate requests found
												</p>
											</div>
										) : (
											certificateRequests.map((cert) => (
												<div key={cert.id} className="rounded-lg border p-4">
													<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
														<div>
															<div className="flex items-center">
																<FileText className="mr-2 h-5 w-5 text-primary" />
																<h3 className="font-medium">{cert.type}</h3>
																{cert.status === "pending" && (
																	<Badge variant="outline" className="ml-2">
																		New
																	</Badge>
																)}
															</div>
															<p className="text-sm text-muted-foreground mt-1">
																Requested by: {cert.requestedBy}
															</p>
															<p className="text-sm text-muted-foreground">
																Requested on:{" "}
																{new Date(
																	cert.requestedOn
																).toLocaleDateString()}
															</p>
															{/* <p className="text-sm">
																Reference #: {cert.referenceNumber}
															</p> */}
														</div>
														<div className="flex flex-col md:items-end gap-2">
															<span
																className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
																	cert.status === "pending"
																		? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
																		: cert.status === "processing"
																		? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																		: cert.status === "additional_info_required"
																		? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
																		: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
																}`}
															>
																{cert.status === "pending" && (
																	<Clock className="mr-1 h-3 w-3" />
																)}
																{cert.status === "processing" && (
																	<Activity className="mr-1 h-3 w-3" />
																)}
																{cert.status === "additional_info_required" && (
																	<AlertCircle className="mr-1 h-3 w-3" />
																)}
																{cert.status === "completed" && (
																	<CheckCircle className="mr-1 h-3 w-3" />
																)}
																{cert.status === "rejected" && (
																	<AlertCircle className="mr-1 h-3 w-3" />
																)}
																{cert.status
																	.replace(/_/g, " ")
																	.replace(/\b\w/g, (l) => l.toUpperCase())}
															</span>
															<div className="flex gap-2">
																{cert.status === "pending" && (
																	<Button size="sm">Process</Button>
																)}
																{cert.status === "processing" && (
																	<Button size="sm">Complete</Button>
																)}
																{cert.status === "additional_info_required" && (
																	<Button size="sm" variant="outline">
																		Request Info
																	</Button>
																)}
																<Button size="sm" variant="outline">
																	View Details
																</Button>
															</div>
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					)}

					{(userProfile?.role === "admin" ||
						userProfile?.permissions?.canManageAppointments) && (
						<TabsContent value="appointments">
							<Card>
								<CardHeader>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div>
											<CardTitle>Appointment Schedule</CardTitle>
											<CardDescription>
												Manage upcoming appointments with residents.
											</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											<div className="relative">
												<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<input
													type="search"
													placeholder="Search appointments..."
													className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												/>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{loading ? (
											<div className="text-center py-8">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
												<p className="text-muted-foreground mt-2">
													Loading appointments...
												</p>
											</div>
										) : appointments.length === 0 ? (
											<div className="text-center py-8">
												<Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													No appointments found
												</p>
											</div>
										) : (
											appointments.map((apt) => (
												<div
													key={apt.id}
													className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950/20"
												>
													<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
														<div>
															<div className="flex items-center">
																<Calendar className="mr-2 h-5 w-5 text-primary" />
																<h3 className="font-medium">{apt.type}</h3>
																{new Date(apt.scheduledDate).toDateString() ===
																	new Date().toDateString() && (
																	<Badge variant="outline" className="ml-2">
																		Today
																	</Badge>
																)}
															</div>
															<p className="text-sm text-muted-foreground mt-1">
																Resident: {apt.residentName}
															</p>
															<p className="text-sm text-muted-foreground">
																Schedule:{" "}
																{new Date(
																	apt.scheduledDate
																).toLocaleDateString()}{" "}
																at {apt.timeSlot}
															</p>
														</div>
														<div className="flex flex-col md:items-end gap-2">
															<span
																className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
																	apt.status === "scheduled"
																		? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
																		: apt.status === "completed"
																		? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																		: apt.status === "cancelled"
																		? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
																		: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
																}`}
															>
																{apt.status === "scheduled" && (
																	<Clock className="mr-1 h-3 w-3" />
																)}
																{apt.status === "completed" && (
																	<CheckCircle className="mr-1 h-3 w-3" />
																)}
																{apt.status === "cancelled" && (
																	<AlertCircle className="mr-1 h-3 w-3" />
																)}
																{apt.status.replace(/\b\w/g, (l) =>
																	l.toUpperCase()
																)}
															</span>
															<div className="flex gap-2">
																{apt.status === "scheduled" && (
																	<>
																		<Button size="sm">Complete</Button>
																		<Button size="sm" variant="outline">
																			Reschedule
																		</Button>
																	</>
																)}
																<Button size="sm" variant="outline">
																	View Details
																</Button>
															</div>
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					)}

					{(userProfile?.role === "admin" ||
						userProfile?.permissions?.canManageBlotter) && (
						<TabsContent value="blotter">
							<Card>
								<CardHeader>
									<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
										<div>
											<CardTitle>Blotter Reports</CardTitle>
											<CardDescription>
												Manage and investigate incident reports.
											</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											<div className="relative">
												<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
												<input
													type="search"
													placeholder="Search reports..."
													className="pl-8 h-9 w-[250px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
												/>
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{loading ? (
											<div className="text-center py-8">
												<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
												<p className="text-muted-foreground mt-2">
													Loading blotter cases...
												</p>
											</div>
										) : blotterCases.length === 0 ? (
											<div className="text-center py-8">
												<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
												<p className="text-muted-foreground">
													No blotter cases found
												</p>
											</div>
										) : (
											blotterCases.map((blotter) => (
												<div key={blotter.id} className="rounded-lg border p-4">
													<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
														<div>
															<div className="flex items-center">
																<MessageSquare className="mr-2 h-5 w-5 text-primary" />
																<h3 className="font-medium">
																	{blotter.caseType}
																</h3>
																{blotter.status === "active" && (
																	<Badge variant="outline" className="ml-2">
																		New
																	</Badge>
																)}
															</div>
															<p className="text-sm text-muted-foreground mt-1">
																Reported by: {blotter.complainant}
															</p>
															<p className="text-sm text-muted-foreground">
																Filed on:{" "}
																{new Date(
																	blotter.incidentDate
																).toLocaleDateString()}
															</p>
															<p className="text-sm">
																Case #: {blotter.caseNumber}
															</p>
														</div>
														<div className="flex flex-col md:items-end gap-2">
															<span
																className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
																	blotter.status === "active"
																		? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
																		: blotter.status === "pending"
																		? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																		: blotter.status === "resolved"
																		? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																		: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
																}`}
															>
																{blotter.status === "active" && (
																	<Clock className="mr-1 h-3 w-3" />
																)}
																{blotter.status === "pending" && (
																	<Activity className="mr-1 h-3 w-3" />
																)}
																{blotter.status === "resolved" && (
																	<CheckCircle className="mr-1 h-3 w-3" />
																)}
																{blotter.status.replace(/\b\w/g, (l) =>
																	l.toUpperCase()
																)}
															</span>
															<div className="flex gap-2">
																{blotter.status === "active" && (
																	<Button size="sm">Start Investigation</Button>
																)}
																{blotter.status === "pending" && (
																	<Button size="sm">Update Status</Button>
																)}
																<Button size="sm" variant="outline">
																	View Details
																</Button>
															</div>
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					)}
				</Tabs>
			)}

			{/* Analytics Section */}
			{(userProfile?.role === "admin" ||
				userProfile?.permissions?.canViewAnalytics) && (
				<div className="mt-6">
					<h2 className="text-2xl font-bold tracking-tight mb-6">
						Analytics Overview
					</h2>
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Service Requests by Type</CardTitle>
								<CardDescription>
									Distribution of service requests for the current month
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="relative h-80 w-full">
									<Image
										src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1170&auto=format&fit=crop"
										alt="Analytics Chart"
										fill
										className="object-contain"
									/>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Request Processing Time</CardTitle>
								<CardDescription>
									Average time to process different types of requests
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="relative h-80 w-full">
									<Image
										src="https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1170&auto=format&fit=crop"
										alt="Analytics Chart"
										fill
										className="object-contain"
									/>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</div>
	);
}
