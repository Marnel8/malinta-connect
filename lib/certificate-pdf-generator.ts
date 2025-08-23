"use client";

import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";

export interface CertificateData {
	id: string;
	type: string;
	requestedBy: string;
	purpose: string;
	age?: string;
	address?: string;
	generatedOn: string;
	signatureUrl?: string;
	hasSignature?: boolean;
}

export interface OfficialInfo {
	name: string;
	position: string;
}

// Helper function to get ordinal suffix
function getOrdinalSuffix(day: number): string {
	if (day >= 11 && day <= 13) {
		return "th";
	}
	switch (day % 10) {
		case 1:
			return "st";
		case 2:
			return "nd";
		case 3:
			return "rd";
		default:
			return "th";
	}
}

// Generate PDF from certificate data using pdf-lib
export async function generateCertificatePDF(
	certificateData: CertificateData,
	officialInfo: OfficialInfo
): Promise<{ success: boolean; pdfBlob?: Blob; error?: string }> {
	try {
		// Create a new PDF document
		const pdfDoc = await PDFDocument.create();

		// Add a page (Letter size: 8.5 x 11 inches)
		const page = pdfDoc.addPage([612, 792]); // 8.5" x 11" in points (72 DPI)

		// Embed fonts
		const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
		const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
		const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

		// Page dimensions
		const { width, height } = page.getSize();
		const margin = 36; // 0.5 inches
		const sidebarWidth = 130; // 1.8 inches

		// Colors
		const black = rgb(0, 0, 0);
		const blue = rgb(0.39, 0.4, 0.95); // #6366f1
		const white = rgb(1, 1, 1);

		// ========================================
		// PART 1: HEADER SECTION
		// ========================================

		// Draw main border (thick black border)
		page.drawRectangle({
			x: margin,
			y: margin,
			width: width - 2 * margin,
			height: height - 2 * margin,
			borderColor: black,
			borderWidth: 3,
			color: white,
		});

		// Barangay seal placeholder (left side)
		page.drawRectangle({
			x: margin + 20,
			y: height - margin - 100,
			width: 80,
			height: 80,
			borderColor: black,
			borderWidth: 2,
		});

		// Draw circular seal outline
		const sealCenterX = margin + 60;
		const sealCenterY = height - margin - 60;
		const sealRadius = 35;

		// Draw seal circle (simulated with small rectangles)
		for (let angle = 0; angle < 360; angle += 10) {
			const x = sealCenterX + sealRadius * Math.cos((angle * Math.PI) / 180);
			const y = sealCenterY + sealRadius * Math.sin((angle * Math.PI) / 180);
			page.drawRectangle({
				x: x - 1,
				y: y - 1,
				width: 2,
				height: 2,
				color: black,
			});
		}

		// Header text (centered, exact positioning)
		const headerTexts = [
			"REPUBLIC OF THE PHILIPPINES",
			"PROVINCE OF LAGUNA",
			"MUNICIPALITY OF LOS BAÑOS",
			"BARANGAY MALINTA",
		];

		headerTexts.forEach((text, index) => {
			const textWidth = helveticaBold.widthOfTextAtSize(text, 11);
			page.drawText(text, {
				x: (width - textWidth) / 2,
				y: height - margin - 25 - index * 14,
				size: 11,
				font: helveticaBold,
				color: black,
			});
		});

		// Horizontal line under header
		page.drawRectangle({
			x: margin + 80,
			y: height - margin - 105,
			width: width - 2 * margin - 160,
			height: 2,
			color: black,
		});

		// Office title box (blue background, white text)
		const officeTitle = "OFFICE OF THE SANGGUNIANG BARANGAY";
		const titleWidth = helveticaBold.widthOfTextAtSize(officeTitle, 14);
		const titleBoxWidth = width - 2 * margin;
		const titleBoxHeight = 30;

		page.drawRectangle({
			x: margin,
			y: height - margin - 140,
			width: titleBoxWidth,
			height: titleBoxHeight,
			borderColor: black,
			borderWidth: 2,
			color: rgb(0.2, 0.3, 0.8), // Blue background
		});

		page.drawText(officeTitle, {
			x: (width - titleWidth) / 2,
			y: height - margin - 130,
			size: 14,
			font: helveticaBold,
			color: white, // White text on blue
		});

		// ========================================
		// PART 2: BLUE SIDEBAR
		// ========================================

		// Draw blue sidebar (exact color and positioning)
		const sidebarX = margin;
		const sidebarY = margin;
		const sidebarHeight = height - margin - 145; // From bottom of title box to footer

		page.drawRectangle({
			x: sidebarX,
			y: sidebarY + 45, // Start after footer space
			width: sidebarWidth,
			height: sidebarHeight,
			color: rgb(0.25, 0.35, 0.85), // Exact blue from image
		});

		// ========================================
		// PART 3: SIDEBAR CONTENT
		// ========================================

		// Sidebar content
		const sidebarContent = [
			{ text: "SANGGUNIANG BARANGAY", bold: true, center: true, size: 10 },
			{ text: "OF MALINTA", bold: true, center: true, size: 10 },
			{ text: "", size: 8 }, // Spacing
			{ text: "PUNONG BARANGAY", bold: true, size: 9 },
			{ text: "HON. JESUS H. DE UNA JR.", size: 9 },
			{ text: "", size: 8 }, // Spacing
			{ text: "BARANGAY KAGAWAD", bold: true, size: 9 },
			{ text: "HON. ROLANDO L. ERROBA", size: 9 },
			{ text: "HEALTH & EDUCATION", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. RANIE F. ANDAL", size: 9 },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. ERNESTO G.", size: 9 },
			{ text: "ALCANTARA", size: 9 },
			{ text: "ENVIRONMENTAL PROTECTION", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. ALLAN B. BIENES", size: 9 },
			{ text: "INFRASTRUCTURE", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. BENY S. MORALDE", size: 9 },
			{ text: "PEACE AND ORDER", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. SHERYL S. BAGNES", size: 9 },
			{ text: "WOMEN AND FAMILY", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. GAUDENCIO D.", size: 9 },
			{ text: "MARIANO", size: 9 },
			{ text: "LIVELIHOOD &", size: 8, italic: true },
			{ text: "COOPERATIVE DEVT /", size: 8, italic: true },
			{ text: "APPROPRIATIONS, WAYS &", size: 8, italic: true },
			{ text: "MEANS", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "HON. EDMUND LLOYD E.", size: 9 },
			{ text: "VELASCO", size: 9 },
			{ text: "SPORTS & YOUTH", size: 8, italic: true },
			{ text: "DEVELOPMENT", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "MS. RICHET E. TAKAHASHI", size: 9 },
			{ text: "SECRETARY", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "MS. JANE CAMILLE", size: 9 },
			{ text: "RETIRADO", size: 9 },
			{ text: "TREASURER", size: 8, italic: true },
			{ text: "", size: 8 }, // Spacing
			{ text: "MR. JEFFREY BONITA", size: 9 },
			{ text: "ADMIN", size: 8, italic: true },
		];

		// Sidebar text positioning (exact from image)
		let currentY = height - margin - 160; // Start below title box

		sidebarContent.forEach((item) => {
			if (item.text === "") {
				currentY -= 6; // Spacing
				return;
			}

			const font = item.bold ? helveticaBold : helveticaFont;
			const textWidth = font.widthOfTextAtSize(item.text, item.size);
			const x = item.center
				? margin + (sidebarWidth - textWidth) / 2
				: margin + 8; // Exact left margin

			page.drawText(item.text, {
				x,
				y: currentY,
				size: item.size,
				font: font,
				color: white,
			});

			currentY -= item.size + 3; // Exact line spacing
		});

		// ========================================
		// PART 4: MAIN CONTENT AREA
		// ========================================

		// Main content area (exact positioning from image)
		const contentX = margin + sidebarWidth + 15; // Closer to sidebar
		const contentWidth = width - contentX - margin - 15;

		// Draw content area border (thin black line)
		page.drawRectangle({
			x: contentX - 5,
			y: margin + 45,
			width: contentWidth + 10,
			height: height - margin - 190,
			borderColor: black,
			borderWidth: 2,
			color: white,
		});

		// ========================================
		// PART 5: CERTIFICATE TITLE
		// ========================================

		// Certificate title (exact from image)
		const titleLines = ["C E R T I F I C A T E", "O F", "I N D I G E N C Y"];
		let titleY = height - margin - 180; // Start position

		titleLines.forEach((line, index) => {
			const fontSize = line === "O F" ? 20 : 22; // Smaller "OF"
			const textWidth = timesBold.widthOfTextAtSize(line, fontSize);

			page.drawText(line, {
				x: contentX + (contentWidth - textWidth) / 2,
				y: titleY,
				size: fontSize,
				font: timesBold,
				color: black,
			});

			titleY -= line === "O F" ? 25 : 30; // Different spacing
		});

		// ========================================
		// PART 6: CERTIFICATE BODY TEXT
		// ========================================

		// Certificate body text
		const bodyTexts = [
			`This is to certify that ${certificateData.requestedBy.toUpperCase()} of legal age is a resident of Brgy. Malinta, Los Baños, Laguna. This certifies further that the name belongs to indigent families of this barangay.`,
			`This certification is being issued upon the request of above mentioned name as a requirement for whatever legal purpose it may serve to her.`,
			`Given this ${new Date().getDate()}${getOrdinalSuffix(
				new Date().getDate()
			)} day of ${new Date().toLocaleDateString("en-US", {
				month: "long",
			})}, ${new Date().getFullYear()}.`,
		];

		// Certificate body text (exact alignment from image)
		let bodyY = titleY - 50; // Start below title

		bodyTexts.forEach((text, index) => {
			// Split long text into lines with exact width
			const words = text.split(" ");
			const lines: string[] = [];
			let currentLine = "";
			const maxWidth = contentWidth - 30; // Text margins

			words.forEach((word) => {
				const testLine = currentLine + (currentLine ? " " : "") + word;
				const testWidth = timesFont.widthOfTextAtSize(testLine, 11);

				if (testWidth <= maxWidth) {
					currentLine = testLine;
				} else {
					if (currentLine) lines.push(currentLine);
					currentLine = word;
				}
			});
			if (currentLine) lines.push(currentLine);

			// Draw each line with exact spacing
			lines.forEach((line, lineIndex) => {
				page.drawText(line, {
					x: contentX + 15, // Left margin
					y: bodyY - lineIndex * 16, // Line height
					size: 11, // Exact font size from image
					font: timesFont,
					color: black,
				});
			});

			bodyY -= lines.length * 16 + 25; // Paragraph spacing
		});

		// ========================================
		// PART 7: SIGNATURE AREA
		// ========================================

		// Signature area (exact positioning from image)
		const signatureY = bodyY - 60;
		const signatureBoxWidth = 180;
		const signatureBoxHeight = 50;
		const signatureBoxX = contentX + contentWidth - signatureBoxWidth - 30;

		// Draw signature line (solid line, not dotted box)
		page.drawRectangle({
			x: signatureBoxX,
			y: signatureY + 20,
			width: signatureBoxWidth,
			height: 1,
			color: black,
		});

		// Signature text (exact positioning from image)
		const signatureName = officialInfo.name.toUpperCase();
		const signaturePosition = officialInfo.position;
		const signatureNameWidth = timesBold.widthOfTextAtSize(signatureName, 11);
		const signaturePosWidth = timesFont.widthOfTextAtSize(signaturePosition, 9);

		// Name above the line
		page.drawText(signatureName, {
			x: signatureBoxX + (signatureBoxWidth - signatureNameWidth) / 2,
			y: signatureY + 25,
			size: 11,
			font: timesBold,
			color: black,
		});

		// Position below the line
		page.drawText(signaturePosition, {
			x: signatureBoxX + (signatureBoxWidth - signaturePosWidth) / 2,
			y: signatureY + 5,
			size: 9,
			font: timesFont,
			color: black,
		});

		// ========================================
		// PART 8: FOOTER
		// ========================================

		// Footer (exact from image)
		const footerY = margin + 20;
		const footerHeight = 25;

		// Footer text (right-aligned, exact positioning)
		const footerTexts = [
			"ADDRESS:",
			"SAN LUIS AVENUE/PUROK 2, BARANGAY MALINTA/LOS BAÑOS, LAGUNA 4030",
			"TEL. NO. (049) 502-4396",
		];

		// Draw footer text (right-aligned)
		footerTexts.forEach((text, index) => {
			const fontSize = index === 0 ? 8 : 7; // Different sizes
			const font = index === 0 ? helveticaBold : helveticaFont;
			const textWidth = font.widthOfTextAtSize(text, fontSize);

			page.drawText(text, {
				x: width - margin - textWidth - 5,
				y: footerY + 15 - index * 8,
				size: fontSize,
				font: font,
				color: black,
			});
		});

		// Convert to blob
		const pdfBytes = await pdfDoc.save();
		const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

		return {
			success: true,
			pdfBlob,
		};
	} catch (error) {
		console.error("Error generating certificate PDF:", error);
		return {
			success: false,
			error: "Failed to generate certificate PDF",
		};
	}
}

// Preview certificate HTML (for modal display) - Exact match to PDF
export function createCertificatePreview(
	certificateData: CertificateData,
	officialInfo: OfficialInfo
): string {
	const currentDate = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return `
		<div id="certificate-container" style="
			width: 8.5in;
			height: 11in;
			padding: 0.5in;
			font-family: 'Helvetica', 'Arial', sans-serif;
			background: white;
			border: 3px solid #000;
			box-sizing: border-box;
			position: relative;
			margin: 0 auto;
			transform: scale(0.8);
			transform-origin: top center;
		">
			<!-- PART 1: HEADER SECTION -->
			<div style="
				position: relative;
				height: 140px;
				border-bottom: 2px solid #000;
			">
				<!-- Barangay Seal (Left Side) -->
				<div style="
					position: absolute;
					left: 20px;
					top: 20px;
					width: 80px;
					height: 80px;
					border: 2px solid #000;
					border-radius: 50%;
					background: white;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 8px;
					text-align: center;
					line-height: 1.2;
				">
					<div>
						<div style="font-weight: bold;">SAGISAG NG</div>
						<div style="font-weight: bold;">BARANGAY</div>
						<div style="font-weight: bold;">MALINTA</div>
						<div style="margin-top: 5px;">19</div>
						<div style="margin-top: 2px;">86</div>
						<div style="margin-top: 5px;">BAYAN NG</div>
						<div>LOS BAÑOS</div>
					</div>
				</div>

				<!-- Header Text (Centered) -->
				<div style="
					position: absolute;
					left: 120px;
					right: 120px;
					top: 25px;
					text-align: center;
				">
					<div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">REPUBLIC OF THE PHILIPPINES</div>
					<div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">PROVINCE OF LAGUNA</div>
					<div style="font-size: 11px; font-weight: bold; margin-bottom: 2px;">MUNICIPALITY OF LOS BAÑOS</div>
					<div style="font-size: 11px; font-weight: bold;">BARANGAY MALINTA</div>
				</div>

				<!-- Horizontal Line -->
				<div style="
					position: absolute;
					left: 100px;
					right: 100px;
					top: 85px;
					height: 2px;
					background: #000;
				"></div>

				<!-- Office Title Box (Blue Background) -->
				<div style="
					position: absolute;
					left: 0;
					right: 0;
					top: 100px;
					height: 30px;
					background: rgb(51, 89, 204);
					border: 2px solid #000;
					display: flex;
					align-items: center;
					justify-content: center;
				">
					<div style="
						font-size: 14px;
						font-weight: bold;
						color: white;
					">
						OFFICE OF THE SANGGUNIANG BARANGAY
					</div>
				</div>
			</div>

			<!-- PART 2: BLUE SIDEBAR -->
			<div style="
				position: absolute;
				left: 0.5in;
				top: 2.2in;
				width: 1.8in;
				height: 7.5in;
				background: rgb(64, 89, 217);
				color: white;
				padding: 12px;
				font-size: 9px;
				line-height: 1.3;
				font-weight: bold;
			">
				<div style="text-align: center; margin-bottom: 12px; font-size: 10px;">
					SANGGUNIANG BARANGAY<br/>OF MALINTA
				</div>
				
				<div style="margin-bottom: 6px;">PUNONG BARANGAY</div>
				<div style="margin-bottom: 12px;">HON. JESUS H. DE UNA JR.</div>
				
				<div style="margin-bottom: 6px;">BARANGAY KAGAWAD</div>
				<div style="margin-bottom: 3px;">HON. ROLANDO L. ERROBA</div>
				<div style="margin-bottom: 8px; font-size: 8px;">HEALTH & EDUCATION</div>
				
				<div style="margin-bottom: 3px;">HON. RANIE F. ANDAL</div>
				<div style="margin-bottom: 8px;"></div>
				
				<div style="margin-bottom: 3px;">HON. ERNESTO G.</div>
				<div style="margin-bottom: 3px;">ALCANTARA</div>
				<div style="margin-bottom: 8px; font-size: 8px;">ENVIRONMENTAL<br/>PROTECTION</div>
				
				<div style="margin-bottom: 3px;">HON. ALLAN B. BIENES</div>
				<div style="margin-bottom: 8px; font-size: 8px;">INFRASTRUCTURE</div>
				
				<div style="margin-bottom: 3px;">HON. BENY S. MORALDE</div>
				<div style="margin-bottom: 8px; font-size: 8px;">PEACE AND ORDER</div>
				
				<div style="margin-bottom: 3px;">HON. SHERYL S. BAGNES</div>
				<div style="margin-bottom: 8px; font-size: 8px;">WOMEN AND FAMILY</div>
				
				<div style="margin-bottom: 3px;">HON. GAUDENCIO D.</div>
				<div style="margin-bottom: 3px;">MARIANO</div>
				<div style="margin-bottom: 3px; font-size: 8px;">LIVELIHOOD &</div>
				<div style="margin-bottom: 3px; font-size: 8px;">COOPERATIVE DEVT /</div>
				<div style="margin-bottom: 3px; font-size: 8px;">APPROPRIATIONS, WAYS &</div>
				<div style="margin-bottom: 8px; font-size: 8px;">MEANS</div>
				
				<div style="margin-bottom: 3px;">HON. EDMUND LLOYD E.</div>
				<div style="margin-bottom: 3px;">VELASCO</div>
				<div style="margin-bottom: 3px; font-size: 8px;">SPORTS & YOUTH</div>
				<div style="margin-bottom: 8px; font-size: 8px;">DEVELOPMENT</div>
				
				<div style="margin-bottom: 3px;">MS. RICHET E. TAKAHASHI</div>
				<div style="margin-bottom: 3px; font-style: italic; font-size: 8px;">SECRETARY</div>
				
				<div style="margin-bottom: 3px;">MS. JANE CAMILLE</div>
				<div style="margin-bottom: 3px;">RETIRADO</div>
				<div style="margin-bottom: 3px; font-style: italic; font-size: 8px;">TREASURER</div>
				
				<div style="margin-bottom: 3px;">MR. JEFFREY BONITA</div>
				<div style="font-style: italic; font-size: 8px;">ADMIN</div>
			</div>

			<!-- PART 4: MAIN CONTENT AREA -->
			<div style="
				margin-left: 2.6in;
				margin-right: 0.5in;
				margin-top: 0.5in;
				padding: 35px;
				border: 2px solid #000;
				min-height: 6.5in;
				background: white;
			">
				<!-- PART 5: CERTIFICATE TITLE -->
				<div style="text-align: center; margin-bottom: 50px; margin-top: 30px;">
					<h1 style="
						font-size: 22px;
						font-weight: bold;
						letter-spacing: 4px;
						margin: 0;
						line-height: 1.4;
						font-family: 'Times New Roman', serif;
					">
						C E R T I F I C A T E<br/>
						<span style="font-size: 20px;">O F</span><br/>
						I N D I G E N C Y
					</h1>
				</div>

				<!-- PART 6: CERTIFICATE BODY TEXT -->
				<div style="margin-bottom: 60px; line-height: 1.6; font-size: 11px; text-align: justify; font-family: 'Times New Roman', serif;">
					<p style="margin-bottom: 25px;">
						This is to certify that <strong>${certificateData.requestedBy.toUpperCase()}</strong> of legal 
						age is a resident of Brgy. Malinta, Los Baños, Laguna. This certifies 
						further that the name belongs to indigent families of this barangay.
					</p>
					
					<p style="margin-bottom: 25px;">
						This certification is being issued upon the request of above 
						mentioned name as a requirement for whatever legal purpose it may 
						serve to her.
					</p>
					
					<p style="margin-bottom: 40px;">
						Given this <strong>${new Date().getDate()}${getOrdinalSuffix(
		new Date().getDate()
	)}</strong> day of <strong>${new Date().toLocaleDateString("en-US", {
		month: "long",
	})}, ${new Date().getFullYear()}</strong>.
					</p>
				</div>

				<!-- PART 7: SIGNATURE AREA -->
				<div style="margin-top: 80px; text-align: center;">
					<div style="
						width: 180px; 
						height: 1px; 
						margin: 0 auto 15px; 
						border-bottom: 1px solid #000;
						position: relative;
					">
						${
							certificateData.hasSignature && certificateData.signatureUrl
								? `<img src="${certificateData.signatureUrl}" alt="Signature" style="height: 50px; max-width: 160px; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);" />`
								: ``
						}
					</div>
					<div style="font-weight: bold; font-size: 11px; margin-top: 5px; font-family: 'Times New Roman', serif;">
						${officialInfo.name.toUpperCase()}
					</div>
					<div style="font-size: 9px; margin-top: 3px; font-family: 'Times New Roman', serif;">
						${officialInfo.position}
					</div>
				</div>
			</div>

			<!-- PART 8: FOOTER -->
			<div style="
				position: absolute;
				bottom: 0.2in;
				left: 0.5in;
				right: 0.5in;
				text-align: right;
				font-size: 7px;
				padding: 8px;
				font-family: 'Helvetica', 'Arial', sans-serif;
			">
				<div style="font-weight: bold; margin-bottom: 3px; font-size: 8px;">
					ADDRESS:
				</div>
				<div>
					SAN LUIS AVENUE/PUROK 2, BARANGAY MALINTA/LOS BAÑOS, LAGUNA 4030<br/>
					TEL. NO. (049) 502-4396
				</div>
			</div>
		</div>
	`;
}
