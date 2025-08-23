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
import {
	Search,
	FileText,
	Clock,
	CheckCircle,
	AlertCircle,
	Loader2,
	Plus,
	MoreHorizontal,
	Trash2,
	Download,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import {
	getAllCertificatesAction,
	getCertificatesByStatusAction,
	searchCertificatesAction,
	updateCertificateStatusAction,
	deleteCertificateAction,
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificateGeneratorModal } from "@/components/admin/certificate-generator-modal";

export default function AdminCertificatesPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [certificates, setCertificates] = useState<Certificate[]>([]);
	const [filteredCertificates, setFilteredCertificates] = useState<
		Certificate[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	// Separate loading states for different operations
	const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
	const [deletingStatus, setDeletingStatus] = useState<string | null>(null);
	const [rejectingStatus, setRejectingStatus] = useState<string | null>(null);
	const [requestingInfoStatus, setRequestingInfoStatus] = useState<
		string | null
	>(null);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [selectedCertificate, setSelectedCertificate] =
		useState<Certificate | null>(null);
	const [rejectReason, setRejectReason] = useState("");
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [requestInfoDialogOpen, setRequestInfoDialogOpen] = useState(false);
	const [additionalInfoRequest, setAdditionalInfoRequest] = useState("");
	const [generateCertDialogOpen, setGenerateCertDialogOpen] = useState(false);

	// Fetch certificates on component mount
	useEffect(() => {
		fetchCertificates();
		// Temporarily disable email system check to avoid build issues
		// checkEmailSystemStatus();
	}, []);

	// Filter certificates when search query or status filter changes
	useEffect(() => {
		let filtered = certificates;

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((cert) => cert.status === statusFilter);
		}

		// Apply search filter
		if (searchQuery.trim()) {
			filtered = filtered.filter(
				(cert) =>
					cert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
					cert.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
					cert.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
					cert.id.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		setFilteredCertificates(filtered);
	}, [certificates, searchQuery, statusFilter]);

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
			console.error("Error fetching certificates:", error);
			toast({
				title: "Error",
				description: "Failed to fetch certificates",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			await fetchCertificates();
			return;
		}

		try {
			setLoading(true);
			const result = await searchCertificatesAction(searchQuery);

			if (result.success && result.certificates) {
				setFilteredCertificates(result.certificates);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to search certificates",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to search certificates",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleStatusFilter = async (status: string) => {
		setStatusFilter(status);

		if (status === "all") {
			await fetchCertificates();
			return;
		}

		try {
			setLoading(true);
			const result = await getCertificatesByStatusAction(
				status as Certificate["status"]
			);

			if (result.success && result.certificates) {
				setFilteredCertificates(result.certificates);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to filter certificates",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to filter certificates",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (
		id: string,
		newStatus: Certificate["status"]
	) => {
		setUpdatingStatus(id);

		try {
			let additionalData = {};

			if (newStatus === "completed") {
				additionalData = {
					completedOn: new Date().toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					}),
				};
			}

			const result = await updateCertificateStatusAction(
				id,
				newStatus,
				additionalData
			);

			if (result.success) {
				toast({
					title: "Success",
					description: `Certificate status updated to ${newStatus}`,
				});

				// Refresh certificates
				await fetchCertificates();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to update certificate status",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update certificate status",
				variant: "destructive",
			});
		} finally {
			setUpdatingStatus(null);
		}
	};

	const handleReject = async () => {
		if (!selectedCertificate || !rejectReason.trim()) {
			toast({
				title: "Error",
				description: "Please provide a reason for rejection",
				variant: "destructive",
			});
			return;
		}

		setRejectingStatus(selectedCertificate.id);

		try {
			const result = await updateCertificateStatusAction(
				selectedCertificate.id,
				"rejected",
				{ rejectedReason: rejectReason.trim() }
			);

			if (result.success) {
				toast({
					title: "Success",
					description: "Certificate rejected successfully",
				});

				// Reset form and close dialog
				setRejectReason("");
				setSelectedCertificate(null);
				setRejectDialogOpen(false);

				// Refresh certificates
				await fetchCertificates();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to reject certificate",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to reject certificate",
				variant: "destructive",
			});
		} finally {
			setRejectingStatus(null);
		}
	};

	const handleRequestInfo = async () => {
		if (!selectedCertificate || !additionalInfoRequest.trim()) {
			toast({
				title: "Error",
				description: "Please provide information request details",
				variant: "destructive",
			});
			return;
		}

		setRequestingInfoStatus(selectedCertificate.id);

		try {
			const result = await updateCertificateStatusAction(
				selectedCertificate.id,
				"additionalInfo",
				{ notes: additionalInfoRequest.trim() }
			);

			if (result.success) {
				toast({
					title: "Success",
					description: "Information request sent successfully",
				});

				// Reset form and close dialog
				setAdditionalInfoRequest("");
				setSelectedCertificate(null);
				setRequestInfoDialogOpen(false);

				// Refresh certificates
				await fetchCertificates();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to send information request",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to send information request",
				variant: "destructive",
			});
		} finally {
			setRequestingInfoStatus(null);
		}
	};

	const handleDelete = async (id: string) => {
		setDeletingStatus(id);

		try {
			const result = await deleteCertificateAction(id);

			if (result.success) {
				toast({
					title: "Success",
					description: "Certificate request deleted successfully",
				});

				// Refresh certificates
				await fetchCertificates();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to delete certificate request",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete certificate request",
				variant: "destructive",
			});
		} finally {
			setDeletingStatus(null);
		}
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

	if (loading && certificates.length === 0) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-center h-64">
					<Loader2 className="h-8 w-8 animate-spin" />
					<span className="ml-2">Loading certificates...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Certificate Requests
					</h1>
					<p className="text-muted-foreground mt-2">
						Manage and process certificate requests from residents
					</p>
				</div>
			</div>

			<div className="flex items-center space-x-2 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search requests..."
						className="pl-8"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSearch()}
					/>
				</div>
				<Button onClick={handleSearch} disabled={loading}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
					Search
				</Button>
				<Button
					variant="outline"
					onClick={fetchCertificates}
					disabled={loading}
				>
					{loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
					Refresh
				</Button>

				<Select value={statusFilter} onValueChange={handleStatusFilter}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Requests</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="processing">Processing</SelectItem>
						<SelectItem value="ready">Ready</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
						<SelectItem value="additionalInfo">Needs Info</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="border rounded-lg">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Reference No.</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Requested By</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Purpose</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredCertificates.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-8 text-muted-foreground"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<Loader2 className="h-4 w-4 animate-spin mr-2" />
											Loading...
										</div>
									) : (
										"No certificates found"
									)}
								</TableCell>
							</TableRow>
						) : (
							filteredCertificates.map((cert) => (
								<TableRow key={cert.id}>
									<TableCell className="font-medium">{cert.id}</TableCell>
									<TableCell>
										<div className="flex items-center">
											<FileText className="mr-2 h-4 w-4 text-primary" />
											{cert.type}
											{cert.photoUrl && (
												<Badge variant="secondary" className="ml-2 text-xs">
													Photo
												</Badge>
											)}
											{cert.hasSignature && (
												<Badge variant="outline" className="ml-2 text-xs">
													Signed
												</Badge>
											)}
											{cert.pdfUrl && (
												<Badge variant="default" className="ml-2 text-xs">
													PDF
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>{cert.requestedBy}</TableCell>
									<TableCell>{cert.requestedOn}</TableCell>
									<TableCell>{cert.purpose}</TableCell>
									<TableCell>{getStatusBadge(cert.status)}</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => {
														setSelectedCertificate(cert);
														setViewDialogOpen(true);
													}}
												>
													<FileText className="h-4 w-4 mr-2" />
													View Details
												</DropdownMenuItem>

												{cert.status === "pending" && (
													<DropdownMenuItem
														onClick={() =>
															handleStatusUpdate(cert.id, "processing")
														}
														disabled={
															updatingStatus === cert.id ||
															rejectingStatus === cert.id ||
															requestingInfoStatus === cert.id ||
															deletingStatus === cert.id
														}
													>
														{updatingStatus === cert.id ? (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														) : (
															<Clock className="h-4 w-4 mr-2" />
														)}
														{updatingStatus === cert.id
															? "Updating..."
															: "Start Processing"}
													</DropdownMenuItem>
												)}

												{cert.status === "processing" && (
													<DropdownMenuItem
														onClick={() => handleStatusUpdate(cert.id, "ready")}
														disabled={
															updatingStatus === cert.id ||
															rejectingStatus === cert.id ||
															requestingInfoStatus === cert.id ||
															deletingStatus === cert.id
														}
													>
														{updatingStatus === cert.id ? (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														) : (
															<CheckCircle className="h-4 w-4 mr-2" />
														)}
														{updatingStatus === cert.id
															? "Updating..."
															: "Mark as Ready"}
													</DropdownMenuItem>
												)}

												{cert.status === "ready" && (
													<>
														<DropdownMenuItem
															onClick={() => {
																setSelectedCertificate(cert);
																setGenerateCertDialogOpen(true);
															}}
														>
															<Download className="h-4 w-4 mr-2" />
															Generate Certificate
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(cert.id, "completed")
															}
															disabled={
																updatingStatus === cert.id ||
																rejectingStatus === cert.id ||
																requestingInfoStatus === cert.id ||
																deletingStatus === cert.id
															}
														>
															{updatingStatus === cert.id ? (
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															) : (
																<CheckCircle className="h-4 w-4 mr-2" />
															)}
															{updatingStatus === cert.id
																? "Updating..."
																: "Mark as Completed"}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(cert.id, "processing")
															}
															disabled={
																updatingStatus === cert.id ||
																rejectingStatus === cert.id ||
																requestingInfoStatus === cert.id ||
																deletingStatus === cert.id
															}
														>
															{updatingStatus === cert.id ? (
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															) : (
																<Clock className="h-4 w-4 mr-2" />
															)}
															{updatingStatus === cert.id
																? "Updating..."
																: "Return to Processing"}
														</DropdownMenuItem>
													</>
												)}

												{cert.status === "completed" && (
													<DropdownMenuItem
														onClick={() => {
															setSelectedCertificate(cert);
															setGenerateCertDialogOpen(true);
														}}
													>
														<Download className="h-4 w-4 mr-2" />
														Generate Certificate
													</DropdownMenuItem>
												)}

												{(cert.status === "pending" ||
													cert.status === "processing") && (
													<>
														<DropdownMenuItem
															onClick={() => {
																setSelectedCertificate(cert);
																setRejectDialogOpen(true);
															}}
															disabled={
																rejectingStatus === cert.id ||
																requestingInfoStatus === cert.id
															}
														>
															<AlertCircle className="h-4 w-4 mr-2" />
															Reject
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => {
																setSelectedCertificate(cert);
																setRequestInfoDialogOpen(true);
															}}
															disabled={
																rejectingStatus === cert.id ||
																requestingInfoStatus === cert.id
															}
														>
															<AlertCircle className="h-4 w-4 mr-2" />
															Request Info
														</DropdownMenuItem>
													</>
												)}

												{cert.status === "additionalInfo" && (
													<>
														<DropdownMenuItem
															onClick={() => {
																setSelectedCertificate(cert);
																setRequestInfoDialogOpen(true);
															}}
															disabled={requestingInfoStatus === cert.id}
														>
															<AlertCircle className="h-4 w-4 mr-2" />
															Request Info
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleStatusUpdate(cert.id, "processing")
															}
															disabled={
																updatingStatus === cert.id ||
																rejectingStatus === cert.id ||
																requestingInfoStatus === cert.id ||
																deletingStatus === cert.id
															}
														>
															{updatingStatus === cert.id ? (
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															) : (
																<Clock className="h-4 w-4 mr-2" />
															)}
															{updatingStatus === cert.id
																? "Updating..."
																: "Resume Processing"}
														</DropdownMenuItem>
													</>
												)}

												<DropdownMenuSeparator />

												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															className="text-red-600 focus:text-red-600"
															onSelect={(e) => e.preventDefault()}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															Delete
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>
																Delete Certificate Request
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete this certificate
																request? This action cannot be undone.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																className="bg-red-600 hover:bg-red-700"
																onClick={() => handleDelete(cert.id)}
																disabled={deletingStatus === cert.id}
															>
																{deletingStatus === cert.id ? (
																	<>
																		<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																		Deleting...
																	</>
																) : (
																	"Delete"
																)}
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Certificate Request</DialogTitle>
						<DialogDescription>
							Please provide a reason for rejecting this certificate request.
							This will be recorded and visible to the applicant.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="rejectReason">Reason for Rejection</Label>
							<Textarea
								id="rejectReason"
								placeholder="Enter the reason for rejection..."
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRejectDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleReject}
							disabled={
								!rejectReason.trim() ||
								rejectingStatus === selectedCertificate?.id
							}
							variant="destructive"
						>
							{rejectingStatus === selectedCertificate?.id ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Rejecting...
								</>
							) : (
								"Reject Certificate"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Details Dialog */}
			<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Certificate Request Details</DialogTitle>
						<DialogDescription>
							Detailed information about the certificate request
						</DialogDescription>
					</DialogHeader>
					{selectedCertificate && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-sm font-medium">Reference No.</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.id}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Status</Label>
									<div className="mt-1">
										{getStatusBadge(selectedCertificate.status)}
									</div>
								</div>
								<div>
									<Label className="text-sm font-medium">
										Certificate Type
									</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.type}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Requested By</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.requestedBy}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Requested On</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.requestedOn}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Purpose</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.purpose}
									</p>
								</div>
							</div>
							{selectedCertificate.estimatedCompletion && (
								<div>
									<Label className="text-sm font-medium">
										Estimated Completion
									</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.estimatedCompletion}
									</p>
								</div>
							)}
							{selectedCertificate.notes && (
								<div>
									<Label className="text-sm font-medium">Notes</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.notes}
									</p>
								</div>
							)}
							{selectedCertificate.rejectedReason && (
								<div>
									<Label className="text-sm font-medium">
										Rejection Reason
									</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.rejectedReason}
									</p>
								</div>
							)}
							{selectedCertificate.completedOn && (
								<div>
									<Label className="text-sm font-medium">Completed On</Label>
									<p className="text-sm text-muted-foreground mt-1">
										{selectedCertificate.completedOn}
									</p>
								</div>
							)}
							{selectedCertificate.photoUrl && (
								<div>
									<Label className="text-sm font-medium">Uploaded Photo</Label>
									<div className="mt-2">
										<img
											src={selectedCertificate.photoUrl}
											alt="Certificate photo"
											className="max-w-xs rounded-lg border shadow-sm"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
										/>
									</div>
								</div>
							)}
							{selectedCertificate.signatureUrl && (
								<div>
									<Label className="text-sm font-medium">
										Official Signature
									</Label>
									<div className="mt-2">
										<img
											src={selectedCertificate.signatureUrl}
											alt="Official signature"
											className="max-h-16 rounded border shadow-sm"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
										/>
									</div>
								</div>
							)}
							{selectedCertificate.generatedBy && (
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="text-sm font-medium">Generated By</Label>
										<p className="text-sm text-muted-foreground mt-1">
											{selectedCertificate.generatedBy}
										</p>
									</div>
									<div>
										<Label className="text-sm font-medium">Generated On</Label>
										<p className="text-sm text-muted-foreground mt-1">
											{selectedCertificate.generatedOn}
										</p>
									</div>
								</div>
							)}
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setViewDialogOpen(false)}>Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Request Additional Info Dialog */}
			<Dialog
				open={requestInfoDialogOpen}
				onOpenChange={setRequestInfoDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Request Additional Information</DialogTitle>
						<DialogDescription>
							Please specify what additional information is needed from the
							applicant. This will change the status to "Needs Info" and notify
							the applicant.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<Label htmlFor="additionalInfoRequest">
								Information Required
							</Label>
							<Textarea
								id="additionalInfoRequest"
								placeholder="Specify what additional information is needed..."
								value={additionalInfoRequest}
								onChange={(e) => setAdditionalInfoRequest(e.target.value)}
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRequestInfoDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleRequestInfo}
							disabled={
								!additionalInfoRequest.trim() ||
								requestingInfoStatus === selectedCertificate?.id
							}
						>
							{requestingInfoStatus === selectedCertificate?.id ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Sending Request...
								</>
							) : (
								"Send Request"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Certificate Generator Modal */}
			{selectedCertificate && (
				<CertificateGeneratorModal
					isOpen={generateCertDialogOpen}
					onClose={() => {
						setGenerateCertDialogOpen(false);
						setSelectedCertificate(null);
					}}
					certificate={selectedCertificate}
					onCertificateUpdated={fetchCertificates}
				/>
			)}
		</div>
	);
}
