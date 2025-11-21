import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import {
	sendAppointmentRequestReceivedEmail,
	sendAppointmentStatusEmail,
	type AppointmentEmailData,
	sendBlotterStatusEmail,
	type BlotterEmailData,
} from "@/mails";

async function run() {
	const appointmentData: AppointmentEmailData = {
		userName: "Test Resident",
		referenceNumber: "APT-TEST-0001",
		appointmentTitle: "Test Appointment",
		appointmentDate: "2025-05-01",
		appointmentTime: "10:00 AM",
		purpose: "Testing email flow",
		contactPhone: "+63 900 000 0000",
		contactEmail: "resident@example.com",
		notes: "Debug run",
	};

	const blotterData: BlotterEmailData = {
		userName: "Test Resident",
		referenceNumber: "BLT-TEST-0001",
		reportType: "Test Report",
		dateReported: "2025-05-01",
		description: "Debug description",
		notes: "Debug run",
		contactEmail: "resident@example.com",
	};

	console.log("Sending appointment request email...");
	const requestResult = await sendAppointmentRequestReceivedEmail(
		process.env.SMTP_USER || "tiomarone02@gmail.com",
		appointmentData
	);
	console.log("Appointment request email result:", requestResult);

	console.log("Sending appointment confirmed email...");
	const confirmedResult = await sendAppointmentStatusEmail(
		process.env.SMTP_USER || "tiomarone02@gmail.com",
		"confirmed",
		appointmentData
	);
	console.log("Appointment confirmed email result:", confirmedResult);

	console.log("Sending blotter email...");
	const blotterResult = await sendBlotterStatusEmail(
		process.env.SMTP_USER || "tiomarone02@gmail.com",
		"pending",
		blotterData
	);
	console.log("Blotter email result:", blotterResult);
}

run().catch((error) => {
	console.error("Debug email script failed:", error);
	process.exit(1);
});



