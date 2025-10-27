import nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

// Email configuration interface
interface EmailConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

// Email content interface
interface EmailContent {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
	from?: string;
}

// Certificate request data interface
interface CertificateRequestData {
	userName: string;
	referenceNumber: string;
	certificateType: string;
	requestDate: string;
	purpose: string;
	additionalRequirements?: string[];
	contactPhone?: string;
	contactEmail?: string;
}

// Certificate processing data interface
interface CertificateProcessingData extends CertificateRequestData {
	processingStartDate: string;
	estimatedCompletionDate: string;
	estimatedDays: string;
}

// Certificate ready data interface
interface CertificateReadyData extends CertificateRequestData {
	approvalDate: string;
	processingTime: string;
	pickupLocation: string;
	pickupHours: string;
}

// Create transporter using environment variables
const createTransporter = (): nodemailer.Transporter => {
	const config: EmailConfig = {
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: parseInt(process.env.SMTP_PORT || "587"),
		secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_USER || "",
			pass: process.env.SMTP_PASS || "",
		},
	};

	console.log("Creating SMTP transporter with config:", {
		host: config.host,
		port: config.port,
		secure: config.secure,
		user: config.auth.user ? "***configured***" : "***missing***",
		pass: config.auth.pass ? "***configured***" : "***missing***",
	});

	// Validate required environment variables
	if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
		throw new Error(
			"SMTP_USER and SMTP_PASS environment variables are required"
		);
	}

	return nodemailer.createTransport(config);
};

// Default from email
const getDefaultFromEmail = (): string => {
	return (
		process.env.SMTP_FROM ||
		process.env.SMTP_USER ||
		"noreply@malinta-connect.com"
	);
};

// Read EJS template file
const readTemplate = (templateName: string): string => {
	const templatePath = path.join(
		process.cwd(),
		"mails",
		"templates",
		`${templateName}.ejs`
	);
	try {
		return fs.readFileSync(templatePath, "utf8");
	} catch (error) {
		console.error(`Error reading template ${templateName}:`, error);
		throw new Error(`Template ${templateName} not found`);
	}
};

// Render EJS template with variables
const renderTemplate = (
	template: string,
	variables: Record<string, any>
): string => {
	let html = template;

	// Replace EJS variables
	Object.entries(variables).forEach(([key, value]) => {
		const regex = new RegExp(`<%= ${key} %>`, "g");
		if (typeof value === "string") {
			html = html.replace(regex, value);
		} else if (Array.isArray(value)) {
			html = html.replace(regex, value.join(", "));
		} else if (value !== null && value !== undefined) {
			html = html.replace(regex, String(value));
		}
	});

	// Handle conditional EJS blocks
	html = html.replace(
		/<% if \(([^)]+)\) { %>([\s\S]*?)<% } %>/g,
		(match, condition, content) => {
			const key = condition.trim();
			const value = variables[key];
			if (value && (Array.isArray(value) ? value.length > 0 : value)) {
				return content;
			}
			return "";
		}
	);

	return html;
};

// Send email function
export const sendEmail = async (
	emailContent: EmailContent
): Promise<boolean> => {
	try {
		console.log("sendEmail called with:", {
			to: emailContent.to,
			subject: emailContent.subject,
			from: emailContent.from || getDefaultFromEmail(),
			htmlLength: emailContent.html?.length || 0,
		});

		const transporter = createTransporter();

		const mailOptions = {
			from: emailContent.from || getDefaultFromEmail(),
			to: emailContent.to,
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text || emailContent.html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
		};

		console.log("Sending mail with options:", {
			from: mailOptions.from,
			to: mailOptions.to,
			subject: mailOptions.subject,
			htmlLength: mailOptions.html?.length || 0,
		});

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent successfully:", info.messageId);
		return true;
	} catch (error) {
		console.error("Error sending email:", error);
		return false;
	}
};

