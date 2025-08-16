"use client";

import { useState } from "react";
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
	Clock,
	Users,
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

// Mock data for officials
const mockOfficials = [
	{
		id: "1",
		name: "Juan Dela Cruz",
		position: "captain",
		term: "2022-2025",
		email: "captain@malinta.losbanos.gov.ph",
		phone: "(049) 536-XXXX",
		officeHours: "Monday-Friday, 9:00 AM - 5:00 PM",
		committees: [
			"Peace and Order",
			"Infrastructure Development",
			"Budget and Finance",
			"Executive Committee",
		],
		biography:
			"It is with great honor and privilege that I serve as your Barangay Captain. Our administration is committed to creating a safe, progressive, and inclusive community for all residents. We believe in transparent governance and active community participation.",
		message:
			"Together, we can build a better barangay for ourselves and for future generations. I encourage everyone to take part in our community programs and initiatives. My office is always open to hear your concerns and suggestions.",
		projects: [
			"Road Improvement Project",
			"Community Health Program",
			"Youth Development Initiative",
		],
		achievements: [
			"Best Barangay Award 2024",
			"100% Vaccination Rate",
			"Zero Crime Rate for 6 Months",
		],
		photo:
			"https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop",
		status: "active",
	},
	{
		id: "2",
		name: "Maria Santos",
		position: "councilor",
		term: "2022-2025",
		email: "maria@malinta.losbanos.gov.ph",
		phone: "(049) 536-XXXX",
		officeHours: "Monday-Wednesday, 9:00 AM - 3:00 PM",
		committees: ["Health and Sanitation"],
		biography:
			"Maria Santos has been serving as a Barangay Councilor since 2019. She is a registered nurse and has been leading initiatives for community health programs and sanitation improvements throughout the barangay.",
		message: "",
		projects: ["Community Vaccination Drive", "Sanitation Awareness Campaign"],
		achievements: ["Health Worker of the Year 2023"],
		photo:
			"https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1287&auto=format&fit=crop",
		status: "active",
	},
	{
		id: "3",
		name: "Pedro Reyes",
		position: "councilor",
		term: "2022-2025",
		email: "pedro@malinta.losbanos.gov.ph",
		phone: "(049) 536-XXXX",
		officeHours: "Tuesday-Thursday, 1:00 PM - 5:00 PM",
		committees: ["Education"],
		biography:
			"Pedro Reyes is a former school principal who now serves as a Barangay Councilor. He is passionate about education and has been spearheading educational programs and scholarship opportunities for barangay youth.",
		message: "",
		projects: ["Scholarship Program", "Community Library"],
		achievements: ["Educator of the Year 2022"],
		photo:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1170&auto=format&fit=crop",
		status: "active",
	},
];

