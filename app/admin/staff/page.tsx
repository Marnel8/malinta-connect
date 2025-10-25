"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Plus,
	MoreHorizontal,
	Edit,
	Trash2,
	UserCheck,
	UserX,
	Shield,
	Search,
	Filter,
	Users,
	UserPlus,
	Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanManageUsers } from "@/components/admin/permission-guard";
import {
	getAllStaffAction,
	createStaffMemberAction,
	updateStaffMemberAction,
	deleteStaffMemberAction,
	toggleStaffStatusAction,
	updateStaffPermissionsAction,
	StaffMember,
	StaffPermissions,
} from "@/app/actions/staff";

export default function StaffManagementPage() {
	const { userProfile } = useAuth();
	const { toast } = useToast();

	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "official">(
		"all"
	);
	const [statusFilter, setStatusFilter] = useState<
		"all" | "active" | "inactive" | "suspended"
	>("all");

	// Dialog states
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
	const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

	// Form states
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		firstName: "",
		lastName: "",
		role: "official" as "official" | "admin",
		phoneNumber: "",
		address: "",
		position: "",
		department: "",
		employeeId: "",
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const [permissions, setPermissions] = useState<StaffPermissions>({
		canManageUsers: false,
		canManageEvents: false,
		canManageCertificates: false,
		canManageAppointments: false,
		canViewAnalytics: false,
		canManageSettings: false,
		canManageBlotter: false,
		canManageOfficials: false,
		canManageResidents: false,
		canManageAnnouncements: false,
	});

	// Loading states
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

	// Load staff on component mount
	useEffect(() => {
		loadStaff();
	}, []);

	const loadStaff = async () => {
		setLoading(true);
		try {
			const result = await getAllStaffAction();
			if (result.success && result.staff) {
				setStaff(result.staff);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to load staff members",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error loading staff members:", error);
			toast({
				title: "❌ Loading Failed",
				description:
					error?.message ||
					"Failed to load staff members. Please refresh the page.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Filter staff based on search and filters
	const filteredStaff = staff.filter((member) => {
		const matchesSearch =
			`${member.firstName} ${member.lastName}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.department?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesRole = roleFilter === "all" || member.role === roleFilter;
		const matchesStatus =
			statusFilter === "all" || member.status === statusFilter;

		return matchesSearch && matchesRole && matchesStatus;
	});

	const resetForm = () => {
		setFormData({
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			role: "official",
			phoneNumber: "",
			address: "",
			position: "",
			department: "",
			employeeId: "",
		});
		setErrors({});
	};

	const clearFieldError = (fieldName: string) => {
		if (errors[fieldName]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[fieldName];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors: { [key: string]: string } = {};

		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (!formData.firstName) {
			newErrors.firstName = "First name is required";
		}

		if (!formData.lastName) {
			newErrors.lastName = "Last name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleCreateStaff = async () => {
		if (!validateForm()) {
			return;
		}

		setIsCreating(true);
		try {
			const result = await createStaffMemberAction(
				formData.email,
				formData.password,
				{
					firstName: formData.firstName,
					lastName: formData.lastName,
					role: formData.role,
					phoneNumber: formData.phoneNumber || "",
					address: formData.address || "",
					position: formData.position || "",
					department: formData.department || "",
					employeeId: formData.employeeId || "",
					permissions,
				}
			);

			if (result.success) {
				toast({
					title: "✅ Staff Member Created",
					description: `${formData.firstName} ${formData.lastName} has been added successfully`,
				});
				setCreateDialogOpen(false);
				resetForm();
				loadStaff();
			} else {
				toast({
					title: "❌ Creation Failed",
					description:
						result.error || "Failed to create staff member. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error creating staff member:", error);
			toast({
				title: "❌ Creation Failed",
				description:
					error?.message || "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleEditStaff = async () => {
		if (!selectedStaff) return;

		setIsUpdating(true);
		try {
			const result = await updateStaffMemberAction(selectedStaff.uid, {
				firstName: formData.firstName,
				lastName: formData.lastName,
				phoneNumber: formData.phoneNumber || "",
				address: formData.address || "",
				position: formData.position || "",
				department: formData.department || "",
				employeeId: formData.employeeId || "",
			});

			if (result.success) {
				toast({
					title: "✅ Staff Member Updated",
					description: `${formData.firstName} ${formData.lastName}'s information has been updated successfully`,
				});
				setEditDialogOpen(false);
				setSelectedStaff(null);
				resetForm();
				loadStaff();
			} else {
				toast({
					title: "❌ Update Failed",
					description:
						result.error || "Failed to update staff member. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error updating staff member:", error);
			toast({
				title: "❌ Update Failed",
				description:
					error?.message || "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDeleteStaff = async (uid: string) => {
		setIsDeleting(uid);
		try {
			const result = await deleteStaffMemberAction(uid);

			if (result.success) {
				toast({
					title: "🗑️ Staff Member Deleted",
					description:
						"Staff member has been removed from the system successfully",
				});
				loadStaff();
			} else {
				toast({
					title: "❌ Deletion Failed",
					description:
						result.error || "Failed to delete staff member. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error deleting staff member:", error);
			toast({
				title: "❌ Deletion Failed",
				description:
					error?.message || "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(null);
		}
	};

	const handleToggleStatus = async (
		uid: string,
		newStatus: "active" | "inactive" | "suspended"
	) => {
		setIsTogglingStatus(uid);
		try {
			const result = await toggleStaffStatusAction(uid, newStatus);

			if (result.success) {
				toast({
					title: "🔄 Status Updated",
					description: `Staff member status has been changed to ${newStatus} successfully`,
				});
				loadStaff();
			} else {
				toast({
					title: "❌ Status Update Failed",
					description:
						result.error || "Failed to update staff status. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error updating staff status:", error);
			toast({
				title: "❌ Status Update Failed",
				description:
					error?.message || "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsTogglingStatus(null);
		}
	};

	const handleUpdatePermissions = async () => {
		if (!selectedStaff) return;

		setIsUpdatingPermissions(true);
		try {
			const result = await updateStaffMemberAction(selectedStaff.uid, {
				permissions,
			});

			if (result.success) {
				toast({
					title: "🔐 Permissions Updated",
					description: `${selectedStaff?.firstName} ${selectedStaff?.lastName}'s permissions have been updated successfully`,
				});
				setPermissionsDialogOpen(false);
				setSelectedStaff(null);
				loadStaff();
			} else {
				toast({
					title: "❌ Permissions Update Failed",
					description:
						result.error || "Failed to update permissions. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			console.error("Error updating permissions:", error);
			toast({
				title: "❌ Permissions Update Failed",
				description:
					error?.message || "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUpdatingPermissions(false);
		}
	};

	const openEditDialog = (member: StaffMember) => {
		setSelectedStaff(member);
		setFormData({
			email: member.email,
			password: "",
			firstName: member.firstName || "",
			lastName: member.lastName || "",
			role: member.role,
			phoneNumber: member.phoneNumber || "",
			address: member.address || "",
			position: member.position || "",
			department: member.department || "",
			employeeId: member.employeeId || "",
		});
		setEditDialogOpen(true);
	};

	const openPermissionsDialog = (member: StaffMember) => {
		setSelectedStaff(member);
		const memberPermissions = member.permissions;
		const defaultPermissions: StaffPermissions = {
			canManageUsers: false,
			canManageEvents: false,
			canManageCertificates: false,
			canManageAppointments: false,
			canViewAnalytics: false,
			canManageSettings: false,
			canManageBlotter: false,
			canManageOfficials: false,
			canManageResidents: false,
			canManageAnnouncements: false,
		};

		if (memberPermissions) {
			setPermissions({
				canManageUsers: memberPermissions.canManageUsers || false,
				canManageEvents: memberPermissions.canManageEvents || false,
				canManageCertificates: memberPermissions.canManageCertificates || false,
				canManageAppointments: memberPermissions.canManageAppointments || false,
				canViewAnalytics: memberPermissions.canViewAnalytics || false,
				canManageSettings: memberPermissions.canManageSettings || false,
				canManageBlotter: memberPermissions.canManageBlotter || false,
				canManageOfficials: memberPermissions.canManageOfficials || false,
				canManageResidents: memberPermissions.canManageResidents || false,
				canManageAnnouncements:
					memberPermissions.canManageAnnouncements || false,
			});
		} else {
			setPermissions(defaultPermissions);
		}
		setPermissionsDialogOpen(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 hover:bg-green-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 hover:bg-gray-200";
			case "suspended":
				return "bg-red-100 text-red-800 hover:bg-red-200";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-200";
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-purple-100 text-purple-800 hover:bg-purple-200";
			case "official":
				return "bg-blue-100 text-blue-800 hover:bg-blue-200";
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-200";
		}
	};

	const getInitials = (firstName?: string, lastName?: string) => {
		return `${firstName?.charAt(0) || ""}${
			lastName?.charAt(0) || ""
		}`.toUpperCase();
	};

	return (
		<CanManageUsers>
			<div className="container mx-auto p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Staff Management</h1>
						<p className="text-muted-foreground">
							Manage staff members and their permissions
						</p>
					</div>
					<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={resetForm} disabled={isCreating}>
								<UserPlus className="h-4 w-4 mr-2" />
								Add Staff Member
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create New Staff Member</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								{/* Basic Information */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="email">Email *</Label>
										<Input
											id="email"
											type="email"
											value={formData.email}
											onChange={(e) => {
												setFormData({ ...formData, email: e.target.value });
												clearFieldError("email");
											}}
											placeholder="Enter email address"
											className={errors.email ? "border-red-500" : ""}
										/>
										{errors.email && (
											<p className="text-sm text-red-500 mt-1">
												{errors.email}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="password">Password *</Label>
										<Input
											id="password"
											type="password"
											value={formData.password}
											onChange={(e) => {
												setFormData({ ...formData, password: e.target.value });
												clearFieldError("password");
											}}
											placeholder="Enter password"
											className={errors.password ? "border-red-500" : ""}
										/>
										{errors.password && (
											<p className="text-sm text-red-500 mt-1">
												{errors.password}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="firstName">First Name *</Label>
										<Input
											id="firstName"
											value={formData.firstName}
											onChange={(e) => {
												setFormData({ ...formData, firstName: e.target.value });
												clearFieldError("firstName");
											}}
											placeholder="Enter first name"
											className={errors.firstName ? "border-red-500" : ""}
										/>
										{errors.firstName && (
											<p className="text-sm text-red-500 mt-1">
												{errors.firstName}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="lastName">Last Name *</Label>
										<Input
											id="lastName"
											value={formData.lastName}
											onChange={(e) => {
												setFormData({ ...formData, lastName: e.target.value });
												clearFieldError("lastName");
											}}
											placeholder="Enter last name"
											className={errors.lastName ? "border-red-500" : ""}
										/>
										{errors.lastName && (
											<p className="text-sm text-red-500 mt-1">
												{errors.lastName}
											</p>
										)}
									</div>
									<div>
										<Label htmlFor="role">Role *</Label>
										<Select
											value={formData.role}
											onValueChange={(value) =>
												setFormData({
													...formData,
													role: value as "official" | "admin",
												})
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="official">Official</SelectItem>
												<SelectItem value="admin">Admin</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor="position">Position</Label>
										<Input
											id="position"
											value={formData.position}
											onChange={(e) =>
												setFormData({ ...formData, position: e.target.value })
											}
											placeholder="Enter position"
										/>
									</div>
									<div>
										<Label htmlFor="phoneNumber">Phone Number</Label>
										<Input
											id="phoneNumber"
											value={formData.phoneNumber}
											onChange={(e) =>
												setFormData({
													...formData,
													phoneNumber: e.target.value,
												})
											}
											placeholder="Enter phone number"
										/>
									</div>
									<div>
										<Label htmlFor="department">Department (Optional)</Label>
										<Input
											id="department"
											value={formData.department}
											onChange={(e) =>
												setFormData({ ...formData, department: e.target.value })
											}
											placeholder="Enter department"
										/>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label htmlFor="employeeId">Employee ID (Optional)</Label>
										<Input
											id="employeeId"
											value={formData.employeeId}
											onChange={(e) =>
												setFormData({ ...formData, employeeId: e.target.value })
											}
											placeholder="Enter employee ID"
										/>
									</div>
									<div>
										<Label htmlFor="address">Address</Label>
										<Input
											id="address"
											value={formData.address}
											onChange={(e) =>
												setFormData({ ...formData, address: e.target.value })
											}
											placeholder="Enter address"
										/>
									</div>
								</div>

								{/* Permissions */}
								<div>
									<Label className="text-base font-semibold">Permissions</Label>
									<div className="grid grid-cols-2 gap-4 mt-2">
										{Object.entries(permissions).map(([key, value]) => (
											<div key={key} className="flex items-center space-x-2">
												<Checkbox
													id={key}
													checked={value}
													onCheckedChange={(checked) =>
														setPermissions({
															...permissions,
															[key]: checked as boolean,
														})
													}
												/>
												<Label htmlFor={key} className="text-sm">
													{key
														.replace(/([A-Z])/g, " $1")
														.replace(/^./, (str) => str.toUpperCase())}
												</Label>
											</div>
										))}
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									onClick={() => setCreateDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button onClick={handleCreateStaff} disabled={isCreating}>
									{isCreating ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Creating...
										</>
									) : (
										"Create Staff Member"
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Filters */}
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
									<Input
										placeholder="Search staff members..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="flex gap-2">
								<Select
									value={roleFilter}
									onValueChange={(value) =>
										setRoleFilter(value as "all" | "admin" | "official")
									}
								>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Roles</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
										<SelectItem value="official">Official</SelectItem>
									</SelectContent>
								</Select>
								<Select
									value={statusFilter}
									onValueChange={(value) =>
										setStatusFilter(
											value as "all" | "active" | "inactive" | "suspended"
										)
									}
								>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Staff List */}
				<div className="grid gap-4">
					{loading ? (
						<Card>
							<CardContent className="flex items-center justify-center py-16">
								<div className="text-center">
									<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
									<p className="text-muted-foreground">
										Loading staff members...
									</p>
								</div>
							</CardContent>
						</Card>
					) : filteredStaff.length === 0 ? (
						<Card>
							<CardContent className="flex items-center justify-center py-16">
								<div className="text-center">
									<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-semibold">
										No staff members found
									</h3>
									<p className="text-muted-foreground">
										{staff.length === 0
											? "Start by creating your first staff member."
											: "Try adjusting your search or filters."}
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						filteredStaff.map((member) => (
							<Card key={member.uid}>
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4">
											<Avatar className="h-12 w-12">
												<AvatarFallback>
													{getInitials(member.firstName, member.lastName)}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="flex items-center space-x-2">
													<h3 className="font-semibold">
														{member.firstName} {member.lastName}
													</h3>
													<Badge className={getRoleColor(member.role)}>
														{member.role}
													</Badge>
													<Badge className={getStatusColor(member.status)}>
														{member.status}
													</Badge>
												</div>
												<p className="text-sm text-muted-foreground">
													{member.email}
												</p>
												{member.position && (
													<p className="text-sm text-muted-foreground">
														{member.position}
													</p>
												)}
												{member.department && (
													<p className="text-xs text-muted-foreground">
														Department: {member.department}
													</p>
												)}
											</div>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="sm">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													onClick={() => openEditDialog(member)}
												>
													<Edit className="h-4 w-4 mr-2" />
													Edit Details
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => openPermissionsDialog(member)}
												>
													<Shield className="h-4 w-4 mr-2" />
													Manage Permissions
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												{member.status === "active" ? (
													<>
														<DropdownMenuItem
															onClick={() =>
																handleToggleStatus(member.uid, "inactive")
															}
															disabled={isTogglingStatus === member.uid}
														>
															{isTogglingStatus === member.uid ? (
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															) : (
																<UserX className="h-4 w-4 mr-2" />
															)}
															{isTogglingStatus === member.uid
																? "Updating..."
																: "Set Inactive"}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleToggleStatus(member.uid, "suspended")
															}
															disabled={isTogglingStatus === member.uid}
														>
															{isTogglingStatus === member.uid ? (
																<Loader2 className="h-4 w-4 mr-2 animate-spin" />
															) : (
																<UserX className="h-4 w-4 mr-2" />
															)}
															{isTogglingStatus === member.uid
																? "Updating..."
																: "Suspend"}
														</DropdownMenuItem>
													</>
												) : (
													<DropdownMenuItem
														onClick={() =>
															handleToggleStatus(member.uid, "active")
														}
														disabled={isTogglingStatus === member.uid}
													>
														{isTogglingStatus === member.uid ? (
															<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														) : (
															<UserCheck className="h-4 w-4 mr-2" />
														)}
														{isTogglingStatus === member.uid
															? "Updating..."
															: "Activate"}
													</DropdownMenuItem>
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
																Delete Staff Member
															</AlertDialogTitle>
															<AlertDialogDescription>
																Are you sure you want to delete{" "}
																<strong>{member.firstName} {member.lastName}</strong>? This
																action cannot be undone and will permanently
																remove their account.
															</AlertDialogDescription>
															<div className="mt-2 text-sm text-muted-foreground">
																<ul className="list-disc list-inside space-y-1">
																	<li>Staff account and authentication</li>
																	<li>Personal information and contact details</li>
																	<li>Assigned permissions and access rights</li>
																	<li>Work history and records</li>
																</ul>
															</div>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel>Cancel</AlertDialogCancel>
															<AlertDialogAction
																className="bg-red-600 hover:bg-red-700"
																onClick={() => handleDeleteStaff(member.uid)}
																disabled={isDeleting === member.uid}
															>
																{isDeleting === member.uid ? (
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
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>

				{/* Edit Dialog */}
				<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Staff Member</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="editFirstName">First Name</Label>
									<Input
										id="editFirstName"
										value={formData.firstName}
										onChange={(e) => {
											setFormData({ ...formData, firstName: e.target.value });
											clearFieldError("firstName");
										}}
									/>
								</div>
								<div>
									<Label htmlFor="editLastName">Last Name</Label>
									<Input
										id="editLastName"
										value={formData.lastName}
										onChange={(e) => {
											setFormData({ ...formData, lastName: e.target.value });
											clearFieldError("lastName");
										}}
									/>
								</div>
								<div>
									<Label htmlFor="editPosition">Position</Label>
									<Input
										id="editPosition"
										value={formData.position}
										onChange={(e) =>
											setFormData({ ...formData, position: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="editDepartment">Department</Label>
									<Input
										id="editDepartment"
										value={formData.department}
										onChange={(e) =>
											setFormData({ ...formData, department: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="editEmployeeId">Employee ID</Label>
									<Input
										id="editEmployeeId"
										value={formData.employeeId}
										onChange={(e) =>
											setFormData({ ...formData, employeeId: e.target.value })
										}
									/>
								</div>
								<div>
									<Label htmlFor="editPhoneNumber">Phone Number</Label>
									<Input
										id="editPhoneNumber"
										value={formData.phoneNumber}
										onChange={(e) =>
											setFormData({ ...formData, phoneNumber: e.target.value })
										}
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="editAddress">Address</Label>
								<Input
									id="editAddress"
									value={formData.address}
									onChange={(e) =>
										setFormData({ ...formData, address: e.target.value })
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setEditDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button onClick={handleEditStaff} disabled={isUpdating}>
								{isUpdating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update Staff Member"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Permissions Dialog */}
				<Dialog
					open={permissionsDialogOpen}
					onOpenChange={setPermissionsDialogOpen}
				>
					<DialogContent className="max-w-lg">
						<DialogHeader>
							<DialogTitle>Manage Permissions</DialogTitle>
							{selectedStaff && (
								<p className="text-sm text-muted-foreground">
									{selectedStaff.firstName} {selectedStaff.lastName}
								</p>
							)}
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid gap-4">
								{Object.entries(permissions).map(([key, value]) => (
									<div key={key} className="flex items-center space-x-2">
										<Checkbox
											id={`perm-${key}`}
											checked={value}
											onCheckedChange={(checked) =>
												setPermissions({
													...permissions,
													[key]: checked as boolean,
												})
											}
										/>
										<Label
											htmlFor={`perm-${key}`}
											className="text-sm font-medium"
										>
											{key
												.replace(/([A-Z])/g, " $1")
												.replace(/^./, (str) => str.toUpperCase())}
										</Label>
									</div>
								))}
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setPermissionsDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleUpdatePermissions}
								disabled={isUpdatingPermissions}
							>
								{isUpdatingPermissions ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									"Update Permissions"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</CanManageUsers>
	);
}