// Send email with template
export const sendTemplatedEmail = async (
	to: string | string[],
	subject: string,
	template: string,
	variables: Record<string, string> = {}
): Promise<boolean> => {
	try {
		// Replace variables in template
		let htmlContent = template;
		Object.entries(variables).forEach(([key, value]) => {
			htmlContent = htmlContent.replace(new RegExp(`{{${key}}}`, "g"), value);
		});

		return await sendEmail({
			to,
			subject,
			html: htmlContent,
		});
	} catch (error) {
		console.error("Error sending templated email:", error);
		return false;
	}
};

// Send certificate pending email
export const sendCertificatePendingEmail = async (
	to: string,
	data: CertificateRequestData
): Promise<boolean> => {
	try {
		const template = readTemplate("certificate-pending");
		const html = renderTemplate(template, data);

		return await sendEmail({
			to,
			subject: `Certificate Request Pending - ${data.referenceNumber}`,
			html,
		});
	} catch (error) {
		console.error("Error sending certificate pending email:", error);
		return false;
	}
};

// Send certificate processing email
export const sendCertificateProcessingEmail = async (
	to: string,
	data: CertificateProcessingData
): Promise<boolean> => {
	try {
		const template = readTemplate("certificate-processing");
		const html = renderTemplate(template, data);

		return await sendEmail({
			to,
			subject: `Certificate Processing - ${data.referenceNumber}`,
			html,
		});
	} catch (error) {
		console.error("Error sending certificate processing email:", error);
		return false;
	}
};

// Send certificate ready email
export const sendCertificateReadyEmail = async (
	to: string,
	data: CertificateReadyData
): Promise<boolean> => {
	try {
		const template = readTemplate("certificate-approved");
		const html = renderTemplate(template, data);

		return await sendEmail({
			to,
			subject: `Certificate Ready for Pickup - ${data.referenceNumber}`,
			html,
		});
	} catch (error) {
		console.error("Error sending certificate ready email:", error);
		return false;
	}
};

// Send certificate rejected email
export const sendCertificateRejectedEmail = async (
	to: string,
	data: CertificateRequestData & { rejectedReason: string }
): Promise<boolean> => {
	try {
		const template = readTemplate("certificate-rejected");
		const html = renderTemplate(template, data);

		return await sendEmail({
			to,
			subject: `Certificate Request Rejected - ${data.referenceNumber}`,
			html,
		});
	} catch (error) {
		console.error("Error sending certificate rejected email:", error);
		return false;
	}
};

// Send certificate additional info email
export const sendCertificateAdditionalInfoEmail = async (
	to: string,
	data: CertificateRequestData & { additionalInfoRequest: string }
): Promise<boolean> => {
	try {
		console.log("sendCertificateAdditionalInfoEmail called with:", {
			to,
			data,
		});
		const template = readTemplate("certificate-additional-info");
		const html = renderTemplate(template, data);
		console.log("Template rendered successfully, HTML length:", html.length);

		const result = await sendEmail({
			to,
			subject: `Additional Information Required - ${data.referenceNumber}`,
			html,
		});
		console.log("Email send result:", result);
		return result;
	} catch (error) {
		console.error("Error sending certificate additional info email:", error);
		return false;
	}
};

// Send certificate status update email (generic function)
export const sendCertificateStatusEmail = async (
	to: string,
	status: "pending" | "processing" | "ready" | "rejected" | "additionalInfo",
	data:
		| CertificateRequestData
		| CertificateProcessingData
		| CertificateReadyData
		| (CertificateRequestData & { rejectedReason: string })
		| (CertificateRequestData & { additionalInfoRequest: string })
): Promise<boolean> => {
	try {
		switch (status) {
			case "pending":
				return await sendCertificatePendingEmail(
					to,
					data as CertificateRequestData
				);
			case "processing":
				return await sendCertificateProcessingEmail(
					to,
					data as CertificateProcessingData
				);
			case "ready":
				return await sendCertificateReadyEmail(
					to,
					data as CertificateReadyData
				);
			case "rejected":
				return await sendCertificateRejectedEmail(
					to,
					data as CertificateRequestData & { rejectedReason: string }
				);
			case "additionalInfo":
				return await sendCertificateAdditionalInfoEmail(
					to,
					data as CertificateRequestData & { additionalInfoRequest: string }
				);
			default:
				throw new Error(`Invalid status: ${status}`);
		}
	} catch (error) {
		console.error(`Error sending certificate ${status} email:`, error);
		return false;
	}
};