export default function OfficialsManagementPage() {
	const { t } = useLanguage();
	const { toast } = useToast();
	const [officials, setOfficials] = useState(mockOfficials);
	const [searchQuery, setSearchQuery] = useState("");
	const [positionFilter, setPositionFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isAddOfficialOpen, setIsAddOfficialOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentOfficial, setCurrentOfficial] = useState<any>(null);
	const [isViewOfficialOpen, setIsViewOfficialOpen] = useState(false);
	const [committees, setCommittees] = useState<string[]>([]);

	// Filter officials based on search query, position, and status
	const filteredOfficials = officials.filter((official) => {
		const matchesSearch =
			official.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			official.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesPosition =
			positionFilter === "all" || official.position === positionFilter;
		const matchesStatus =
			statusFilter === "all" || official.status === statusFilter;
		return matchesSearch && matchesPosition && matchesStatus;
	});

	const handleAddOfficial = (official: any) => {
		// In a real app, this would be an API call
		const newOfficial = {
			id: (officials.length + 1).toString(),
			...official,
			status: "active",
		};
		setOfficials([...officials, newOfficial]);
		setIsAddOfficialOpen(false);
		toast({
			title: t("admin.success"),
			description: t("admin.officials.saveSuccess"),
		});
	};

	const handleEditOfficial = (official: any) => {
		// In a real app, this would be an API call
		const updatedOfficials = officials.map((o) =>
			o.id === official.id ? official : o
		);
		setOfficials(updatedOfficials);
		setIsAddOfficialOpen(false);
		toast({
			title: t("admin.success"),
			description: t("admin.officials.updateSuccess"),
		});
	};

	const handleDeleteOfficial = () => {
		// In a real app, this would be an API call
		if (currentOfficial) {
			const updatedOfficials = officials.filter(
				(o) => o.id !== currentOfficial.id
			);
			setOfficials(updatedOfficials);
			setIsDeleteDialogOpen(false);
			setCurrentOfficial(null);
			toast({
				title: t("admin.success"),
				description: t("admin.officials.deleteSuccess"),
			});
		}
	};

	const handleViewOfficial = (official: any) => {
		setCurrentOfficial(official);
		setIsViewOfficialOpen(true);
	};

	const handleAddCommittee = () => {
		setCommittees([...committees, ""]);
	};

	const handleRemoveCommittee = (index: number) => {
		const newCommittees = [...committees];
		newCommittees.splice(index, 1);
		setCommittees(newCommittees);
	};

	const handleCommitteeChange = (index: number, value: string) => {
		const newCommittees = [...committees];
		newCommittees[index] = value;
		setCommittees(newCommittees);
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
					onClick={() => {
						setCurrentOfficial(null);
						setCommittees([]);
						setIsAddOfficialOpen(true);
					}}
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
			</div>

			<div className="space-y-4">
				{filteredOfficials.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center p-12">
							<Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
							<p className="text-muted-foreground text-center">
								{t("admin.noData")}
							</p>
							<Button
								className="mt-4"
								onClick={() => {
									setCurrentOfficial(null);
									setCommittees([]);
									setIsAddOfficialOpen(true);
								}}
							>
								<Plus className="mr-2 h-4 w-4" />
								{t("admin.officials.add")}
							</Button>
						</CardContent>
					</Card>
				) : (
					filteredOfficials.map((official) => (
						<Card
							key={official.id}
							className="overflow-hidden hover:shadow-md transition-shadow"
						>
							<div className="flex flex-col md:flex-row">
								<div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
									<Image
										src={official.photo || "/placeholder.svg"}
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
												<div className="flex items-center text-sm">
													<Clock className="mr-2 h-4 w-4 text-primary" />
													<span>{official.officeHours}</span>
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
												onClick={() => {
													setCurrentOfficial(official);
													setCommittees(official.committees || []);
													setIsAddOfficialOpen(true);
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
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>
							{currentOfficial
								? t("admin.officials.edit")
								: t("admin.officials.add")}
						</DialogTitle>
						<DialogDescription>
							{currentOfficial
								? t("admin.officials.description")
								: t("admin.officials.description")}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const formData = new FormData(e.currentTarget);
							const officialData = {
								id: currentOfficial?.id || "",
								name: formData.get("name") as string,
								position: formData.get("position") as string,
								term: formData.get("term") as string,
								email: formData.get("email") as string,
								phone: formData.get("phone") as string,
								officeHours: formData.get("officeHours") as string,
								committees: committees.filter((c) => c.trim() !== ""),
								biography: formData.get("biography") as string,
								message: formData.get("message") as string,
								projects: (formData.get("projects") as string)
									.split(",")
									.map((p) => p.trim())
									.filter((p) => p !== ""),
								achievements: (formData.get("achievements") as string)
									.split(",")
									.map((a) => a.trim())
									.filter((a) => a !== ""),
								photo:
									currentOfficial?.photo ||
									"https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop",
								status: formData.get("status") as string,
							};

							if (currentOfficial) {
								handleEditOfficial(officialData);
							} else {
								handleAddOfficial(officialData);
							}
						}}
					>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<Label htmlFor="name" className="mb-2">
										{t("admin.officials.name")}
									</Label>
									<Input
										id="name"
										name="name"
										defaultValue={currentOfficial?.name || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="position" className="mb-2">
										{t("admin.officials.position")}
									</Label>
									<Select
										name="position"
										defaultValue={currentOfficial?.position || "councilor"}
									>
										<SelectTrigger id="position">
											<SelectValue
												placeholder={t("admin.officials.position")}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="captain">
												{t("officials.captain")}
											</SelectItem>
											<SelectItem value="councilor">
												{t("officials.councilors")}
											</SelectItem>
											<SelectItem value="secretary">
												{t("officials.secretary")}
											</SelectItem>
											<SelectItem value="treasurer">
												{t("officials.treasurer")}
											</SelectItem>
											<SelectItem value="skChairperson">
												{t("officials.skChairperson")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="term" className="mb-2">
										{t("officials.currentTerm")}
									</Label>
									<Input
										id="term"
										name="term"
										defaultValue={currentOfficial?.term || "2022-2025"}
										required
									/>
								</div>
								<div>
									<Label htmlFor="email" className="mb-2">
										{t("officials.email")}
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										defaultValue={currentOfficial?.email || ""}
										required
									/>
								</div>
								<div>
									<Label htmlFor="phone" className="mb-2">
										{t("officials.phone")}
									</Label>
									<Input
										id="phone"
										name="phone"
										defaultValue={currentOfficial?.phone || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="officeHours" className="mb-2">
										{t("officials.office")}
									</Label>
									<Input
										id="officeHours"
										name="officeHours"
										defaultValue={currentOfficial?.officeHours || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label className="mb-2">{t("officials.committees")}</Label>
									{committees.map((committee, index) => (
										<div key={index} className="flex items-center gap-2 mb-2">
											<Input
												value={committee}
												onChange={(e) =>
													handleCommitteeChange(index, e.target.value)
												}
												placeholder={`Committee ${index + 1}`}
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => handleRemoveCommittee(index)}
											>
												{t("admin.officials.removeCommittee")}
											</Button>
										</div>
									))}
									<Button
										type="button"
										variant="outline"
										className="mt-2"
										onClick={handleAddCommittee}
									>
										{t("admin.officials.addCommittee")}
									</Button>
								</div>
								<div className="col-span-2">
									<Label htmlFor="biography" className="mb-2">
										{t("officials.biography")}
									</Label>
									<Textarea
										id="biography"
										name="biography"
										rows={3}
										defaultValue={currentOfficial?.biography || ""}
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="message" className="mb-2">
										{t("admin.officials.message")}
									</Label>
									<Textarea
										id="message"
										name="message"
										rows={3}
										defaultValue={currentOfficial?.message || ""}
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="projects" className="mb-2">
										{t("admin.officials.projects")} (comma-separated)
									</Label>
									<Textarea
										id="projects"
										name="projects"
										rows={2}
										defaultValue={currentOfficial?.projects?.join(", ") || ""}
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="achievements" className="mb-2">
										{t("admin.officials.achievements")} (comma-separated)
									</Label>
									<Textarea
										id="achievements"
										name="achievements"
										rows={2}
										defaultValue={
											currentOfficial?.achievements?.join(", ") || ""
										}
									/>
								</div>
								<div>
									<Label htmlFor="status" className="mb-2">
										{t("admin.officials.status")}
									</Label>
									<Select
										name="status"
										defaultValue={currentOfficial?.status || "active"}
									>
										<SelectTrigger id="status">
											<SelectValue placeholder={t("admin.officials.status")} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="active">
												{t("admin.officials.active")}
											</SelectItem>
											<SelectItem value="inactive">
												{t("admin.officials.inactive")}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAddOfficialOpen(false)}
							>
								{t("admin.cancel")}
							</Button>
							<Button type="submit">
								{currentOfficial ? t("admin.save") : t("admin.officials.save")}
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
						>
							{t("admin.cancel")}
						</Button>
						<Button variant="destructive" onClick={handleDeleteOfficial}>
							{t("admin.delete")}
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
									src={currentOfficial.photo || "/placeholder.svg"}
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
								<div className="flex items-center">
									<Clock className="mr-2 h-4 w-4 text-primary" />
									<span className="font-medium">{t("officials.office")}:</span>
									<span className="ml-2">{currentOfficial.officeHours}</span>
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-2">
									{t("officials.committees")}
								</h3>
								<div className="flex flex-wrap gap-2">
									{currentOfficial.committees.map(
										(committee: string, index: number) => (
											<Badge key={index} variant="outline">
												{committee}
											</Badge>
										)
									)}
								</div>
							</div>
							<div>
								<h3 className="font-medium mb-2">{t("officials.biography")}</h3>
								<p className="text-muted-foreground">
									{currentOfficial.biography}
								</p>
							</div>
							{currentOfficial.message && (
								<div>
									<h3 className="font-medium mb-2">
										{t("admin.officials.message")}
									</h3>
									<p className="text-muted-foreground">
										{currentOfficial.message}
									</p>
								</div>
							)}
							{currentOfficial.projects &&
								currentOfficial.projects.length > 0 && (
									<div>
										<h3 className="font-medium mb-2">
											{t("admin.officials.projects")}
										</h3>
										<ul className="list-disc list-inside text-muted-foreground">
											{currentOfficial.projects.map(
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
											{currentOfficial.achievements.map(
												(achievement: string, index: number) => (
													<li key={index}>{achievement}</li>
												)
											)}
										</ul>
									</div>
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
