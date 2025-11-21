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

export interface PasswordResetEmailData {
	residentName?: string;
	email: string;
	resetLink: string;
	expiresInHours?: string;
	supportEmail?: string;
}

// Create transporter using environment variables
const createTransporter = (): nodemailer.Transporter => {
	// Remove spaces from password (Gmail App Passwords should not have spaces)
	const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
	const smtpUser = (process.env.SMTP_USER || "").trim();

	const config: EmailConfig = {
		host: process.env.SMTP_HOST || "smtp.gmail.com",
		port: parseInt(process.env.SMTP_PORT || "587"),
		secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
		auth: {
			user: smtpUser,
			pass: smtpPass,
		},
	};

	console.log("Creating SMTP transporter with config:", {
		host: config.host,
		port: config.port,
		secure: config.secure,
		user: config.auth.user ? "***configured***" : "***missing***",
		pass: config.auth.pass ? "***configured***" : "***missing***",
		passLength: config.auth.pass.length,
	});

	// Validate required environment variables
	if (!smtpUser || !smtpPass) {
		throw new Error(
			"SMTP_USER and SMTP_PASS environment variables are required"
		);
	}

	// Validate Gmail App Password format (should be 16 characters without spaces)
	if (config.host.includes("gmail.com") && smtpPass.length !== 16) {
		console.warn(
			`Warning: Gmail App Password should be 16 characters. Current length: ${smtpPass.length}. Make sure you're using an App Password, not your regular Gmail password.`
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

    // Replace EJS variables like <%= key %> (allowing whitespace around key)
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`<%=\\s*${key}\\s*%>`, "g");
        if (typeof value === "string") {
            html = html.replace(regex, value);
        } else if (Array.isArray(value)) {
            html = html.replace(regex, value.join(", "));
        } else if (value !== null && value !== undefined) {
            html = html.replace(regex, String(value));
        }
    });

    // Replace environment variable usages commonly used in templates
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";
    html = html.replace(
        /<%=\s*process\.env\.NEXT_PUBLIC_APP_URL\s*%>/g,
        appUrl
    );

    // First handle if-else blocks
    html = html.replace(
        /<%\s*if\s*\((.*?)\)\s*{\s*%>([\s\S]*?)<%\s*}\s*else\s*{\s*%>([\s\S]*?)<%\s*}\s*%>/g,
        (_match, condition, truthyContent, falsyContent) => {
            try {
                const argNames = Object.keys(variables);
                const argValues = Object.values(variables);
                const evaluator = new Function(
                    ...argNames,
                    `return (${condition});`
                );
                const result = evaluator(...argValues);
                return result ? truthyContent : falsyContent;
            } catch {
                return "";
            }
        }
    );

    // Then handle simple if blocks without else
    html = html.replace(
        /<%\s*if\s*\((.*?)\)\s*{\s*%>([\s\S]*?)<%\s*}\s*%>/g,
        (_match, condition, content) => {
            try {
                const argNames = Object.keys(variables);
                const argValues = Object.values(variables);
                const evaluator = new Function(
                    ...argNames,
                    `return (${condition});`
                );
                const result = evaluator(...argValues);
                return result ? content : "";
            } catch {
                return "";
            }
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
		| "readyForAppointment"
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
			case "readyForAppointment":
				subject = `Ready to Set Appointment - ${data.referenceNumber}`;
				intro = "Your blotter report is ready for appointment scheduling. Please contact us to set up an appointment.";
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

// Event email data interface
export interface EventEmailData {
	eventName: string;
	eventDate: string;
	eventTime: string;
	eventLocation: string;
	eventDescription: string;
	eventCategory: string;
	organizer: string;
	contact: string;
	referenceNumber?: string;
	contactPhone?: string;
	contactEmail?: string;
}

// Announcement email data interface
export interface AnnouncementEmailData {
	announcementTitle: string;
	announcementDescription: string;
	announcementCategory: string;
	author: string;
	publishedOn: string;
	expiresOn: string;
	referenceNumber?: string;
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

export const sendPasswordResetEmail = async (
	to: string,
	data: PasswordResetEmailData
): Promise<boolean> => {
	try {
		const template = readTemplate("password-reset");
		const html = renderTemplate(template, {
			residentName: data.residentName || data.email,
			email: data.email,
			resetLink: data.resetLink,
			expiresInHours: data.expiresInHours || "1",
			supportEmail:
				data.supportEmail ||
				process.env.SUPPORT_EMAIL ||
				process.env.CONTACT_EMAIL ||
				"support@barangay.gov",
			appUrl:
				process.env.NEXT_PUBLIC_APP_URL ||
				process.env.APP_URL ||
				"https://malinta-connect.vercel.app",
		});

		return await sendEmail({
			to,
			subject: "Reset your Malinta Connect password",
			html,
		});
	} catch (error) {
		console.error("Error sending password reset email:", error);
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

// Send event created email
export const sendEventCreatedEmail = async (
	to: string | string[],
	data: EventEmailData
): Promise<boolean> => {
	try {
		const formattedDate = new Date(data.eventDate).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827">
				<h2 style="margin: 0 0 12px 0;">New Community Event</h2>
				<p style="margin: 0 0 8px 0;">Hello,</p>
				<p style="margin: 0 0 16px 0;">A new community event has been created:</p>
				<div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
					<h3 style="margin: 0 0 12px 0; color: #1f2937;">${data.eventName}</h3>
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 6px 0; width: 160px; color: #6B7280;">Date</td>
							<td style="padding: 6px 0;">${formattedDate}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Time</td>
							<td style="padding: 6px 0;">${data.eventTime}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Location</td>
							<td style="padding: 6px 0;">${data.eventLocation}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Category</td>
							<td style="padding: 6px 0;">${data.eventCategory}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Organizer</td>
							<td style="padding: 6px 0;">${data.organizer}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Contact</td>
							<td style="padding: 6px 0;">${data.contact}</td>
						</tr>
					</table>
					<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
						<p style="margin: 0 0 8px 0; color: #6B7280; font-weight: 600;">Description:</p>
						<p style="margin: 0; color: #374151;">${data.eventDescription}</p>
					</div>
				</div>
				<p style="margin: 16px 0 0 0; font-size: 12px; color: #6B7280;">For more information, visit the events page or contact us at ${
					data.contactEmail ||
					process.env.CONTACT_EMAIL ||
					"info@malinta-connect.com"
				}.</p>
			</div>
		`;

		const subject = `New Event: ${data.eventName}`;
		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending event created email:", error);
		return false;
	}
};

// Send announcement created email
export const sendAnnouncementCreatedEmail = async (
	to: string | string[],
	data: AnnouncementEmailData
): Promise<boolean> => {
	try {
		const formattedPublishedDate = new Date(data.publishedOn).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		);
		const formattedExpiryDate = new Date(data.expiresOn).toLocaleDateString(
			"en-US",
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		);

		const html = `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827">
				<h2 style="margin: 0 0 12px 0;">New Announcement</h2>
				<p style="margin: 0 0 8px 0;">Hello,</p>
				<p style="margin: 0 0 16px 0;">A new announcement has been published:</p>
				<div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
					<h3 style="margin: 0 0 12px 0; color: #1f2937;">${data.announcementTitle}</h3>
					<table style="width: 100%; border-collapse: collapse;">
						<tr>
							<td style="padding: 6px 0; width: 160px; color: #6B7280;">Category</td>
							<td style="padding: 6px 0;">${data.announcementCategory}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Published On</td>
							<td style="padding: 6px 0;">${formattedPublishedDate}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Expires On</td>
							<td style="padding: 6px 0;">${formattedExpiryDate}</td>
						</tr>
						<tr>
							<td style="padding: 6px 0; color: #6B7280;">Author</td>
							<td style="padding: 6px 0;">${data.author}</td>
						</tr>
					</table>
					<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
						<p style="margin: 0 0 8px 0; color: #6B7280; font-weight: 600;">Details:</p>
						<p style="margin: 0; color: #374151;">${data.announcementDescription}</p>
					</div>
				</div>
				<p style="margin: 16px 0 0 0; font-size: 12px; color: #6B7280;">For more information, visit the announcements page or contact us at ${
					data.contactEmail ||
					process.env.CONTACT_EMAIL ||
					"info@malinta-connect.com"
				}.</p>
			</div>
		`;

		const subject = `New Announcement: ${data.announcementTitle}`;
		return await sendEmail({ to, subject, html });
	} catch (error) {
		console.error("Error sending announcement created email:", error);
		return false;
	}
};