// Verify SMTP connection
export const verifySMTPConnection = async (): Promise<boolean> => {
	try {
		const transporter = createTransporter();
		await transporter.verify();
		console.log("SMTP connection verified successfully");
		return true;
	} catch (error) {
		console.error("SMTP connection verification failed:", error);
		return false;
	}
};

// Get transporter instance (useful for advanced configurations)
export const getTransporter = (): nodemailer.Transporter => {
	return createTransporter();
};

// Close transporter (useful for cleanup)
export const closeTransporter = async (): Promise<void> => {
	try {
		const transporter = createTransporter();
		await transporter.close();
		console.log("Transporter closed successfully");
	} catch (error) {
		console.error("Error closing transporter:", error);
	}
};

// Appointment email data interface
export interface AppointmentEmailData {
	userName: string;
	referenceNumber: string;
	appointmentTitle: string;
	appointmentDate: string;
	appointmentTime: string;
	purpose: string;
	contactPhone?: string;
	contactEmail?: string;
	notes?: string;
}

export const sendAppointmentRequestReceivedEmail = async (
	to: string,
	data: AppointmentEmailData
): Promise<boolean> => {
	try {
		const template = readTemplate("appointment-request-received");
		const html = renderTemplate(template, data);
		return await sendEmail({
			to,
			subject: `Appointment Request Received - ${data.referenceNumber}`,
			html,
		});
	} catch (error) {
		console.error("Error sending appointment request email:", error);
		return false;
	}
};

export const sendAppointmentStatusEmail = async (
	to: string,
	status: "pending" | "confirmed" | "cancelled" | "completed",
	data: AppointmentEmailData
): Promise<boolean> => {
	try {
		let templateName = "";
		let subject = "";
		switch (status) {
			case "pending":
				templateName = "appointment-request-received";
				subject = `Appointment Request Received - ${data.referenceNumber}`;
				break;
			case "confirmed":
				templateName = "appointment-confirmed";
				subject = `Appointment Confirmed - ${data.referenceNumber}`;
				break;
			case "cancelled":
				templateName = "appointment-cancelled";
				subject = `Appointment Cancelled - ${data.referenceNumber}`;
				break;
			case "completed":
				templateName = "appointment-completed";
				subject = `Appointment Completed - ${data.referenceNumber}`;
				break;
			default:
				templateName = "appointment-request-received";
				subject = `Appointment Update - ${data.referenceNumber}`;
		}

		const template = readTemplate(templateName);
		const html = renderTemplate(template, data);
		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending appointment status email:", error);
		return false;
	}
};

// Blotter email data interface
export interface BlotterEmailData {
	userName: string;
	referenceNumber: string;
	reportType: string;
	dateReported: string;
	location?: string;
	description: string;
	notes?: string;
	contactPhone?: string;
	contactEmail?: string;
}

