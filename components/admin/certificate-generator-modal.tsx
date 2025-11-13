"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Download } from "lucide-react";
import {
	generateCertificatePDFAction,
	uploadSignatureAction,
	type Certificate,
} from "@/app/actions/certificates";
import {
	generateCertificatePDF,
	type CertificateData,
	type OfficialInfo,
} from "@/lib/certificate-pdf-generator";
import { getCertificateTemplateConfig } from "@/lib/certificate-templates";
import { Switch } from "@/components/ui/switch";

interface CertificateGeneratorModalProps {
	isOpen: boolean;
	onClose: () => void;
	certificate: Certificate;
	onCertificateUpdated: () => void;
}

export function CertificateGeneratorModal({
	isOpen,
	onClose,
	certificate,
	onCertificateUpdated,
}: CertificateGeneratorModalProps) {
	// Reset states when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setPdfBlob(null);
			setSignatureFile(null);
		}
	}, [isOpen]);
	const { toast } = useToast();
	const [isGenerating, setIsGenerating] = useState(false);
	const [isUploadingSignature, setIsUploadingSignature] = useState(false);
	const [includeSignature, setIncludeSignature] = useState(
		certificate.hasSignature || false
	);
	const [signatureFile, setSignatureFile] = useState<File | null>(null);
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Default official info (can be made configurable later)
	const officialInfo: OfficialInfo = {
		name: "HON. JESUS H. DE UNA JR.",
		position: "Punong Barangay",
	};

	const certificateData: CertificateData = {
		id: certificate.id,
		type: certificate.type,
		requestedBy: certificate.requestedBy,
		purpose: certificate.purpose,
		generatedOn:
			certificate.generatedOn ||
			new Date().toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		age: certificate.age,
		address: certificate.address,
		occupation: certificate.occupation,
		income: certificate.income,
		incomeYear: certificate.incomeYear,
		jobTitle: certificate.jobTitle,
		employmentPeriod: certificate.employmentPeriod,
		businessName: certificate.businessName,
		businessLocation: certificate.businessLocation,
		closureDate: certificate.closureDate,
		closureReason: certificate.closureReason,
		relationship: certificate.relationship,
		nonResidenceDuration: certificate.nonResidenceDuration,
		supportDetails: certificate.supportDetails,
		allowanceAmount: certificate.allowanceAmount,
		signatureUrl: certificate.signatureUrl,
		hasSignature:
			includeSignature && (!!certificate.signatureUrl || !!signatureFile),
	};

	const templateConfig = getCertificateTemplateConfig(certificate.type || "");
	const certificateTypeLabel = templateConfig.previewDescription || certificate.type || "Certificate";

	const handleSignatureUpload = async () => {
		if (!signatureFile) {
			toast({
				title: "Error",
				description: "Please select a signature file",
				variant: "destructive",
			});
			return;
		}

		setIsUploadingSignature(true);
		try {
			const result = await uploadSignatureAction(certificate.id, signatureFile);

			if (result.success) {
				toast({
					title: "Success",
					description: "Signature uploaded successfully",
				});
				onCertificateUpdated();
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to upload signature",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to upload signature",
				variant: "destructive",
			});
		} finally {
			setIsUploadingSignature(false);
		}
	};

	const handleGeneratePDF = async () => {
		setIsGenerating(true);
		try {
			// Generate PDF using client-side library
			const result = await generateCertificatePDF(
				certificateData,
				officialInfo
			);

			if (result.success && result.pdfBlob) {
				// Store the PDF blob for preview/download
				setPdfBlob(result.pdfBlob);

				toast({
					title: "Success",
					description:
						"Certificate PDF generated successfully. You can now print or download it.",
				});

				// Update certificate status to completed if it was ready
				if (certificate.status === "ready") {
					// You can add logic here to update status to completed
				}
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to generate PDF",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast({
				title: "Error",
				description: "Failed to generate certificate PDF",
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const handlePrint = () => {
		if (pdfBlob) {
			const url = URL.createObjectURL(pdfBlob);
			const printWindow = window.open(url);
			if (printWindow) {
				printWindow.onload = () => {
					printWindow.print();
				};
			}
		}
	};

	const handleDownload = () => {
		if (pdfBlob) {
			const url = URL.createObjectURL(pdfBlob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `Certificate_${certificate.type}_${certificate.requestedBy}_${certificate.id}.pdf`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			toast({
				title: "Success",
				description: "Certificate PDF downloaded successfully",
			});
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Validate file type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Error",
					description: "Please select an image file for the signature",
					variant: "destructive",
				});
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: "Error",
					description: "File size must be less than 5MB",
					variant: "destructive",
				});
				return;
			}

			setSignatureFile(file);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Generate Certificate</DialogTitle>
					<DialogDescription>
						Generate {certificateTypeLabel} for {certificate.requestedBy}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Certificate Info */}
					<div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
						<div>
							<Label className="text-sm font-medium">Reference No.</Label>
							<p className="text-sm text-muted-foreground">{certificate.id}</p>
						</div>
						<div>
							<Label className="text-sm font-medium">Type</Label>
							<p className="text-sm text-muted-foreground">
								{certificate.type}
							</p>
						</div>
						<div>
							<Label className="text-sm font-medium">Requested By</Label>
							<p className="text-sm text-muted-foreground">
								{certificate.requestedBy}
							</p>
						</div>
						<div>
							<Label className="text-sm font-medium">Purpose</Label>
							<p className="text-sm text-muted-foreground">
								{certificate.purpose}
							</p>
						</div>
					</div>

					{/* Signature Options */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="include-signature"
								className="text-sm font-medium"
							>
								Include Official Signature
							</Label>
							<Switch
								id="include-signature"
								checked={includeSignature}
								onCheckedChange={setIncludeSignature}
							/>
						</div>

						{includeSignature && (
							<div className="space-y-4 p-4 border rounded-lg">
								{certificate.signatureUrl ? (
									<div>
										<Label className="text-sm font-medium">
											Current Signature
										</Label>
										<div className="mt-2">
											<img
												src={certificate.signatureUrl}
												alt="Current signature"
												className="max-h-20 border rounded"
											/>
										</div>
										<p className="text-xs text-muted-foreground mt-1">
											You can upload a new signature to replace this one
										</p>
									</div>
								) : (
									<div>
										<Label className="text-sm font-medium">
											Upload Signature
										</Label>
										<p className="text-xs text-muted-foreground mb-2">
											Upload an image file of the official's signature
										</p>
									</div>
								)}

								<div className="flex items-center gap-2">
									<Input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="flex-1"
									/>
									{signatureFile && (
										<Button
											onClick={handleSignatureUpload}
											disabled={isUploadingSignature}
											size="sm"
										>
											{isUploadingSignature ? (
												<>
													<Loader2 className="h-4 w-4 animate-spin mr-2" />
													Uploading...
												</>
											) : (
												<>
													<Upload className="h-4 w-4 mr-2" />
													Upload
												</>
											)}
										</Button>
									)}
								</div>

								{signatureFile && (
									<p className="text-xs text-muted-foreground">
										Selected: {signatureFile.name}
									</p>
								)}
							</div>
						)}
					</div>

					{/* Official Info */}
					<div className="p-4 border rounded-lg bg-blue-50">
						<Label className="text-sm font-medium">Signing Official</Label>
						<div className="mt-2">
							<p className="text-sm font-semibold">{officialInfo.name}</p>
							<p className="text-xs text-muted-foreground">
								{officialInfo.position}
							</p>
						</div>
					</div>

					{/* PDF Actions */}
					{pdfBlob && (
						<div className="space-y-4 border rounded-lg p-4 bg-gray-50">
							<div>
								<h3 className="text-lg font-semibold">Certificate Ready</h3>
								<p className="text-xs text-muted-foreground">
									The PDF has been generated successfully. You can print it
									or download it to your device.
								</p>
							</div>
							<div className="flex gap-3">
								<Button
									onClick={handlePrint}
									variant="outline"
									className="flex-1"
								>
									<FileText className="h-4 w-4 mr-2" />
									Print Certificate
								</Button>
								<Button onClick={handleDownload} className="flex-1">
									<Download className="h-4 w-4 mr-2" />
									Download PDF
								</Button>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleGeneratePDF} disabled={isGenerating}>
						{isGenerating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Generating PDF...
							</>
						) : (
							<>
								<FileText className="h-4 w-4 mr-2" />
								Generate PDF
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
