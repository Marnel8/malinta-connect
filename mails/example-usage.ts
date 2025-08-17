import { sendEmail, sendTemplatedEmail, verifySMTPConnection } from "./index";

// Example 1: Send a simple email
export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
	const htmlContent = `
    <h1>Welcome to Malinta Connect!</h1>
    <p>Hello ${userName},</p>
    <p>Thank you for joining our community. We're excited to have you on board!</p>
    <p>Best regards,<br>The Malinta Connect Team</p>
  `;

	return await sendEmail({
		to: userEmail,
		subject: "Welcome to Malinta Connect",
		html: htmlContent,
	});
};

// Example 2: Send a templated email
export const sendAppointmentConfirmation = async (
	userEmail: string,
	appointmentData: any
) => {
	const template = `
    <h1>Appointment Confirmed</h1>
    <p>Hello {{userName}},</p>
    <p>Your appointment has been confirmed for {{appointmentDate}} at {{appointmentTime}}.</p>
    <p>Location: {{location}}</p>
    <p>Reference Number: {{referenceNumber}}</p>
    <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
    <p>Best regards,<br>The Malinta Connect Team</p>
  `;

	const variables = {
		userName: appointmentData.userName,
		appointmentDate: appointmentData.date,
		appointmentTime: appointmentData.time,
		location: appointmentData.location,
		referenceNumber: appointmentData.referenceNumber,
	};

	return await sendTemplatedEmail(
		userEmail,
		"Appointment Confirmation",
		template,
		variables
	);
};

// Example 3: Send to multiple recipients
export const sendAnnouncement = async (
	recipients: string[],
	announcement: string
) => {
	const htmlContent = `
    <h1>Important Announcement</h1>
    <p>${announcement}</p>
    <p>Best regards,<br>The Malinta Connect Team</p>
  `;

	return await sendEmail({
		to: recipients,
		subject: "Important Announcement",
		html: htmlContent,
	});
};

// Example 4: Verify SMTP connection (useful for testing)
export const testEmailConnection = async () => {
	try {
		const isConnected = await verifySMTPConnection();
		if (isConnected) {
			console.log("✅ SMTP connection successful");
			return true;
		} else {
			console.log("❌ SMTP connection failed");
			return false;
		}
	} catch (error) {
		console.error("Error testing SMTP connection:", error);
		return false;
	}
};