export const sendBlotterStatusEmail = async (
	to: string,
	status:
		| "pending"
		| "investigating"
		| "additionalInfo"
		| "resolved"
		| "closed",
	data: BlotterEmailData
): Promise<boolean> => {
	try {
		let subject = "";
		let intro = "";
		switch (status) {
			case "pending":
				subject = `Blotter Report Received - ${data.referenceNumber}`;
				intro = "Your blotter report has been received and is pending review.";
				break;
			case "investigating":
				subject = `Blotter Report Under Investigation - ${data.referenceNumber}`;
				intro = "Your blotter report is now under investigation.";
				break;
			case "additionalInfo":
				subject = `Additional Information Requested - ${data.referenceNumber}`;
				intro =
					"We require additional information to proceed with your blotter report.";
				break;
			case "resolved":
				subject = `Blotter Report Resolved - ${data.referenceNumber}`;
				intro = "Your blotter report has been resolved.";
				break;
			case "closed":
				subject = `Blotter Report Closed - ${data.referenceNumber}`;
				intro = "Your blotter case has been closed.";
				break;
			default:
				subject = `Blotter Report Update - ${data.referenceNumber}`;
				intro = "There is an update regarding your blotter report.";
		}

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827">
				<h2 style="margin: 0 0 12px 0;">${intro}</h2>
				<p style="margin: 0 0 8px 0;">Hello ${data.userName},</p>
				<p style="margin: 0 0 16px 0;">Reference Number: <strong>${
					data.referenceNumber
				}</strong></p>
				<table style="width: 100%; border-collapse: collapse;">
					<tr>
						<td style="padding: 6px 0; width: 160px; color: #6B7280;">Report Type</td>
						<td style="padding: 6px 0;">${data.reportType}</td>
					</tr>
					<tr>
						<td style="padding: 6px 0; color: #6B7280;">Date Reported</td>
						<td style="padding: 6px 0;">${data.dateReported}</td>
					</tr>
					${
						data.location
							? `<tr><td style="padding: 6px 0; color: #6B7280;">Location</td><td style=\"padding: 6px 0;\">${data.location}</td></tr>`
							: ""
					}
					<tr>
						<td style="padding: 6px 0; color: #6B7280;">Description</td>
						<td style="padding: 6px 0;">${data.description}</td>
					</tr>
					${
						data.notes
							? `<tr><td style="padding: 6px 0; color: #6B7280;">Notes</td><td style=\"padding: 6px 0;\">${data.notes}</td></tr>`
							: ""
					}
				</table>
				<p style="margin: 16px 0 0 0; font-size: 12px; color: #6B7280;">If you have questions, reply to this email or contact us at ${
					data.contactEmail ||
					process.env.CONTACT_EMAIL ||
					"info@malinta-connect.com"
				}.</p>
			</div>
		`;

		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending blotter status email:", error);
		return false;
	}
};

// Verification email data interface
export interface VerificationEmailData {
	residentName: string;
	email: string;
	verificationDate: string;
	notes?: string;
	contactPhone?: string;
	contactEmail?: string;
}

// Send account verified email
export const sendAccountVerifiedEmail = async (
	to: string,
	data: VerificationEmailData
): Promise<boolean> => {
	try {
		const template = readTemplate("account-verified");
		const subject = "Account Verified - Welcome to Malinta Connect";
		const html = renderTemplate(template, data);
		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending account verified email:", error);
		return false;
	}
};

// Send account rejected email
export const sendAccountRejectedEmail = async (
	to: string,
	data: VerificationEmailData
): Promise<boolean> => {
	try {
		const template = readTemplate("account-rejected");
		const subject = "Account Verification Update - Action Required";
		const html = renderTemplate(template, data);
		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending account rejected email:", error);
		return false;
	}
};

// Send verification status email (generic function)
export const sendVerificationStatusEmail = async (
	to: string,
	status: "verified" | "rejected",
	data: VerificationEmailData
): Promise<boolean> => {
	try {
		switch (status) {
			case "verified":
				return await sendAccountVerifiedEmail(to, data);
			case "rejected":
				return await sendAccountRejectedEmail(to, data);
			default:
				throw new Error(`Invalid status: ${status}`);
		}
	} catch (error) {
		console.error(`Error sending verification ${status} email:`, error);
		return false;
	}
};