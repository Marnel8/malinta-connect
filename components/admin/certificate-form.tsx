"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCertificateAction } from "@/app/actions/certificates";

const certificateTypes = [
	"Barangay Clearance",
	"Certificate of Residency",
	"Certificate of Indigency",
	"Certificate of Good Moral Character",
	"Certificate of Employment",
	"Certificate of No Pending Case",
	"Certificate of Live Birth",
	"Certificate of Death",
	"Business Closure",
	"For Bail",
	"Good Moral (With 1X1 Picture)",
	"Income",
	"Non-residence",
	"No Income",
	"Other",
];

// Helper function to get required fields based on certificate type
const getRequiredFieldsForCertificate = (type: string) => {
	switch (type) {
		case "Business Closure":
			return [
				"businessName",
				"businessLocation",
				"closureDate",
				"closureReason",
			];
		case "For Bail":
			return ["relationship"];
		case "Good Moral (With 1X1 Picture)":
			return ["age", "requiresPicture"];
		case "Certificate of Indigency":
			return ["address"];
		case "Income":
			return ["occupation", "income", "incomeYear"];
		case "Certificate of Employment":
			return ["jobTitle", "employmentPeriod"];
		case "Non-residence":
			return ["nonResidenceDuration"];
		case "No Income":
			return ["supportDetails", "allowanceAmount"];
		default:
			return [];
	}
};

// Helper function to get field labels
const getFieldLabel = (field: string) => {
	const labels: Record<string, string> = {
		businessName: "Business Name",
		businessLocation: "Business Location",
		closureDate: "Closure Date",
		closureReason: "Reason for Closure",
		relationship: "Relationship to Person",
		age: "Age",
		address: "Complete Address",
		occupation: "Occupation/Job",
		income: "Annual Income (₱)",
		incomeYear: "Income Year",
		jobTitle: "Job Title/Position",
		employmentPeriod: "Employment Period",
		nonResidenceDuration: "Duration of Non-Residence",
		supportDetails: "Support Details",
		allowanceAmount: "Monthly Allowance (₱)",
		requiresPicture: "Requires 1x1 Picture",
	};
	return labels[field] || field;
};

interface CertificateFormData {
	type: string;
	requestedBy: string;
	emailToNotify: string;
	purpose: string;
	estimatedCompletion: string;
	notes: string;
	// Additional fields for specific certificate types
	age: string;
	address: string;
	businessName: string;
	businessLocation: string;
	closureDate: string;
	closureReason: string;
	relationship: string;
	occupation: string;
	income: string;
	incomeYear: string;
	employmentPeriod: string;
	jobTitle: string;
	nonResidenceDuration: string;
	supportDetails: string;
	allowanceAmount: string;
	requiresPicture: boolean;
}

