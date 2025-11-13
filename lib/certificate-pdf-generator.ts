"use client";

import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";

import {
	CERTIFICATE_LAYOUT,
	CertificateContentData,
	getCertificateTemplateConfig,
	TitleLine,
	PdfFontKey,
} from "./certificate-templates";

export type CertificateData = CertificateContentData;

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

function getIssuanceParagraph(date: Date): string {
	const day = date.getDate();
	const month = date.toLocaleDateString("en-US", { month: "long" });
	const year = date.getFullYear();

	return `Given this ${day}${getOrdinalSuffix(day)} day of ${month}, ${year}.`;
}

function resolveIssuanceDate(generatedOn?: string): Date {
	if (!generatedOn) {
		return new Date();
	}

	const parsedDate = new Date(generatedOn);
	if (Number.isNaN(parsedDate.getTime())) {
		return new Date();
	}

	return parsedDate;
}

function buildCertificateSections(data: CertificateData) {
	const templateConfig = getCertificateTemplateConfig(data.type || "");
	return {
		titleLines: templateConfig.titleLines,
		bodyParagraphs: templateConfig.buildBody(data),
		previewDescription: templateConfig.previewDescription,
	};
}

type RgbTuple = [number, number, number];

function hexToRgbTuple(hexColor: string): RgbTuple {
	const sanitized = hexColor.replace("#", "");
	const bigint = parseInt(sanitized, 16);
	const r = ((bigint >> 16) & 255) / 255;
	const g = ((bigint >> 8) & 255) / 255;
	const b = (bigint & 255) / 255;
	return [r, g, b];
}

function interpolateColor(
	start: RgbTuple,
	end: RgbTuple,
	ratio: number
): RgbTuple {
	return [
		start[0] + (end[0] - start[0]) * ratio,
		start[1] + (end[1] - start[1]) * ratio,
		start[2] + (end[2] - start[2]) * ratio,
	];
}

