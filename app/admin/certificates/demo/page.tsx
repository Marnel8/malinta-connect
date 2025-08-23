"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CertificateGeneratorModal } from "@/components/admin/certificate-generator-modal";
import { SignatureManagement } from "@/components/admin/signature-management";
import { type Certificate } from "@/app/actions/certificates";
import { FileText, Download } from "lucide-react";

// Sample certificate data for testing
const sampleCertificate: Certificate = {
	id: "CERT-2025-0115-001",
	type: "Certificate of Indigency",
	requestedBy: "MARASE, CHRISTINA C.",
	emailToNotify: "christina.marase@example.com",
	requestedOn: "January 15, 2025",
	status: "ready",
	purpose: "Legal purposes",
	age: "25",
	address: "Brgy. Malinta, Los Baños, Laguna",
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

export default function CertificateDemoPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [certificate, setCertificate] =
		useState<Certificate>(sampleCertificate);

	const handleCertificateUpdated = () => {
		// In a real scenario, this would refetch the certificate data
		console.log("Certificate updated");
	};

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">
					Certificate Generation Demo
				</h1>
				<p className="text-muted-foreground mt-2">
					Test the certificate generation feature with sample data
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Certificate Preview Card */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<FileText className="h-5 w-5" />
							Sample Certificate
						</CardTitle>
						<CardDescription>
							Certificate of Indigency ready for generation
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="font-medium">Reference:</span>
								<p className="text-muted-foreground">{certificate.id}</p>
							</div>
							<div>
								<span className="font-medium">Type:</span>
								<p className="text-muted-foreground">{certificate.type}</p>
							</div>
							<div>
								<span className="font-medium">Requested By:</span>
								<p className="text-muted-foreground">
									{certificate.requestedBy}
								</p>
							</div>
							<div>
								<span className="font-medium">Purpose:</span>
								<p className="text-muted-foreground">{certificate.purpose}</p>
							</div>
						</div>

						<Button onClick={() => setIsModalOpen(true)} className="w-full">
							<Download className="h-4 w-4 mr-2" />
							Generate Certificate
						</Button>
					</CardContent>
				</Card>

				{/* Signature Management */}
				<SignatureManagement
					certificateId={certificate.id}
					onSignatureUploaded={(signatureUrl) => {
						setCertificate((prev) => ({
							...prev,
							signatureUrl,
							hasSignature: true,
						}));
					}}
				/>
			</div>

			{/* Certificate Generator Modal */}
			<CertificateGeneratorModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				certificate={certificate}
				onCertificateUpdated={handleCertificateUpdated}
			/>
		</div>
	);
}