export function CertificateForm() {
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState<CertificateFormData>({
		type: "",
		requestedBy: "",
		emailToNotify: "",
		purpose: "",
		estimatedCompletion: "",
		notes: "",
		// Additional fields for specific certificate types
		age: "",
		address: "",
		businessName: "",
		businessLocation: "",
		closureDate: "",
		closureReason: "",
		relationship: "",
		occupation: "",
		income: "",
		incomeYear: "",
		employmentPeriod: "",
		jobTitle: "",
		nonResidenceDuration: "",
		supportDetails: "",
		allowanceAmount: "",
		requiresPicture: false,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (
			!formData.type ||
			!formData.requestedBy ||
			!formData.emailToNotify ||
			!formData.purpose
		) {
			toast({
				title: "Error",
				description:
					"Please fill in all required fields (type, requested by, email, and purpose)",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);

		try {
			const result = await createCertificateAction({
				type: formData.type,
				requestedBy: formData.requestedBy,
				emailToNotify: formData.emailToNotify,
				purpose: formData.purpose,
				estimatedCompletion: formData.estimatedCompletion || undefined,
				notes: formData.notes || undefined,
				// Include additional fields
				age: formData.age || undefined,
				address: formData.address || undefined,
				businessName: formData.businessName || undefined,
				businessLocation: formData.businessLocation || undefined,
				closureDate: formData.closureDate || undefined,
				closureReason: formData.closureReason || undefined,
				relationship: formData.relationship || undefined,
				occupation: formData.occupation || undefined,
				income: formData.income || undefined,
				incomeYear: formData.incomeYear || undefined,
				employmentPeriod: formData.employmentPeriod || undefined,
				jobTitle: formData.jobTitle || undefined,
				nonResidenceDuration: formData.nonResidenceDuration || undefined,
				supportDetails: formData.supportDetails || undefined,
				allowanceAmount: formData.allowanceAmount || undefined,
				requiresPicture: formData.requiresPicture || undefined,
			});

			if (result.success) {
				toast({
					title: "Success",
					description: "Certificate request created successfully",
				});

				// Reset form and close dialog
				setFormData({
					type: "",
					requestedBy: "",
					emailToNotify: "",
					purpose: "",
					estimatedCompletion: "",
					notes: "",
					// Additional fields for specific certificate types
					age: "",
					address: "",
					businessName: "",
					businessLocation: "",
					closureDate: "",
					closureReason: "",
					relationship: "",
					occupation: "",
					income: "",
					incomeYear: "",
					employmentPeriod: "",
					jobTitle: "",
					nonResidenceDuration: "",
					supportDetails: "",
					allowanceAmount: "",
					requiresPicture: false,
				});
				setOpen(false);

				// Trigger a page refresh or callback to update the list
				window.location.reload();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to create certificate request",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create certificate request",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (
		field: keyof CertificateFormData,
		value: string
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					New Certificate Request
				</Button>
			</DialogTrigger>
			<DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Certificate Request</DialogTitle>
					<DialogDescription>
						Add a new certificate request for a resident. Fill in the required
						information below.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 px-1">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="type">Certificate Type *</Label>
							<Select
								value={formData.type}
								onValueChange={(value) => handleInputChange("type", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{certificateTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="requestedBy">Requested By *</Label>
							<Input
								id="requestedBy"
								placeholder="Full name"
								value={formData.requestedBy}
								onChange={(e) =>
									handleInputChange("requestedBy", e.target.value)
								}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="emailToNotify">Email for Notifications *</Label>
						<Input
							id="emailToNotify"
							type="email"
							placeholder="Enter email address for notifications"
							value={formData.emailToNotify}
							onChange={(e) =>
								handleInputChange("emailToNotify", e.target.value)
							}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="purpose">Purpose *</Label>
						<Input
							id="purpose"
							placeholder="e.g., Job application, Voter's registration"
							value={formData.purpose}
							onChange={(e) => handleInputChange("purpose", e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="estimatedCompletion">Estimated Completion</Label>
						<Input
							id="estimatedCompletion"
							type="date"
							value={formData.estimatedCompletion}
							onChange={(e) =>
								handleInputChange("estimatedCompletion", e.target.value)
							}
						/>
					</div>

					{/* Dynamic fields based on certificate type */}
					{getRequiredFieldsForCertificate(formData.type).length > 0 && (
						<div className="border-t pt-4">
							<h4 className="text-sm font-medium text-gray-900 mb-3">
								Additional Information Required
							</h4>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{getRequiredFieldsForCertificate(formData.type).map((field) => (
									<div key={field} className="space-y-2 sm:col-span-1">
										<Label htmlFor={field}>{getFieldLabel(field)} *</Label>
										{field === "requiresPicture" ? (
											<div className="flex items-center space-x-2">
												<input
													type="checkbox"
													id={field}
													checked={
														formData[
															field as keyof CertificateFormData
														] as boolean
													}
													onChange={(e) =>
														handleInputChange(
															field as keyof CertificateFormData,
															e.target.checked
														)
													}
													className="h-4 w-4"
												/>
												<Label htmlFor={field} className="text-sm font-normal">
													I understand this certificate requires a 1x1 picture
												</Label>
											</div>
										) : field === "closureDate" ? (
											<Input
												id={field}
												type="date"
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onChange={(e) =>
													handleInputChange(
														field as keyof CertificateFormData,
														e.target.value
													)
												}
												required
											/>
										) : field === "closureReason" ? (
											<Select
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onValueChange={(value) =>
													handleInputChange(
														field as keyof CertificateFormData,
														value
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select reason" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Financial Difficulties">
														Financial Difficulties
													</SelectItem>
													<SelectItem value="Relocation">Relocation</SelectItem>
													<SelectItem value="Change of Business">
														Change of Business
													</SelectItem>
													<SelectItem value="Retirement">Retirement</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										) : field === "relationship" ? (
											<Select
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onValueChange={(value) =>
													handleInputChange(
														field as keyof CertificateFormData,
														value
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select relationship" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Mother">Mother</SelectItem>
													<SelectItem value="Father">Father</SelectItem>
													<SelectItem value="Spouse">Spouse</SelectItem>
													<SelectItem value="Child">Child</SelectItem>
													<SelectItem value="Sibling">Sibling</SelectItem>
													<SelectItem value="Guardian">Guardian</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										) : field === "incomeYear" ? (
											<Select
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onValueChange={(value) =>
													handleInputChange(
														field as keyof CertificateFormData,
														value
													)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select year" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="2024">2024</SelectItem>
													<SelectItem value="2023">2023</SelectItem>
													<SelectItem value="2022">2022</SelectItem>
													<SelectItem value="2021">2021</SelectItem>
												</SelectContent>
											</Select>
										) : field === "supportDetails" ||
										  field === "employmentPeriod" ? (
											<Textarea
												id={field}
												placeholder={
													field === "supportDetails"
														? "Describe support details..."
														: "e.g., 2018 to present, January 2020 - December 2023"
												}
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onChange={(e) =>
													handleInputChange(
														field as keyof CertificateFormData,
														e.target.value
													)
												}
												rows={2}
												required
											/>
										) : (
											<Input
												id={field}
												placeholder={
													field === "businessName"
														? "e.g., J'S FOOD HUB"
														: field === "businessLocation"
														? "e.g., Purok 2 Barangay Malinta Los Baños Laguna"
														: field === "age"
														? "e.g., 23"
														: field === "address"
														? "e.g., 1093 Purok 5 Malinta, Los Baños, Laguna"
														: field === "occupation"
														? "e.g., Custom Sewer, Massage Therapist"
														: field === "income"
														? "e.g., 42000"
														: field === "jobTitle"
														? "e.g., Massage Therapist, Hilot Wellness"
														: field === "nonResidenceDuration"
														? "e.g., more than 5 months"
														: field === "allowanceAmount"
														? "e.g., 4000"
														: "Enter " + getFieldLabel(field).toLowerCase()
												}
												value={
													formData[field as keyof CertificateFormData] as string
												}
												onChange={(e) =>
													handleInputChange(
														field as keyof CertificateFormData,
														e.target.value
													)
												}
												type={
													field === "income" || field === "allowanceAmount"
														? "number"
														: "text"
												}
												required
											/>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="notes">Notes</Label>
						<Textarea
							id="notes"
							placeholder="Additional information or special requirements..."
							value={formData.notes}
							onChange={(e) => handleInputChange("notes", e.target.value)}
							rows={3}
						/>
					</div>

					<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="w-full sm:w-auto"
						>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Creating...
								</>
							) : (
								"Create Request"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
