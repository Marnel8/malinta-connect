import {
	sendCertificatePendingEmail,
	sendCertificateProcessingEmail,
	sendCertificateReadyEmail,
	sendCertificateRejectedEmail,
	sendCertificateAdditionalInfoEmail,
	sendCertificateStatusEmail,
} from "./index";

// Example 1: Send pending email when certificate request is first submitted
export const sendPendingNotification = async (userEmail: string) => {
	const certificateData = {
		userName: "Juan Dela Cruz",
		referenceNumber: "CERT-2024-001",
		certificateType: "Barangay Clearance",
		requestDate: "January 15, 2024",
		purpose: "Employment requirement",
		additionalRequirements: ["Valid ID", "Residence Certificate"],
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
	};

	return await sendCertificatePendingEmail(userEmail, certificateData);
};

// Example 2: Send processing email when certificate request moves to processing
export const sendProcessingNotification = async (userEmail: string) => {
	const certificateData = {
		userName: "Juan Dela Cruz",
		referenceNumber: "CERT-2024-001",
		certificateType: "Barangay Clearance",
		requestDate: "January 15, 2024",
		purpose: "Employment requirement",
		additionalRequirements: ["Valid ID", "Residence Certificate"],
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
		processingStartDate: "January 16, 2024",
		estimatedCompletionDate: "January 20, 2024",
		estimatedDays: "3-5",
	};

	return await sendCertificateProcessingEmail(userEmail, certificateData);
};

// Example 3: Send ready email when certificate is approved and ready for pickup
export const sendReadyNotification = async (userEmail: string) => {
	const certificateData = {
		userName: "Juan Dela Cruz",
		referenceNumber: "CERT-2024-001",
		certificateType: "Barangay Clearance",
		requestDate: "January 15, 2024",
		purpose: "Employment requirement",
		additionalRequirements: ["Valid ID", "Residence Certificate"],
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
		approvalDate: "January 19, 2024",
		processingTime: "4",
		pickupLocation: "Malinta Barangay Hall, Main Office",
		pickupHours: "8:00 AM - 5:00 PM",
	};

	return await sendCertificateReadyEmail(userEmail, certificateData);
};

// Example 4: Generic function to send status update emails
export const sendStatusUpdate = async (
	userEmail: string,
	status: "pending" | "processing" | "ready",
	certificateData: any
) => {
	return await sendCertificateStatusEmail(userEmail, status, certificateData);
};

// Example 5: Send emails for different certificate types
export const sendCertificateTypeExamples = async (userEmail: string) => {
	// Barangay Clearance
	const barangayClearanceData = {
		userName: "Maria Santos",
		referenceNumber: "CERT-2024-002",
		certificateType: "Barangay Clearance",
		requestDate: "January 20, 2024",
		purpose: "Business permit renewal",
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
	};

	// Indigency Certificate
	const indigencyData = {
		userName: "Pedro Reyes",
		referenceNumber: "CERT-2024-003",
		certificateType: "Indigency Certificate",
		requestDate: "January 22, 2024",
		purpose: "Educational assistance",
		additionalRequirements: ["Income Certificate", "Family Picture"],
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
	};

	// Send pending emails for both
	const results = await Promise.all([
		sendCertificatePendingEmail(userEmail, barangayClearanceData),
		sendCertificatePendingEmail(userEmail, indigencyData),
	]);

	return results.every((result) => result === true);
};

// Example 6: Batch send status updates
export const sendBatchStatusUpdates = async (
	certificateRequests: Array<{
		userEmail: string;
		status: "pending" | "processing" | "ready";
		data: any;
	}>
) => {
	const results = await Promise.all(
		certificateRequests.map((request) =>
			sendCertificateStatusEmail(
				request.userEmail,
				request.status,
				request.data
			)
		)
	);

	const successCount = results.filter((result) => result === true).length;
	const totalCount = results.length;

	console.log(`Sent ${successCount} out of ${totalCount} emails successfully`);
	return { successCount, totalCount, results };
};

// Example 7: Send email with custom contact information
export const sendCustomContactEmail = async (userEmail: string) => {
	const certificateData = {
		userName: "Ana Garcia",
		referenceNumber: "CERT-2024-004",
		certificateType: "Residence Certificate",
		requestDate: "January 25, 2024",
		purpose: "Voter registration",
		contactPhone: "+63 998 765 4321", // Custom phone
		contactEmail: "customerservice@malinta-connect.com", // Custom email
	};

	return await sendCertificatePendingEmail(userEmail, certificateData);
};

// Example 8: Send rejection email
export const sendRejectionNotification = async (userEmail: string) => {
	const certificateData = {
		userName: "Carlos Rodriguez",
		referenceNumber: "CERT-2024-005",
		certificateType: "Business Permit",
		requestDate: "January 28, 2024",
		purpose: "Business registration",
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
		rejectedReason: "Incomplete business documentation. Please provide valid business registration and tax clearance.",
	};

	return await sendCertificateRejectedEmail(userEmail, certificateData);
};

// Example 9: Send additional info request email
export const sendAdditionalInfoRequest = async (userEmail: string) => {
	const certificateData = {
		userName: "Maria Santos",
		referenceNumber: "CERT-2024-006",
		certificateType: "Indigency Certificate",
		requestDate: "January 30, 2024",
		purpose: "Educational assistance",
		contactPhone: "+63 912 345 6789",
		contactEmail: "info@malinta-connect.com",
		additionalInfoRequest: "Please provide income certificate from BIR and family picture for verification purposes.",
	};

	return await sendCertificateAdditionalInfoEmail(userEmail, certificateData);
};
