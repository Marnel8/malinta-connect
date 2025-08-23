"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Plus } from "lucide-react";
import { uploadSignatureAction } from "@/app/actions/certificates";

interface SignatureItem {
	id: string;
	name: string;
	position: string;
	signatureUrl: string;
	uploadedOn: string;
}

interface SignatureManagementProps {
	certificateId?: string;
	onSignatureUploaded?: (signatureUrl: string) => void;
}

export function SignatureManagement({
	certificateId,
	onSignatureUploaded,
}: SignatureManagementProps) {
	const { toast } = useToast();
	const [isUploading, setIsUploading] = useState(false);
	const [signatures, setSignatures] = useState<SignatureItem[]>([
		{
			id: "default",
			name: "HON. JESUS H. DE UNA JR.",
			position: "Punong Barangay",
			signatureUrl: "/images/e-sig.png", // Default signature
			uploadedOn: "System Default",
		},
	]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleSignatureUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Error",
				description: "Please select an image file",
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

		setIsUploading(true);
		try {
			if (certificateId) {
				// Upload signature for specific certificate
				const result = await uploadSignatureAction(certificateId, file);

				if (result.success && result.signatureUrl) {
					toast({
						title: "Success",
						description: "Signature uploaded successfully",
					});

					if (onSignatureUploaded) {
						onSignatureUploaded(result.signatureUrl);
					}
				} else {
					toast({
						title: "Error",
						description: result.error || "Failed to upload signature",
						variant: "destructive",
					});
				}
			} else {
				// General signature upload for signature library
				// This would require additional implementation for storing signatures
				toast({
					title: "Info",
					description: "General signature management coming soon",
				});
			}
		} catch (error) {
			console.error("Error uploading signature:", error);
			toast({
				title: "Error",
				description: "Failed to upload signature",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Upload className="h-5 w-5" />
					Signature Management
				</CardTitle>
				<CardDescription>
					{certificateId
						? "Upload a signature for this certificate"
						: "Manage official signatures for certificates"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Upload New Signature */}
				<div className="space-y-2">
					<Label htmlFor="signature-upload">Upload Signature</Label>
					<div className="flex items-center gap-2">
						<Input
							ref={fileInputRef}
							id="signature-upload"
							type="file"
							accept="image/*"
							onChange={handleSignatureUpload}
							disabled={isUploading}
							className="flex-1"
						/>
						<Button
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
							size="sm"
						>
							{isUploading ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Uploading...
								</>
							) : (
								<>
									<Plus className="h-4 w-4 mr-2" />
									Select
								</>
							)}
						</Button>
					</div>
					<p className="text-xs text-muted-foreground">
						Supported formats: PNG, JPG, JPEG. Max size: 5MB
					</p>
				</div>

				{/* Available Signatures */}
				{!certificateId && (
					<div className="space-y-2">
						<Label>Available Signatures</Label>
						<div className="space-y-2">
							{signatures.map((signature) => (
								<div
									key={signature.id}
									className="flex items-center justify-between p-3 border rounded-lg"
								>
									<div className="flex items-center gap-3">
										<img
											src={signature.signatureUrl}
											alt={`${signature.name} signature`}
											className="h-12 w-auto border rounded"
											onError={(e) => {
												e.currentTarget.style.display = "none";
											}}
										/>
										<div>
											<p className="font-medium text-sm">{signature.name}</p>
											<p className="text-xs text-muted-foreground">
												{signature.position}
											</p>
											<p className="text-xs text-muted-foreground">
												Uploaded: {signature.uploadedOn}
											</p>
										</div>
									</div>
									{signature.id !== "default" && (
										<Button
											variant="ghost"
											size="sm"
											className="text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}



