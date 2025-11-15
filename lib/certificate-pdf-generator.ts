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

// Helper function to convert PDF points to inches
function pointsToInches(points: number): string {
	const inches = points / 72;
	const rounded = Number(inches.toFixed(3));
	return Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toString();
}

// Helper function to convert PDF points to pixels (assuming 96 DPI)
function pointsToPixels(points: number): string {
	const pixels = (points / 72) * 96;
	return Math.round(pixels).toString();
}

// Helper function to build sidebar gradient CSS
function buildSidebarGradientCSS(
	topColor: string,
	bottomColor: string
): string {
	return `linear-gradient(to bottom, ${topColor}, ${bottomColor})`;
}

// Helper function to split text into lines for HTML (approximate)
function splitTextIntoLinesHTML(
	text: string,
	fontSize: number,
	maxWidthPx: number
): string[] {
	// Approximate character width (rough estimate: 0.6 * fontSize for average character)
	const avgCharWidth = fontSize * 0.6;
	const maxCharsPerLine = Math.floor(maxWidthPx / avgCharWidth);
	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	words.forEach((word) => {
		const candidate = currentLine ? `${currentLine} ${word}` : word;
		if (candidate.length <= maxCharsPerLine) {
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

// Helper function to build content box styles
function buildContentBoxStyles(layout: typeof CERTIFICATE_LAYOUT): string {
	const cb = layout.contentBox;
	const paddingTop = cb.paddingTop ?? cb.horizontalPadding;
	const paddingBottom = cb.paddingBottom ?? cb.horizontalPadding;
	const paddingLeft = cb.paddingLeft ?? cb.horizontalPadding;
	const paddingRight = cb.paddingRight ?? cb.horizontalPadding;
	const borderColor = cb.borderColor ?? "#000000";
	const borderStyle = cb.borderStyle ?? "solid";
	const backgroundColor = cb.backgroundColor ?? "#FFFFFF";

	return `
		padding: ${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px;
		border: ${cb.borderWidth}px ${borderStyle} ${borderColor};
		background: ${backgroundColor};
	`.trim();
}

// Helper function to build title section styles
function buildTitleSectionStyles(layout: typeof CERTIFICATE_LAYOUT): string {
	const titleSection = layout.contentBox.titleSection;
	const title = layout.title;
	
	if (!titleSection) {
		return `
			text-align: center;
			margin-top: 30px;
			margin-bottom: 50px;
		`.trim();
	}

	return `
		text-align: ${titleSection.textAlign ?? "center"};
		margin-top: ${titleSection.marginTop ?? 30}px;
		margin-bottom: ${titleSection.marginBottom ?? 50}px;
		${titleSection.fontSize ? `font-size: ${titleSection.fontSize}px;` : ""}
		${titleSection.fontWeight ? `font-weight: ${titleSection.fontWeight};` : ""}
		${titleSection.fontFamily ? `font-family: ${titleSection.fontFamily};` : ""}
		${titleSection.letterSpacing !== undefined ? `letter-spacing: ${titleSection.letterSpacing}px;` : ""}
		${titleSection.color ? `color: ${titleSection.color};` : ""}
	`.trim();
}

// Helper function to build body section styles
function buildBodySectionStyles(layout: typeof CERTIFICATE_LAYOUT): string {
	const bodySection = layout.contentBox.bodySection;
	const body = layout.body;
	
	if (!bodySection) {
		return `
			margin-bottom: 60px;
			line-height: 1.6;
			font-size: 11px;
			text-align: justify;
			font-family: 'Times New Roman', serif;
		`.trim();
	}

	return `
		margin-top: ${bodySection.marginTop ?? 0}px;
		margin-bottom: ${bodySection.marginBottom ?? 60}px;
		text-align: ${bodySection.textAlign ?? "justify"};
		font-size: ${bodySection.fontSize ?? body.fontSize}px;
		font-family: ${bodySection.fontFamily ?? body.fontFamily ?? "'Times New Roman', serif"};
		line-height: ${bodySection.lineHeight ?? body.lineHeight / body.fontSize};
		color: ${bodySection.color ?? body.color ?? "#000000"};
	`.trim();
}

// Helper function to build signature section styles
function buildSignatureSectionStyles(layout: typeof CERTIFICATE_LAYOUT): string {
	const sigSection = layout.contentBox.signatureSection;
	const sig = layout.signature;
	
	if (!sigSection) {
		return `
			text-align: center;
		`.trim();
	}

	const alignment = sigSection.alignment ?? sigSection.textAlign ?? "center";
	
	return `
		text-align: ${sigSection.textAlign ?? "center"};
		${alignment === "right" ? "display: flex; justify-content: flex-end;" : ""}
		${alignment === "left" ? "display: flex; justify-content: flex-start;" : ""}
	`.trim();
}

// Helper function to build content box styles (for print - uses inches)
function buildContentBoxStylesInches(layout: typeof CERTIFICATE_LAYOUT): string {
	const cb = layout.contentBox;
	const paddingTop = cb.paddingTop ?? cb.horizontalPadding;
	const paddingBottom = cb.paddingBottom ?? cb.horizontalPadding;
	const paddingLeft = cb.paddingLeft ?? cb.horizontalPadding;
	const paddingRight = cb.paddingRight ?? cb.horizontalPadding;
	const borderColor = cb.borderColor ?? "#000000";
	const borderStyle = cb.borderStyle ?? "solid";
	const backgroundColor = cb.backgroundColor ?? "#FFFFFF";

	return `
		border: ${pointsToInches(cb.borderWidth)}in ${borderStyle} ${borderColor};
		background: ${backgroundColor};
		box-sizing: border-box;
		padding: ${pointsToInches(paddingTop)}in ${pointsToInches(paddingRight)}in ${pointsToInches(paddingBottom)}in ${pointsToInches(paddingLeft)}in;
	`.trim();
}

// Helper function to build title section styles (for print - uses inches)
function buildTitleSectionStylesInches(layout: typeof CERTIFICATE_LAYOUT): string {
	const titleSection = layout.contentBox.titleSection;
	const title = layout.title;
	
	if (!titleSection) {
		return `
			text-align: center;
			padding-top: ${pointsToInches(25)}in;
		`.trim();
	}

	return `
		text-align: ${titleSection.textAlign ?? "center"};
		padding-top: ${pointsToInches(titleSection.marginTop ?? 25)}in;
		${titleSection.fontSize ? `font-size: ${titleSection.fontSize}pt;` : ""}
		${titleSection.fontWeight ? `font-weight: ${titleSection.fontWeight};` : ""}
		${titleSection.fontFamily ? `font-family: ${titleSection.fontFamily};` : ""}
		${titleSection.letterSpacing !== undefined ? `letter-spacing: ${pointsToInches(titleSection.letterSpacing)}in;` : ""}
		${titleSection.color ? `color: ${titleSection.color};` : ""}
	`.trim();
}

// Helper function to build body section styles (for print - uses inches)
function buildBodySectionStylesInches(layout: typeof CERTIFICATE_LAYOUT): string {
	const bodySection = layout.contentBox.bodySection;
	const body = layout.body;
	
	if (!bodySection) {
		return `
			text-align: justify;
			font-size: ${body.fontSize}pt;
			line-height: ${body.lineHeight / body.fontSize};
			font-family: 'Times New Roman', Times, serif;
		`.trim();
	}

	return `
		text-align: ${bodySection.textAlign ?? "justify"};
		font-size: ${bodySection.fontSize ?? body.fontSize}pt;
		font-family: ${bodySection.fontFamily ?? body.fontFamily ?? "'Times New Roman', Times, serif"};
		line-height: ${bodySection.lineHeight ?? body.lineHeight / body.fontSize};
		color: ${bodySection.color ?? body.color ?? "#000000"};
	`.trim();
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
			arial: helveticaFont, // Arial maps to Helvetica (visually similar, standard PDF font)
			arialBold: helveticaBold,
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
		const sidebarTopY = height - margin - layout.sidebar.topOffset;
		const sidebarHeight = sidebarTopY - sidebarStartY;
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
		const contentTopMargin = 5; // 5px top margin for right content area
		const contentX = margin + layout.sidebar.width + contentBox.leftGap;
		const contentWidth = width - contentX - margin - contentBox.rightGap;
		const contentBorderX = contentX - contentBox.horizontalPadding;
		const contentBorderY = margin + contentBox.bottomOffset;
		const contentBorderTop = height - margin - contentBox.topOffset - contentTopMargin;
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
		let titleY = height - margin - contentBox.titleOffset - contentTopMargin;
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
			// Parse paragraph for bold markers (**text**)
			const parseBoldText = (text: string): Array<{ text: string; bold: boolean }> => {
				const parts: Array<{ text: string; bold: boolean }> = [];
				const regex = /\*\*(.*?)\*\*/g;
				let lastIndex = 0;
				let match;

				while ((match = regex.exec(text)) !== null) {
					// Add text before bold
					if (match.index > lastIndex) {
						parts.push({ text: text.substring(lastIndex, match.index), bold: false });
					}
					// Add bold text
					parts.push({ text: match[1], bold: true });
					lastIndex = regex.lastIndex;
				}
				// Add remaining text
				if (lastIndex < text.length) {
					parts.push({ text: text.substring(lastIndex), bold: false });
				}

				// If no bold markers found, return entire text as normal
				if (parts.length === 0) {
					parts.push({ text, bold: false });
				}

				return parts;
			};

			const parts = parseBoldText(paragraph);
			const bodyBoldFont = fontMap["timesBold"];
			const firstLineIndent = 36;
			
			// Build a combined text with markers for rendering
			let currentX = contentX + bodyConfig.contentMarginX + firstLineIndent;
			let currentY = bodyY;
			let lineIndex = 0;

			parts.forEach((part, partIndex) => {
				const font = part.bold ? bodyBoldFont : bodyFont;
				const words = part.text.split(" ").filter(w => w.length > 0);

				words.forEach((word, wordIndex) => {
					const needsSpace = (partIndex > 0 || wordIndex > 0) && 
						!(partIndex === 0 && wordIndex === 0 && lineIndex === 0);
					const textToAdd = needsSpace ? ` ${word}` : word;
					const textWidth = font.widthOfTextAtSize(textToAdd, bodyConfig.fontSize);
					
					// Calculate line start position
					const lineStartX = lineIndex === 0 
						? contentX + bodyConfig.contentMarginX + firstLineIndent
						: contentX + bodyConfig.contentMarginX;
					
					// Check if text fits on current line
					const availableWidth = bodyMaxWidth - (currentX - lineStartX);
					
					if (textWidth <= availableWidth && currentX >= lineStartX) {
						// Add to current line
						page.drawText(textToAdd, {
							x: currentX,
							y: currentY,
							size: bodyConfig.fontSize,
							font: font,
							color: black,
						});
						currentX += textWidth;
					} else {
						// Move to next line
						lineIndex++;
						currentY = bodyY - lineIndex * bodyConfig.lineHeight;
						currentX = contentX + bodyConfig.contentMarginX;
						
						// Draw word on new line
						const wordWidth = font.widthOfTextAtSize(word, bodyConfig.fontSize);
						page.drawText(word, {
							x: currentX,
							y: currentY,
							size: bodyConfig.fontSize,
							font: font,
							color: black,
						});
						currentX += wordWidth;
					}
				});
			});

			bodyY = currentY - bodyConfig.paragraphSpacing;
		});

		// Add photo if available (1x1 picture) - positioned in top right corner of content box
		if (certificateData.photoUrl) {
			try {
				const photoResponse = await fetch(certificateData.photoUrl);
				if (photoResponse.ok) {
					const photoImageBytes = await photoResponse.arrayBuffer();
					const contentType = photoResponse.headers.get("content-type") || "";
					
					// Try to embed the image based on content type
					let photoImage;
					if (contentType.includes("jpeg") || contentType.includes("jpg")) {
						photoImage = await pdfDoc.embedJpg(photoImageBytes);
					} else if (contentType.includes("png")) {
						photoImage = await pdfDoc.embedPng(photoImageBytes);
					} else {
						// Try JPG first, then PNG as fallback
						try {
							photoImage = await pdfDoc.embedJpg(photoImageBytes);
						} catch {
							photoImage = await pdfDoc.embedPng(photoImageBytes);
						}
					}
					
					// Size for 1x1 photo (approximately 1 inch square)
					const photoSize = 72; // 1 inch = 72 points
					const photoPadding = 10; // Padding from edges
					// Position in top right corner of content box
					const photoX = contentX + contentWidth - photoSize - photoPadding - contentBox.horizontalPadding;
					const photoY = contentBorderTop - photoSize - photoPadding;
					
					page.drawImage(photoImage, {
						x: photoX,
						y: photoY,
						width: photoSize,
						height: photoSize,
					});
					
					// Draw border around photo
					page.drawRectangle({
						x: photoX,
						y: photoY,
						width: photoSize,
						height: photoSize,
						borderColor: black,
						borderWidth: 1,
					});
				}
			} catch (photoError) {
				console.error("Failed to load photo:", photoError);
				// Continue without photo if it fails to load
			}
		}

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
			const titleConfig = layout.title;
			const titleSection = layout.contentBox.titleSection;
			return `<div style="
						font-size: ${line.fontSize}px;
						font-weight: ${titleSection?.fontWeight ?? titleConfig.fontWeight ?? "bold"};
						letter-spacing: ${titleSection?.letterSpacing !== undefined ? titleSection.letterSpacing : (titleConfig.letterSpacing ?? 4)}px;
						margin: 0;
						margin-bottom: ${marginBottom}px;
						line-height: 1.0;
						font-family: ${titleSection?.fontFamily ?? "'Times New Roman', serif"};
						color: ${titleSection?.color ?? titleConfig.color ?? "#000000"};
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
			// Convert **text** to <strong>text</strong>
			const htmlParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			return `<p style="margin-bottom: ${marginBottom}px; text-indent: 0.5in;">
						${htmlParagraph}
					</p>`;
		})
		.join("");

	// Add photo HTML if available (1x1 picture) - positioned in top right corner of content box
	const photoPaddingIn = `${pointsToInches(10)}in`;
	const photoHtml = certificateData.photoUrl
		? `<div style="
				position: absolute;
				top: ${photoPaddingIn};
				right: ${photoPaddingIn};
				width: 1in;
				height: 1in;
				page-break-inside: avoid;
			">
				<img src="${certificateData.photoUrl}" alt="1x1 Photo" style="
					width: 100%;
					height: 100%;
					border: 1px solid #000;
					object-fit: cover;
					display: block;
				" onerror="console.error('Failed to load photo:', this.src); this.style.display='none';" />
			</div>`
		: "";

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
			<div class="content-box" style="
				margin-left: ${contentMarginLeftIn};
				margin-right: ${contentMarginRightIn};
				margin-top: calc(${marginIn} + 5px);
				min-height: 6.5in;
				position: relative;
				${buildContentBoxStyles(layout)}
			">
				<!-- Photo (positioned in top right corner) -->
				${photoHtml}

				<div class="title-section" style="${buildTitleSectionStyles(layout)}">
					${titleHtml}
				</div>

				<div class="body-section" style="${buildBodySectionStyles(layout)}">
					${paragraphHtml}
				</div>

				<div class="signature-section" style="${buildSignatureSectionStyles(layout)}">
					<div style="
						width: ${layout.signature.boxWidth}px;
						height: 1px;
						margin: 0 auto 15px;
						border-bottom: 1px ${layout.signature.boxBorderStyle ?? "solid"} ${layout.signature.boxBorderColor ?? "#000000"};
						position: relative;
					">
						${
							certificateData.hasSignature && certificateData.signatureUrl
								? `<img src="${certificateData.signatureUrl}" alt="Signature" style="height: 50px; max-width: ${layout.signature.boxWidth - 20}px; position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);" />`
								: ``
						}
					</div>
					<div style="
						font-weight: bold;
						font-size: ${layout.signature.nameFontSize}px;
						margin-top: 5px;
						font-family: 'Times New Roman', serif;
						color: ${layout.signature.nameColor ?? "#000000"};
					">
						${officialInfo.name.toUpperCase()}
					</div>
					<div style="
						font-size: ${layout.signature.positionFontSize}px;
						margin-top: 3px;
						font-family: 'Times New Roman', serif;
						color: ${layout.signature.positionColor ?? "#000000"};
					">
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

// Build printable certificate HTML for printing
function buildPrintableCertificateHtmlLegacy(
	certificateData: CertificateData,
	officialInfo: OfficialInfo
): string {
	const layout = CERTIFICATE_LAYOUT;
	const sections = buildCertificateSections(certificateData);
	const issuanceDate = resolveIssuanceDate(certificateData.generatedOn);
	const bodyParagraphs = [
		...sections.bodyParagraphs,
		getIssuanceParagraph(issuanceDate),
	];

	// Convert measurements to inches for print
	const pageWidthIn = `${pointsToInches(layout.page.width)}in`;
	const pageHeightIn = `${pointsToInches(layout.page.height)}in`;
	const marginIn = `${pointsToInches(layout.margin)}in`;
	const sidebarWidthIn = `${pointsToInches(layout.sidebar.width)}in`;
	const sealSizeIn = `${pointsToInches(layout.seal.size)}in`;
	const sealLeftIn = `${pointsToInches(layout.margin + layout.seal.leftOffset)}in`;
	// PDF: height - margin - topOffset - size (from bottom), HTML: margin + topOffset (from top)
	const sealTopIn = `${pointsToInches(layout.margin + layout.seal.topOffset)}in`;

	// Calculate content area
	const contentLeftIn = `${pointsToInches(layout.margin + layout.sidebar.width + layout.contentBox.leftGap)}in`;
	const contentWidthIn = `${pointsToInches(layout.page.width - layout.margin - layout.sidebar.width - layout.contentBox.leftGap - layout.contentBox.rightGap - layout.margin)}in`;
	const contentPaddingIn = `${pointsToInches(layout.contentBox.horizontalPadding)}in`;

	// Sidebar positioning - topOffset is from top margin in PDF, same for HTML
	const sidebarTopIn = `${pointsToInches(layout.margin + layout.sidebar.topOffset)}in`;
	const sidebarHeightIn = `${pointsToInches(layout.page.height - layout.margin - layout.sidebar.topOffset - layout.sidebar.bottomOffset - layout.margin)}in`;

	// Header positioning - topOffset is from top margin
	const headerTopIn = `${pointsToInches(layout.margin + layout.header.topOffset)}in`;
	const headerLeftIn = `${pointsToInches(layout.margin + (layout.header.leftOffset || 0))}in`;

	// Office ribbon - topOffset is from top margin
	const ribbonTopIn = `${pointsToInches(layout.margin + layout.header.officeRibbon.topOffset)}in`;
	const ribbonHeightIn = `${pointsToInches(layout.header.officeRibbon.height)}in`;

	// Content box positioning - topOffset is from top margin
	const contentTopMargin = 5; // 5px top margin for right content area
	const contentBoxTopIn = `${pointsToInches(layout.margin + layout.contentBox.topOffset + contentTopMargin)}in`;
	const contentBoxHeightIn = `${pointsToInches(layout.page.height - layout.margin - layout.contentBox.topOffset - layout.contentBox.bottomOffset - layout.margin - contentTopMargin)}in`;

	// Title positioning - titleOffset is from top margin (relative to page, not content box)
	// Adjust for better spacing within content box
	const titleTopIn = `${pointsToInches((layout.contentBox.titleOffset - layout.contentBox.topOffset) - 10)}in`;

	// Body text area
	const bodyMaxWidthPx = Number(pointsToPixels(
		layout.page.width -
			layout.margin -
			layout.sidebar.width -
			layout.contentBox.leftGap -
			layout.contentBox.rightGap -
			layout.margin -
			layout.contentBox.horizontalPadding * 2 -
			layout.body.contentMarginX * 2
	));

	// Build header lines HTML
	const headerLinesHtml = layout.header.lines
		.map(
			(line, index) => `
				<div style="
					font-size: ${line.fontSize}pt;
					font-weight: ${line.font === "helveticaBold" ? "bold" : "normal"};
					font-family: 'Helvetica', 'Arial', sans-serif;
					margin-bottom: ${index < layout.header.lines.length - 1 ? `${pointsToInches(layout.header.lineSpacing - line.fontSize)}in` : "0"};
					line-height: 1.2;
				">
					${line.text}
				</div>
			`
		)
		.join("");

	// Build sidebar title HTML
	const sidebarTitleHtml = layout.sidebar.title
		.map((entry) => {
			const textAlign = entry.center ? "center" : "left";
			const marginBottomPt = (entry.marginBottom ?? 3);
			return `<div style="
				font-size: ${entry.fontSize}pt;
				font-weight: ${entry.font === "helveticaBold" ? "bold" : "normal"};
				font-family: 'Helvetica', 'Arial', sans-serif;
				text-align: ${textAlign};
				margin-bottom: ${pointsToInches(marginBottomPt)}in;
				color: #000000;
				line-height: 1.3;
			">${entry.text}</div>`;
		})
		.join("");

	// Build sidebar entries HTML
	const sidebarEntriesHtml = layout.sidebar.entries
		.map((entry) => {
			const fontWeight = entry.font === "helveticaBold" ? "bold" : "normal";
			const fontStyle = entry.italic ? "italic" : "normal";
			const marginBottomPt = (entry.marginBottom ?? 3);
			return `<div style="
				font-size: ${entry.fontSize}pt;
				font-weight: ${fontWeight};
				font-style: ${fontStyle};
				font-family: 'Helvetica', 'Arial', sans-serif;
				margin-bottom: ${pointsToInches(marginBottomPt)}in;
				color: ${layout.sidebar.textColor};
				line-height: 1.3;
			">${entry.text}</div>`;
		})
		.join("");

	// Build title HTML
	const titleHtml = sections.titleLines
		.map((line, index) => {
			const marginBottom =
				index === sections.titleLines.length - 1 ? 0 : line.marginBottom;
			const titleConfig = layout.title;
			const titleSection = layout.contentBox.titleSection;
			return `<div style="
				font-size: ${line.fontSize}pt;
				font-weight: ${titleSection?.fontWeight ?? titleConfig.fontWeight ?? "bold"};
				letter-spacing: ${pointsToInches(titleSection?.letterSpacing !== undefined ? titleSection.letterSpacing : (titleConfig.letterSpacing ?? 4))}in;
				margin: 0;
				margin-bottom: ${pointsToInches(marginBottom)}in;
				line-height: 1.0;
				font-family: ${titleSection?.fontFamily ?? "'Times New Roman', Times, serif"};
				text-align: center;
				color: ${titleSection?.color ?? titleConfig.color ?? "#000000"};
			">
				${line.text}
			</div>`;
		})
		.join("");

	// Build body paragraphs HTML with proper line wrapping
	const paragraphSpacingIn = `${pointsToInches(layout.body.paragraphSpacing)}in`;
	const paragraphHtml = bodyParagraphs
		.map((paragraph, index) => {
			const lines = splitTextIntoLinesHTML(
				paragraph,
				layout.body.fontSize,
				bodyMaxWidthPx
			);
			const spacing = index === bodyParagraphs.length - 1 ? "0" : paragraphSpacingIn;
			// Convert **text** to <strong>text</strong> in each line
			const htmlLines = lines.map((line) => line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'));
			return `<p style="
				margin: 0 0 ${spacing} 0;
				font-size: ${layout.body.fontSize}pt;
				line-height: ${layout.body.lineHeight / layout.body.fontSize};
				font-family: 'Times New Roman', Times, serif;
				text-align: justify;
				text-indent: 0.5in;
			">
				${htmlLines.join(" ")}
			</p>`;
		})
		.join("");

	// Add photo HTML if available (1x1 picture) - positioned in top right corner of content box
	const photoPaddingIn = `${pointsToInches(10)}in`;
	const photoHtml = certificateData.photoUrl
		? `<div style="
				position: absolute;
				top: ${photoPaddingIn};
				right: ${photoPaddingIn};
				width: 1in;
				height: 1in;
				page-break-inside: avoid;
			">
				<img src="${certificateData.photoUrl}" alt="1x1 Photo" style="
					width: 100%;
					height: 100%;
					border: 1px solid #000;
					object-fit: cover;
					display: block;
				" onerror="console.error('Failed to load photo:', this.src); this.style.display='none';" />
			</div>`
		: "";

	// Build signature HTML
	const signatureHtml = (() => {
		const signatureImg = certificateData.hasSignature && certificateData.signatureUrl
			? `<img src="${certificateData.signatureUrl}" alt="Signature" style="
				height: ${pointsToInches(50)}in;
				max-width: 100%;
				object-fit: contain;
			" />`
			: "";
		
		return `
			<div style="
				display:flex;
				flex-direction:column;
				align-items:flex-end;
				gap:0.1in;
			">
				<div style="
					width: ${pointsToInches(layout.signature.boxWidth)}in;
					border-bottom: 1px ${layout.signature.boxBorderStyle ?? "solid"} ${layout.signature.boxBorderColor ?? "#000000"};
					height: 0.8in;
					display:flex;
					align-items:flex-end;
					justify-content:center;
				">
					${signatureImg}
				</div>
				<div style="
					font-weight: bold;
					font-size: ${layout.signature.nameFontSize}pt;
					font-family: 'Times New Roman', Times, serif;
					color: ${layout.signature.nameColor ?? "#000000"};
				">
					${officialInfo.name.toUpperCase()}
				</div>
				<div style="
					font-size: ${layout.signature.positionFontSize}pt;
					font-family: 'Times New Roman', Times, serif;
					color: ${layout.signature.positionColor ?? "#000000"};
				">
					${officialInfo.position}
				</div>
			</div>
		`;
	})();

	// Build footer HTML
	const footerHtml = layout.footer.lines
		.map(
			(line, index) => {
				const marginBottom = index === layout.footer.lines.length - 1
					? 0
					: layout.footer.lineSpacing - line.fontSize;
				return `
				<div style="
					font-weight: ${line.font === "helveticaBold" ? "bold" : "normal"};
					font-size: ${line.fontSize}pt;
					font-family: 'Helvetica', 'Arial', sans-serif;
					margin-bottom: ${marginBottom > 0 ? `${pointsToInches(marginBottom)}in` : "0"};
					line-height: 1.2;
				">
					${line.text}
				</div>
			`;
			}
		)
		.join("");

	// Logo URL - use absolute path
	const logoUrl = typeof window !== "undefined" 
		? `${window.location.origin}/images/malinta_logo.jpg`
		: "/images/malinta_logo.jpg";

	// Sidebar gradient
	const sidebarGradient = buildSidebarGradientCSS(
		layout.sidebar.backgroundTopColor,
		layout.sidebar.backgroundBottomColor
	);

	return `
		<!doctype html>
		<html>
		<head>
			<meta charset="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"/>
			<title>Certificate - ${certificateData.type}</title>
			<style>
				@media print {
					@page { 
						size: 8.5in 11in; 
						margin: 0.3in; 
					}
					html, body { 
						width: 8.5in; 
						height: 11in; 
						margin: 0; 
						padding: 0;
						overflow: hidden;
					}
					body { 
						margin: 0; 
						-webkit-print-color-adjust: exact; 
						print-color-adjust: exact;
						page-break-after: avoid;
					}
					body > div {
						page-break-after: avoid;
						page-break-inside: avoid;
					}
					* { 
						page-break-inside: avoid;
					}
				}
				* { 
					margin: 0; 
					padding: 0; 
					box-sizing: border-box; 
				}
				body { 
					font-family: 'Helvetica', 'Arial', sans-serif; 
					padding: 0; 
					color: #000; 
					background: #fff;
					width: ${pageWidthIn};
					height: ${pageHeightIn};
					position: relative;
				}
			</style>
		</head>
		<body>
			<!-- Border -->
			<div style="
				position: absolute;
				left: 0;
				top: 0;
				width: ${pageWidthIn};
				height: ${pageHeightIn};
				border: ${pointsToInches(layout.borderWidth)}in solid #000;
				pointer-events: none;
			"></div>

			<!-- Seal/Logo -->
			<div style="
				position: absolute;
				left: ${sealLeftIn};
				top: ${sealTopIn};
				width: ${sealSizeIn};
				height: ${sealSizeIn};
				border: ${pointsToInches(layout.seal.borderWidth)}in solid #000;
				overflow: hidden;
				box-sizing: border-box;
			">
				<img src="${logoUrl}" alt="Barangay Seal" style="
					width: 100%;
					height: 100%;
					object-fit: contain;
				" onerror="this.style.display='none';" />
			</div>

			<!-- Header Text -->
			<div style="
				position: absolute;
				left: ${headerLeftIn};
				top: ${headerTopIn};
			">
				${headerLinesHtml}
			</div>

			<!-- Header Divider -->
			<div style="
				position: absolute;
				left: ${pointsToInches(layout.margin + layout.header.divider.leftOffset)}in;
				right: ${pointsToInches(layout.margin + layout.header.divider.rightOffset)}in;
				top: ${pointsToInches(layout.margin + layout.header.divider.yOffset)}in;
				height: ${pointsToInches(layout.header.divider.height)}in;
				background: #000;
			"></div>

			<!-- Office Ribbon -->
			<div style="
				position: absolute;
				left: ${marginIn};
				right: ${marginIn};
				top: ${ribbonTopIn};
				height: ${ribbonHeightIn};
				background: ${layout.header.officeRibbon.backgroundColor};
				border: ${pointsToInches(layout.header.officeRibbon.borderWidth)}in solid #000;
				display: flex;
				align-items: center;
				justify-content: center;
			">
				<div style="
					font-size: ${layout.header.officeRibbon.fontSize}pt;
					font-weight: bold;
					color: ${layout.header.officeRibbon.textColor};
					font-family: 'Helvetica', 'Arial', sans-serif;
					letter-spacing: 0.5pt;
					text-align: center;
				">
					${layout.header.officeRibbon.text}
				</div>
			</div>

			<!-- Sidebar -->
			<div style="
				position: absolute;
				left: ${marginIn};
				top: ${sidebarTopIn};
				width: ${sidebarWidthIn};
				height: ${sidebarHeightIn};
				background: ${sidebarGradient};
				color: ${layout.sidebar.textColor};
				border: ${pointsToInches(layout.sidebar.borderWidth || 0)}in solid #000;
				box-sizing: border-box;
				padding: ${pointsToInches(layout.sidebar.textHorizontalPadding)}in;
				overflow: hidden;
			">
				${sidebarTitleHtml}
				${sidebarEntriesHtml}
			</div>

			<!-- Content Box -->
			<div class="content-box" style="
				position: absolute;
				left: ${pointsToInches(layout.margin + layout.sidebar.width + layout.contentBox.leftGap - layout.contentBox.horizontalPadding)}in;
				top: ${contentBoxTopIn};
				width: ${pointsToInches(layout.page.width - layout.margin - layout.sidebar.width - layout.contentBox.leftGap - layout.contentBox.rightGap - layout.margin + layout.contentBox.horizontalPadding * 2)}in;
				height: ${contentBoxHeightIn};
				${buildContentBoxStylesInches(layout)}
			">
				<!-- Title -->
				<div class="title-section" style="
					position: absolute;
					top: ${titleTopIn};
					left: ${contentPaddingIn};
					right: ${contentPaddingIn};
					${buildTitleSectionStylesInches(layout)}
				">
					${titleHtml}
				</div>

				<!-- Photo (positioned in top right corner) -->
				${photoHtml}

				<!-- Body Paragraphs -->
				<div class="body-section" style="
					position: absolute;
					top: ${pointsToInches((layout.contentBox.titleOffset - layout.contentBox.topOffset) - 10 + 25 + sections.titleLines.reduce((sum, line) => sum + line.fontSize + line.marginBottom, 0) + layout.body.topSpacing - 30)}in;
					left: ${pointsToInches(layout.body.contentMarginX)}in;
					right: ${pointsToInches(layout.body.contentMarginX)}in;
					${buildBodySectionStylesInches(layout)}
				">
					${paragraphHtml}
				</div>

				<!-- Signature -->
				<div class="signature-section" style="
					position: absolute;
					bottom: ${pointsToInches(layout.signature.offsetFromBody)}in;
					right: ${pointsToInches(layout.signature.horizontalOffset)}in;
					text-align: center;
				">
					${signatureHtml}
				</div>
			</div>

			<!-- Footer -->
			<div style="
				position: absolute;
				bottom: ${pointsToInches(layout.margin + layout.footer.bottomOffset)}in;
				left: ${marginIn};
				right: ${marginIn};
				text-align: right;
				padding: ${pointsToInches(8)}in;
			">
				${footerHtml}
			</div>
		</body>
		</html>
	`;
}

export function buildPrintableCertificateHtml(
	certificateData: CertificateData,
	officialInfo: OfficialInfo
): string {
	const layout = CERTIFICATE_LAYOUT;
	const sections = buildCertificateSections(certificateData);
	const issuanceDate = resolveIssuanceDate(certificateData.generatedOn);
	const bodyParagraphs = [
		...sections.bodyParagraphs,
		getIssuanceParagraph(issuanceDate),
	];

	const pageWidthIn = `${pointsToInches(layout.page.width)}in`;
	const pageHeightIn = `${pointsToInches(layout.page.height)}in`;
	const marginIn = `${pointsToInches(layout.margin)}in`;
	const leftColumnPercent = (layout.columns.leftWidthRatio ?? 0.2) * 100;
	const columnGapPx = `1px`;
	const leftGradient = `linear-gradient(180deg, ${layout.columns.leftBackgroundTopColor} 0%, ${layout.columns.leftBackgroundBottomColor} 100%)`;
	const leftPaddingXIn = `2px`;
	const leftPaddingTopIn = `${pointsToInches(layout.columns.leftPaddingTop ?? 18)}in`;
	const paragraphSpacingIn = `${pointsToInches(layout.body.paragraphSpacing)}in`;
	const footerSpacing = `${pointsToInches(layout.footer.lineSpacing)}in`;

	const headerLinesHtml = layout.header.lines
		.map(
			(line) => `
			<div style="
				font-size:${line.fontSize}pt;
				font-weight:${line.font === "helveticaBold" ? "bold" : "normal"};
				letter-spacing:0.5pt;
				text-transform:uppercase;
			">
				${line.text}
			</div>`
		)
		.join("");

	const sidebarTitleHtml = layout.sidebar.title
		.map(
			(entry) => `
			<div style="
				font-size:${entry.fontSize}pt;
				font-weight:bold;
				text-transform:uppercase;
				letter-spacing:1px;
			">
				${entry.text}
			</div>`
		)
		.join("");

	const sidebarEntriesHtml = layout.sidebar.entries
		.map((entry) => {
			const fontWeight = entry.font === "helveticaBold" ? "bold" : "normal";
			const fontStyle = entry.italic ? "italic" : "normal";
			const marginBottom = `${pointsToInches(entry.marginBottom ?? 3)}in`;
			return `<div style="
				font-size:${entry.fontSize}pt;
				font-weight:${fontWeight};
				font-style:${fontStyle};
				margin-bottom:${marginBottom};
				line-height:1.3;
				text-transform:uppercase;
			">
				${entry.text}
			</div>`;
		})
		.join("");

	const titleHtml = sections.titleLines
		.map(
			(line) => {
				const titleConfig = layout.title;
				const titleSection = layout.contentBox.titleSection;
				return `
		<div style="
			font-size:${line.fontSize}pt;
			font-weight:${titleSection?.fontWeight ?? titleConfig.fontWeight ?? "bold"};
			letter-spacing:${pointsToInches(titleSection?.letterSpacing !== undefined ? titleSection.letterSpacing : (titleConfig.letterSpacing ?? 4))}in;
			line-height:1.0;
			text-align:center;
			font-family:${titleSection?.fontFamily ?? "'Times New Roman', Times, serif"};
			color:${titleSection?.color ?? titleConfig.color ?? "#000000"};
		">
			${line.text}
		</div>`;
			}
		)
		.join("");

	const paragraphHtml = bodyParagraphs
		.map((paragraph, index) => {
			const spacing = index === bodyParagraphs.length - 1 ? "0" : paragraphSpacingIn;
			const bodySection = layout.contentBox.bodySection;
			const body = layout.body;
			// Convert **text** to <strong>text</strong>
			const htmlParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			return `<p style="
				margin:0 0 ${spacing} 0;
				font-size:${bodySection?.fontSize ?? body.fontSize}pt;
				line-height:${bodySection?.lineHeight ?? body.lineHeight / body.fontSize};
				font-family:${bodySection?.fontFamily ?? body.fontFamily ?? "'Times New Roman', Times, serif"};
				text-align:${bodySection?.textAlign ?? "justify"};
				color:${bodySection?.color ?? body.color ?? "#000000"};
				text-indent:0.5in;
			">
				${htmlParagraph}
			</p>`;
		})
		.join("");

	// Add photo HTML if available (1x1 picture) - positioned in top right corner of content box
	const photoPaddingIn = `${pointsToInches(10)}in`;
	const photoHtml = certificateData.photoUrl
		? `<div style="
				position: absolute;
				top: ${photoPaddingIn};
				right: ${photoPaddingIn};
				width: 1in;
				height: 1in;
				page-break-inside: avoid;
			">
				<img src="${certificateData.photoUrl}" alt="1x1 Photo" style="
					width: 100%;
					height: 100%;
					border: 1px solid #000;
					object-fit: cover;
					display: block;
				" onerror="console.error('Failed to load photo:', this.src); this.style.display='none';" />
			</div>`
		: "";

	const signatureImg =
		certificateData.hasSignature && certificateData.signatureUrl
			? `<img src="${certificateData.signatureUrl}" alt="Signature" style="height:${pointsToInches(50)}in;max-width:100%;object-fit:contain;" />`
			: "";

	const signatureHtml = `
		<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.1in;">
			<div style="
				width:${pointsToInches(layout.signature.boxWidth)}in;
				height:0.8in;
				border-bottom:1px ${layout.signature.boxBorderStyle ?? "solid"} ${layout.signature.boxBorderColor ?? "#000000"};
				display:flex;
				align-items:flex-end;
				justify-content:center;
			">
				${signatureImg}
			</div>
			<div style="
				font-weight:bold;
				font-size:${layout.signature.nameFontSize}pt;
				font-family:'Times New Roman', Times, serif;
				color:${layout.signature.nameColor ?? "#000000"};
			">
				${officialInfo.name.toUpperCase()}
			</div>
			<div style="
				font-size:${layout.signature.positionFontSize}pt;
				font-family:'Times New Roman', Times, serif;
				color:${layout.signature.positionColor ?? "#000000"};
			">
				${officialInfo.position}
			</div>
		</div>
	`;

	const footerHtml = layout.footer.lines
		.map(
			(line) => `
		<div style="
			font-size:${line.fontSize}pt;
			font-weight:${line.font === "helveticaBold" ? "bold" : "normal"};
			text-transform:uppercase;
			line-height:1.4;
		">
			${line.text}
		</div>`
		)
		.join("");

	const logoUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/images/malinta_logo.jpg`
			: "/images/malinta_logo.jpg";

	return `
	<!doctype html>
	<html>
	<head>
		<meta charset="utf-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>Certificate - ${certificateData.type}</title>
		<style>
			@media print {
				@page {
					size: 8.5in 11in;
					margin: 0.3in;
				}
				html, body {
					margin: 0;
					padding: 0;
					width: 100%;
					height: 100%;
					overflow: hidden;
				}
				body {
					-webkit-print-color-adjust: exact;
					print-color-adjust: exact;
					page-break-after: avoid;
				}
				body > div {
					page-break-after: avoid;
					page-break-inside: avoid;
				}
			}
			* {
				box-sizing: border-box;
			}
			body {
				font-family: 'Helvetica', 'Arial', sans-serif;
				background:#fff;
				color:#000;
				margin:0;
			}
		</style>
	</head>
	<body>
		<div style="
			width:${pageWidthIn};
			height:${pageHeightIn};
			margin:0 auto;
			padding:${marginIn};
			display:flex;
			gap:${columnGapPx};
			background:#fff;
		">
			<div style="
				flex:0 0 ${leftColumnPercent}%;
				display:flex;
				flex-direction:column;
				gap:${columnGapPx};
			">
				<div style="
					flex:1;
					border:none;
					background:transparent;
					padding:0 ${leftPaddingXIn};
					display:flex;
					flex-direction:column;
					align-items:center;
					gap:2px;
				">
					<div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:0.15in;">
						<div style="
							width:${pointsToInches(layout.seal.size)}in;
							height:${pointsToInches(layout.seal.size)}in;
							background:#fff;
							display:flex;
							align-items:center;
							justify-content:center;
						">
							<img src="${logoUrl}" alt="Barangay Seal" style="width:100%;height:100%;object-fit:contain;"/>
						</div>
					
					</div>
					<div style="
						width:100%;
						background:${leftGradient};
						padding:${leftPaddingTopIn} 4px;
						display:flex;
						flex-direction:column;
						gap:0.1in;
						color:${layout.columns.leftTextColor};
					">
						<div style="
							width:100%;
							color:${layout.columns.leftHeadingColor};
							padding:0.12in 0.1in;
							text-align:center;
							text-transform:uppercase;
							font-weight:bold;
							letter-spacing:1px;
						">
							${sidebarTitleHtml}
						</div>
						<div style="
							width:100%;
							display:flex;
							flex-direction:column;
							gap:0.05in;
							font-size:9pt;
							text-align:left;
							text-transform:uppercase;
						">
							${sidebarEntriesHtml}
						</div>
					</div>
				</div>
			</div>
			<div style="
				flex:1;
				display:flex;
				flex-direction:column;
				gap:${columnGapPx};
				margin-top:5px;
			">
				<div style="
					display:flex;
					flex-direction:column;
					gap:0.04in;
					font-weight:bold;
					text-transform:uppercase;
					letter-spacing:0.5pt;
				">
					${headerLinesHtml}
				</div>
				<div style="height:2px;background:#000;"></div>
				<div style="
					color:#000080;
					text-align:left;
					font-weight:bold;
					font-size:18pt;
					font-family: 'times new roman', times, serif;
					margin-top: 10px;
					letter-spacing:0.5pt;
				">
					${layout.header.officeRibbon.text}
				</div>
				<div class="content-box" style="
					min-height: 7.5in;
					display:flex;
					margin: 10px 0;
					flex-direction:column;
					gap:0.35in;
					position: relative;
					${buildContentBoxStylesInches(layout)}
				">
					<!-- Photo (positioned in top right corner) -->
					${photoHtml}

					<div class="title-section" style="
						text-align:${layout.contentBox.titleSection?.textAlign ?? "center"};
					">
						${titleHtml}
					</div>
					<div class="body-section" style="
						display:flex;
						flex-direction:column;
						gap:${paragraphSpacingIn};
						${buildBodySectionStylesInches(layout)}
					">
						${paragraphHtml}
					</div>
					<div class="signature-section">
						${signatureHtml}
					</div>
				</div>
				<div style="
					text-align:right;
					font-size:7pt;
					line-height:1.4;
					text-transform:uppercase;
					display:flex;
					flex-direction:column;
					gap:${footerSpacing};
				">
					${footerHtml}
				</div>
			</div>
		</div>
	</body>
	</html>
	`;
}

// Open certificate print window
export function openCertificatePrintWindow(html: string): void {
	try {
		const printWindow = window.open("", "_blank");
		if (!printWindow) {
			console.error("Failed to open print window");
			return;
		}

		printWindow.document.open();
		printWindow.document.write(html);
		printWindow.document.close();

		// Wait for images to load before printing
		const waitForImages = () => {
			const images = printWindow.document.getElementsByTagName("img");
			let loadedCount = 0;
			const totalImages = images.length;

			if (totalImages === 0) {
				// No images, print immediately
				setTimeout(() => {
					printWindow.focus();
					printWindow.print();
				}, 300);
				return;
			}

			const checkComplete = () => {
				loadedCount++;
				if (loadedCount === totalImages) {
					setTimeout(() => {
						printWindow.focus();
						printWindow.print();
					}, 300);
				}
			};

			// Set up image load handlers
			Array.from(images).forEach((img) => {
				if (img.complete) {
					checkComplete();
				} else {
					img.onload = checkComplete;
					img.onerror = checkComplete; // Continue even if image fails to load
				}
			});
		};

		// Wait for document to be ready
		if (printWindow.document.readyState === "complete") {
			waitForImages();
		} else {
			printWindow.onload = waitForImages;
		}

		// Fallback: if onload doesn't fire, try after a delay
		setTimeout(() => {
			if (printWindow.document.readyState === "complete") {
				waitForImages();
			}
		}, 2000);
	} catch (error) {
		console.error("Error opening print window:", error);
	}
}