function splitParagraphIntoLines(
	text: string,
	font: PDFFont,
	fontSize: number,
	maxWidth: number
): string[] {
	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	words.forEach((word) => {
		const candidate = currentLine
			? `${currentLine} ${word}`
			: word;
		const candidateWidth = font.widthOfTextAtSize(candidate, fontSize);

		if (candidateWidth <= maxWidth) {
			currentLine = candidate;
		} else {
			if (currentLine) {
				lines.push(currentLine);
			}
			currentLine = word;
		}
	});

	if (currentLine) {
		lines.push(currentLine);
	}

	return lines;
}
// Generate PDF from certificate data using pdf-lib
export async function generateCertificatePDF(
	certificateData: CertificateData,
	officialInfo: OfficialInfo
): Promise<{ success: boolean; pdfBlob?: Blob; error?: string }> {
	try {
		const layout = CERTIFICATE_LAYOUT;
		const sections = buildCertificateSections(certificateData);
		const issuanceDate = resolveIssuanceDate(certificateData.generatedOn);
		const bodyParagraphs = [
			...sections.bodyParagraphs,
			getIssuanceParagraph(issuanceDate),
		];

		const pdfDoc = await PDFDocument.create();
		const page = pdfDoc.addPage([layout.page.width, layout.page.height]);

		const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
		const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
		const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
		const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

		const fontMap: Record<PdfFontKey, PDFFont> = {
			helvetica: helveticaFont,
			helveticaBold,
			times: timesFont,
			timesBold,
		};

		const { width, height } = page.getSize();
		const margin = layout.margin;
		const black = rgb(0, 0, 0);
		const white = rgb(1, 1, 1);

		// Border
		page.drawRectangle({
			x: margin,
			y: margin,
			width: width - 2 * margin,
			height: height - 2 * margin,
			borderColor: black,
			borderWidth: layout.borderWidth,
			color: white,
		});

	// Seal/Logo - Load and embed the actual barangay logo
	const sealSize = layout.seal.size;
	const sealX = margin + layout.seal.leftOffset;
	const sealY = height - margin - layout.seal.topOffset - sealSize;
	
	try {
		// Fetch the logo image with absolute path
		const logoUrl = window.location.origin + '/images/malinta_logo.jpg';
		const logoResponse = await fetch(logoUrl);
		
		if (!logoResponse.ok) {
			throw new Error(`Failed to fetch logo: ${logoResponse.status}`);
		}
		
		const logoImageBytes = await logoResponse.arrayBuffer();
		const logoImage = await pdfDoc.embedJpg(logoImageBytes);
		
		// Draw border around the logo
		if (layout.seal.borderWidth > 0) {
			page.drawRectangle({
				x: sealX,
				y: sealY,
				width: sealSize,
				height: sealSize,
				borderColor: black,
				borderWidth: layout.seal.borderWidth,
			});
		}
		
		// Draw the logo image
		page.drawImage(logoImage, {
			x: sealX,
			y: sealY,
			width: sealSize,
			height: sealSize,
		});
		
		console.log('Logo loaded successfully');
	} catch (error) {
		console.error('Failed to load logo:', error);
		// Fallback: draw a simple circle as placeholder
		const sealCenterX = sealX + sealSize / 2;
		const sealCenterY = sealY + sealSize / 2;
		const sealRadius = sealSize / 2 - 5;
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
	}

		// Header text (positioned to the right of seal)
		const headerBaseY = height - margin - layout.header.topOffset;
		const headerLeftX = margin + (layout.header.leftOffset || 0);
		layout.header.lines.forEach((line, index) => {
			const headerFont = fontMap[line.font];
			page.drawText(line.text, {
				x: headerLeftX,
				y: headerBaseY - index * layout.header.lineSpacing,
				size: line.fontSize,
				font: headerFont,
				color: black,
			});
		});

		// Header divider
		page.drawRectangle({
			x: margin + layout.header.divider.leftOffset,
			y: height - margin - layout.header.divider.yOffset,
			width: width - 2 * margin - layout.header.divider.rightOffset,
			height: layout.header.divider.height,
			color: black,
		});

		// Office ribbon
		const officeRibbon = layout.header.officeRibbon;
		const ribbonColor = hexToRgbTuple(officeRibbon.backgroundColor);
		const ribbonTextColor = hexToRgbTuple(officeRibbon.textColor);
		const ribbonY = height - margin - officeRibbon.topOffset;

		page.drawRectangle({
			x: margin,
			y: ribbonY,
			width: width - 2 * margin,
			height: officeRibbon.height,
			borderColor: black,
			borderWidth: officeRibbon.borderWidth,
			color: rgb(ribbonColor[0], ribbonColor[1], ribbonColor[2]),
		});

		const ribbonFont = fontMap[officeRibbon.font];
		const ribbonTextWidth = ribbonFont.widthOfTextAtSize(
			officeRibbon.text,
			officeRibbon.fontSize
		);
		page.drawText(officeRibbon.text, {
			x: (width - ribbonTextWidth) / 2,
			y:
				ribbonY +
				(officeRibbon.height - officeRibbon.fontSize) / 2 +
				officeRibbon.fontSize * 0.1,
			size: officeRibbon.fontSize,
			font: ribbonFont,
			color: rgb(
				ribbonTextColor[0],
				ribbonTextColor[1],
				ribbonTextColor[2]
			),
		});

		// Sidebar gradient background
		const sidebarStartY = margin + layout.sidebar.bottomOffset;
		const sidebarHeight = height - margin - layout.sidebar.topOffset;
		const topColor = hexToRgbTuple(layout.sidebar.backgroundTopColor);
		const bottomColor = hexToRgbTuple(layout.sidebar.backgroundBottomColor);
		const steps: number = 40;
		const stepHeight = sidebarHeight / steps;

		for (let step = 0; step < steps; step++) {
			const ratio = steps === 1 ? 0 : step / (steps - 1);
			const [r, g, b] = interpolateColor(topColor, bottomColor, ratio);
			page.drawRectangle({
				x: margin,
				y: sidebarStartY + step * stepHeight,
				width: layout.sidebar.width,
				height: stepHeight + 0.5,
				color: rgb(r, g, b),
			});
		}

		// Sidebar text
		const sidebarTextColor = hexToRgbTuple(layout.sidebar.textColor);
		let sidebarTextY =
			height - margin - layout.sidebar.contentTopOffset;

		const renderSidebarEntry = (entry: (typeof layout.sidebar.title)[number]) => {
			const entryFont = fontMap[entry.font];
			const textWidth = entryFont.widthOfTextAtSize(entry.text, entry.fontSize);
			const x = entry.center
				? margin + (layout.sidebar.width - textWidth) / 2
				: margin + layout.sidebar.textHorizontalPadding;

			page.drawText(entry.text, {
				x,
				y: sidebarTextY,
				size: entry.fontSize,
				font: entryFont,
				color: rgb(
					sidebarTextColor[0],
					sidebarTextColor[1],
					sidebarTextColor[2]
				),
			});

			sidebarTextY -= entry.fontSize + (entry.marginBottom ?? 3);
		};

		layout.sidebar.title.forEach(renderSidebarEntry);
		layout.sidebar.entries.forEach(renderSidebarEntry);

		// Sidebar border
		if (layout.sidebar.borderWidth && layout.sidebar.borderWidth > 0) {
			page.drawRectangle({
				x: margin,
				y: sidebarStartY,
				width: layout.sidebar.width,
				height: sidebarHeight,
				borderColor: black,
				borderWidth: layout.sidebar.borderWidth,
			});
		}

		// Content box
		const contentBox = layout.contentBox;
		const contentX = margin + layout.sidebar.width + contentBox.leftGap;
		const contentWidth = width - contentX - margin - contentBox.rightGap;
		const contentBorderX = contentX - contentBox.horizontalPadding;
		const contentBorderY = margin + contentBox.bottomOffset;
		const contentBorderTop = height - margin - contentBox.topOffset;
		const contentBorderHeight = contentBorderTop - contentBorderY;

		page.drawRectangle({
			x: contentBorderX,
			y: contentBorderY,
			width: contentWidth + contentBox.horizontalPadding * 2,
			height: contentBorderHeight,
			borderColor: black,
			borderWidth: contentBox.borderWidth,
			color: white,
		});

		// Title lines
		let titleY = height - margin - contentBox.titleOffset;
		sections.titleLines.forEach((line) => {
			const textWidth = timesBold.widthOfTextAtSize(line.text, line.fontSize);
			page.drawText(line.text, {
				x: contentX + (contentWidth - textWidth) / 2,
				y: titleY,
				size: line.fontSize,
				font: timesBold,
				color: black,
			});
			titleY -= line.marginBottom;
		});

		// Body paragraphs
		const bodyConfig = layout.body;
		const bodyFont = fontMap[bodyConfig.font];
		let bodyY = titleY - bodyConfig.topSpacing;
		const bodyMaxWidth = contentWidth - bodyConfig.contentMarginX * 2;

		bodyParagraphs.forEach((paragraph) => {
			const lines = splitParagraphIntoLines(
				paragraph,
				bodyFont,
				bodyConfig.fontSize,
				bodyMaxWidth
			);

			lines.forEach((line, lineIndex) => {
				page.drawText(line, {
					x: contentX + bodyConfig.contentMarginX,
					y: bodyY - lineIndex * bodyConfig.lineHeight,
					size: bodyConfig.fontSize,
					font: bodyFont,
					color: black,
				});
			});

			bodyY -= lines.length * bodyConfig.lineHeight + bodyConfig.paragraphSpacing;
		});

		// Signature area
		const signatureConfig = layout.signature;
		const signatureBaseY = bodyY - signatureConfig.offsetFromBody;
		const signatureBoxX =
			contentX +
			contentWidth -
			signatureConfig.boxWidth -
			signatureConfig.horizontalOffset;

		page.drawRectangle({
			x: signatureBoxX,
			y: signatureBaseY + signatureConfig.lineOffsetY,
			width: signatureConfig.boxWidth,
			height: 1,
			color: black,
		});

		const signatureName = officialInfo.name.toUpperCase();
		const signaturePosition = officialInfo.position;
		const signatureNameFont = fontMap[signatureConfig.nameFont];
		const signaturePositionFont = fontMap[signatureConfig.positionFont];
		const signatureNameWidth = signatureNameFont.widthOfTextAtSize(
			signatureName,
			signatureConfig.nameFontSize
		);
		const signaturePosWidth = signaturePositionFont.widthOfTextAtSize(
			signaturePosition,
			signatureConfig.positionFontSize
		);

		page.drawText(signatureName, {
			x:
				signatureBoxX +
				(signatureConfig.boxWidth - signatureNameWidth) / 2,
			y: signatureBaseY + signatureConfig.nameOffsetY,
			size: signatureConfig.nameFontSize,
			font: signatureNameFont,
			color: black,
		});

		page.drawText(signaturePosition, {
			x:
				signatureBoxX +
				(signatureConfig.boxWidth - signaturePosWidth) / 2,
			y: signatureBaseY + signatureConfig.positionOffsetY,
			size: signatureConfig.positionFontSize,
			font: signaturePositionFont,
			color: black,
		});

		// Footer
		const footerBaseY = margin + layout.footer.bottomOffset;
		layout.footer.lines.forEach((line, index) => {
			const footerFont = fontMap[line.font];
			const textWidth = footerFont.widthOfTextAtSize(line.text, line.fontSize);
			page.drawText(line.text, {
				x: width - margin - textWidth - 5,
				y: footerBaseY + 15 - index * layout.footer.lineSpacing,
				size: line.fontSize,
				font: footerFont,
				color: black,
			});
		});

		const pdfBytes = await pdfDoc.save();
		const pdfBuffer = pdfBytes.buffer.slice(
			pdfBytes.byteOffset,
			pdfBytes.byteOffset + pdfBytes.byteLength
		) as ArrayBuffer;
		const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

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
	const layout = CERTIFICATE_LAYOUT;
	const sections = buildCertificateSections(certificateData);
	const issuanceParagraph = getIssuanceParagraph(
		resolveIssuanceDate(certificateData.generatedOn)
	);
	const paragraphs = [...sections.bodyParagraphs, issuanceParagraph];

	const formatNumber = (value: number) => {
		const rounded = Number(value.toFixed(3));
		return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toString();
	};
	const formatInches = (points: number) =>
		`${formatNumber(points / 72)}in`;
	const pageWidthIn = formatInches(layout.page.width);
	const pageHeightIn = formatInches(layout.page.height);
	const marginIn = formatInches(layout.margin);
	const sidebarWidthIn = formatInches(layout.sidebar.width);
	const contentMarginLeftIn = formatInches(
		layout.margin +
			layout.sidebar.width +
			layout.contentBox.leftGap -
			layout.contentBox.horizontalPadding
	);
	const contentMarginRightIn = formatInches(
		layout.margin +
			layout.contentBox.rightGap +
			layout.contentBox.horizontalPadding
	);
	const sidebarTopIn = formatInches(layout.sidebar.topOffset);
	const sidebarHeightIn = formatInches(
		layout.page.height - layout.sidebar.topOffset - layout.sidebar.bottomOffset
	);

	const headerLinesHtml = layout.header.lines
		.map(
			(line) => `
				<div style="
					font-size: ${line.fontSize}px;
					font-weight: ${line.font === "helveticaBold" ? "bold" : "normal"};
					margin-bottom: ${layout.header.lineSpacing - line.fontSize + 2}px;
				">
					${line.text}
				</div>
			`
		)
		.join("");

	const sidebarTitleHtml = layout.sidebar.title
		.map((entry) => {
			const textAlign = entry.center ? "center" : "left";
			return `<div style="
				font-size: ${entry.fontSize}px;
				font-weight: ${entry.font === "helveticaBold" ? "bold" : "normal"};
				text-align: ${textAlign};
				margin-bottom: ${entry.marginBottom ?? 3}px;
			">${entry.text}</div>`;
		})
		.join("");

	const sidebarEntriesHtml = layout.sidebar.entries
		.map((entry) => {
			const fontWeight = entry.font === "helveticaBold" ? "bold" : "normal";
			const fontStyle = entry.italic ? "italic" : "normal";
			return `<div style="
				font-size: ${entry.fontSize}px;
				font-weight: ${fontWeight};
				font-style: ${fontStyle};
				margin-bottom: ${entry.marginBottom ?? 3}px;
			">${entry.text}</div>`;
		})
		.join("");

	const titleHtml = sections.titleLines
		.map((line, index) => {
			const marginBottom =
				index === sections.titleLines.length - 1 ? 0 : line.marginBottom;
			return `<div style="
						font-size: ${line.fontSize}px;
						font-weight: bold;
						letter-spacing: 4px;
						margin: 0;
						margin-bottom: ${marginBottom}px;
						line-height: 1.4;
						font-family: 'Times New Roman', serif;
					">
						${line.text}
					</div>`;
		})
		.join("");

	const paragraphHtml = paragraphs
		.map((paragraph, index) => {
			const marginBottom =
				index === paragraphs.length - 1
					? layout.body.paragraphSpacing + 15
					: layout.body.paragraphSpacing;
			return `<p style="margin-bottom: ${marginBottom}px;">
						${paragraph}
					</p>`;
		})
		.join("");

	const footerHtml = layout.footer.lines
		.map(
			(line, index) => `
				<div style="
					font-weight: ${line.font === "helveticaBold" ? "bold" : "normal"};
					font-size: ${line.fontSize}px;
					margin-bottom: ${
						index === layout.footer.lines.length - 1
							? 0
							: layout.footer.lineSpacing - line.fontSize + 1
					}px;
				">
					${line.text}
				</div>
			`
		)
		.join("");

	return `
		<div id="certificate-container" style="
			width: ${pageWidthIn};
			height: ${pageHeightIn};
			padding: ${marginIn};
			font-family: 'Helvetica', 'Arial', sans-serif;
			background: white;
			border: ${layout.borderWidth}px solid #000;
			box-sizing: border-box;
			position: relative;
			margin: 0 auto;
			transform: scale(0.8);
			transform-origin: top center;
		">
			<!-- Header -->
			<div style="
				position: relative;
				height: 140px;
				border-bottom: ${layout.header.divider.height}px solid #000;
			">
				<div style="
					position: absolute;
					left: ${layout.seal.leftOffset}px;
					top: ${layout.seal.topOffset}px;
					width: ${layout.seal.size}px;
					height: ${layout.seal.size}px;
					border: ${layout.seal.borderWidth}px solid #000;
					overflow: hidden;
					box-sizing: border-box;
				">
					<img src="/images/malinta_logo.jpg" alt="Barangay Seal" style="
						width: 100%;
						height: 100%;
						object-fit: contain;
					" />
					<div style="display: none;">
						<div>SAGISAG NG</div>
						<div>BARANGAY</div>
						<div>MALINTA</div>
						<div style="margin-top: 5px;">19</div>
						<div>86</div>
						<div style="margin-top: 5px;">BAYAN NG</div>
						<div>LOS BAÑOS</div>
					</div>
				</div>

				<div style="
					position: absolute;
					left: ${layout.header.leftOffset || 120}px;
					top: ${layout.header.topOffset}px;
				">
					${headerLinesHtml}
				</div>

				<div style="
					position: absolute;
					left: ${layout.header.divider.leftOffset}px;
					right: ${layout.header.divider.rightOffset}px;
					top: ${layout.header.divider.yOffset - 20}px;
					height: ${layout.header.divider.height}px;
					background: #000;
				"></div>

				<div style="
					position: absolute;
					left: 0;
					right: 0;
					top: ${layout.header.officeRibbon.topOffset - 40}px;
					height: ${layout.header.officeRibbon.height}px;
					background: ${layout.header.officeRibbon.backgroundColor};
					border: ${layout.header.officeRibbon.borderWidth}px solid #000;
					display: flex;
					align-items: center;
					justify-content: center;
				">
					<div style="
						font-size: ${layout.header.officeRibbon.fontSize}px;
						font-weight: bold;
						color: ${layout.header.officeRibbon.textColor};
					">
						${layout.header.officeRibbon.text}
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div style="
				position: absolute;
				left: ${marginIn};
				top: ${sidebarTopIn};
				width: ${sidebarWidthIn};
				height: ${sidebarHeightIn};
				background: ${layout.sidebar.backgroundTopColor};
				color: ${layout.sidebar.textColor};
				border: ${layout.sidebar.borderWidth || 0}px solid #000;
				box-sizing: border-box;
				padding: 12px;
				font-size: 9px;
				line-height: 1.3;
				font-weight: bold;
			">
				${sidebarTitleHtml}
				${sidebarEntriesHtml}
			</div>

			<!-- Content -->
			<div style="
				margin-left: ${contentMarginLeftIn};
				margin-right: ${contentMarginRightIn};
				margin-top: ${marginIn};
				padding: 35px 30px;
				border: ${layout.contentBox.borderWidth}px solid #000;
				min-height: 6.5in;
				background: white;
			">
				<div style="text-align: center; margin-bottom: 50px; margin-top: 30px;">
					${titleHtml}
				</div>

				<div style="margin-bottom: 60px; line-height: 1.6; font-size: 11px; text-align: justify; font-family: 'Times New Roman', serif;">
					${paragraphHtml}
				</div>

				<div style="margin-top: 80px; text-align: center;">
					<div style="
						width: ${layout.signature.boxWidth}px;
						height: 1px;
						margin: 0 auto 15px;
						border-bottom: 1px solid #000;
						position: relative;
					">
						${
							certificateData.hasSignature && certificateData.signatureUrl
								? `<img src="${certificateData.signatureUrl}" alt="Signature" style="height: 50px; max-width: ${layout.signature.boxWidth - 20}px; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);" />`
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

			<!-- Footer -->
			<div style="
				position: absolute;
				bottom: 0.2in;
				left: ${marginIn};
				right: ${marginIn};
				text-align: right;
				font-size: 7px;
				padding: 8px;
				font-family: 'Helvetica', 'Arial', sans-serif;
			">
				${footerHtml}
			</div>
		</div>
	`;
}
