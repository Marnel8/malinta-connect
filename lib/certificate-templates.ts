"use client";

export interface CertificateContentData {
	id: string;
	type: string;
	requestedBy: string;
	purpose: string;
	generatedOn: string;
	age?: string;
	address?: string;
	occupation?: string;
	income?: string;
	incomeYear?: string;
	jobTitle?: string;
	employmentPeriod?: string;
	businessName?: string;
	businessLocation?: string;
	closureDate?: string;
	closureReason?: string;
	relationship?: string;
	nonResidenceDuration?: string;
	supportDetails?: string;
	allowanceAmount?: string;
	signatureUrl?: string;
	hasSignature?: boolean;
}

export type PdfFontKey = "helvetica" | "helveticaBold" | "times" | "timesBold" | "arial" | "arialBold";

export interface LayoutHeaderLine {
	text: string;
	font: PdfFontKey;
	fontSize: number;
}

export interface LayoutSidebarEntry {
	text: string;
	font: PdfFontKey;
	fontSize: number;
	italic?: boolean;
	center?: boolean;
	marginBottom?: number;
}

export interface CertificateLayoutConfig {
	page: { width: number; height: number };
	margin: number;
	borderWidth: number;
	columns: {
		leftWidthRatio: number;
		gap: number;
		leftPaddingX: number;
		leftPaddingTop: number;
		leftBackgroundTopColor: string;
		leftBackgroundBottomColor: string;
		leftHeadingBackground: string;
		leftHeadingColor: string;
		leftTextColor: string;
		leftLineColor: string;
	};
	header: {
		lines: LayoutHeaderLine[];
		lineSpacing: number;
		topOffset: number;
		leftOffset?: number;
		officeRibbon: {
			text: string;
			font: PdfFontKey;
			fontSize: number;
			height: number;
			backgroundColor: string;
			textColor: string;
			borderWidth: number;
			topOffset: number;
		};
		divider: {
			leftOffset: number;
			rightOffset: number;
			yOffset: number;
			height: number;
		};
	};
	seal: {
		size: number;
		borderWidth: number;
		topOffset: number;
		leftOffset: number;
	};
	sidebar: {
		width: number;
		topOffset: number;
		bottomOffset: number;
		contentTopOffset: number;
		backgroundTopColor: string;
		backgroundBottomColor: string;
		textColor: string;
		textHorizontalPadding: number;
		borderWidth?: number;
		title: LayoutSidebarEntry[];
		entries: LayoutSidebarEntry[];
	};
	contentBox: {
		horizontalPadding: number;
		paddingTop?: number;
		paddingBottom?: number;
		paddingLeft?: number;
		paddingRight?: number;
		borderWidth: number;
		borderColor?: string;
		borderStyle?: string;
		backgroundColor?: string;
		topOffset: number;
		bottomOffset: number;
		leftGap: number;
		rightGap: number;
		titleOffset: number;
		titleSection?: {
			marginTop?: number;
			marginBottom?: number;
			textAlign?: "left" | "center" | "right";
			fontSize?: number;
			fontWeight?: "normal" | "bold";
			fontFamily?: string;
			letterSpacing?: number;
			color?: string;
		};
		bodySection?: {
			marginTop?: number;
			marginBottom?: number;
			textAlign?: "left" | "center" | "right" | "justify";
			fontSize?: number;
			fontFamily?: string;
			lineHeight?: number;
			color?: string;
		};
		signatureSection?: {
			marginTop?: number;
			textAlign?: "left" | "center" | "right";
			alignment?: "left" | "center" | "right";
		};
	};
	body: {
		font: PdfFontKey;
		fontSize: number;
		lineHeight: number;
		paragraphSpacing: number;
		contentMarginX: number;
		topSpacing: number;
		fontFamily?: string;
		color?: string;
	};
	title: {
		fontSize?: number;
		fontWeight?: "normal" | "bold";
		letterSpacing?: number;
		color?: string;
		marginBottom?: number;
	};
	signature: {
		boxWidth: number;
		boxHeight: number;
		lineOffsetY: number;
		offsetFromBody: number;
		horizontalOffset: number;
		nameFont: PdfFontKey;
		nameFontSize: number;
		nameOffsetY: number;
		positionFont: PdfFontKey;
		positionFontSize: number;
		positionOffsetY: number;
		boxBorderColor?: string;
		boxBorderStyle?: string;
		nameColor?: string;
		positionColor?: string;
	};
	footer: {
		lines: LayoutHeaderLine[];
		lineSpacing: number;
		bottomOffset: number;
	};
}

export interface TitleLine {
	text: string;
	fontSize: number;
	marginBottom: number;
}

export interface CertificateTemplateConfig {
	id: string;
	match: (type: string) => boolean;
	titleLines: TitleLine[];
	buildBody: (data: CertificateContentData) => string[];
	previewDescription: string;
}

export const CERTIFICATE_LAYOUT: CertificateLayoutConfig = {
	page: { width: 595, height: 842 },
	margin: 39,
	borderWidth: 2,
	columns: {
		leftWidthRatio: 0.2,
		gap: 2,
		leftPaddingX: 14,
		leftPaddingTop: 24,
		leftBackgroundTopColor: "#2f3ebd",
		leftBackgroundBottomColor: "#e6e6ff",
		leftHeadingBackground: "#2b39c6",
		leftHeadingColor: "#ffffff",
		leftTextColor: "#0b1c68",
		leftLineColor: "#000000",
	},
	header: {
		lines: [
			{
				text: "REPUBLIC OF THE PHILIPPINES",
				font: "helveticaBold",
				fontSize: 10,
			},
			{
				text: "PROVINCE OF LAGUNA",
				font: "helveticaBold",
				fontSize: 11,
			},
			{
				text: "MUNICIPALITY OF LOS BAÑOS",
				font: "helveticaBold",
				fontSize: 10,
			},
			{
				text: "BARANGAY MALINTA",
				font: "helveticaBold",
				fontSize: 10,
			},
		],
		lineSpacing: 13,
		topOffset: 40,
		leftOffset: 130,
		officeRibbon: {
			text: "OFFICE OF THE SANGGUNIANG BARANGAY",
			font: "helveticaBold",
			fontSize: 16,
			height: 25,
			backgroundColor: "#000080",
			textColor: "#FFFFFF",
			borderWidth: 1,
			topOffset: 110,
		},
		divider: {
			leftOffset: 0,
			rightOffset: 0,
			yOffset: 100,
			height: 1,
		},
	},
	seal: {
		size: 90,
		borderWidth: 1,
		topOffset: 35,
		leftOffset: 6,
	},
	sidebar: {
		width: 120,
		topOffset: 180,
		bottomOffset: 120,
		contentTopOffset: 176,
		backgroundTopColor: "#FFFFFF",
		backgroundBottomColor: "#FFFFFF",
		textColor: "#000000",
		textHorizontalPadding: 5,
		borderWidth: 0,
		title: [
			{
				text: "SANGGUNIANG BARANGAY",
				font: "helveticaBold",
				fontSize: 7,
				center: true,
				marginBottom: 1,
			},
			{
				text: "OF MALINTA",
				font: "helveticaBold",
				fontSize: 7,
				center: true,
				marginBottom: 6,
			},
		],
		entries: [
			{
				text: "PUNONG BARANGAY",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "HON. JESUS H. DE UNA JR.",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 6,
			},
			{
				text: "BARANGAY KAGAWAD",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "HON. ROLANDO L. ERROBA",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "HEALTH & EDUCATION",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 4,
			},
			{
				text: "HON. RANIE F. ANDAL",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 6,
			},
			{
				text: "HON. ERNESTO G.",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "ALCANTARA",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "ENVIRONMENTAL PROTECTION",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "HON. ALLAN B. BIENES",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "INFRASTRUCTURE",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "HON. BENY S. MORALDE",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "PEACE AND ORDER",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "HON. SHERYL S. BAGNES",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "WOMEN AND FAMILY",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "HON. GAUDENCIO D.",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "MARIANO",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "LIVELIHOOD &",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 0,
			},
			{
				text: "COOPERATIVE DEVT /",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 0,
			},
			{
				text: "APPROPRIATIONS, WAYS &",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 0,
			},
			{
				text: "MEANS",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "HON. EDMUND LLOYD E.",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "VELASCO",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 1,
			},
			{
				text: "SPORTS & YOUTH",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 0,
			},
			{
				text: "DEVELOPMENT",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "MS. RICHET E. TAKAHASHI",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "SECRETARY",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "MS. JANE CAMILLE",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "RETIRADO",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "TREASURER",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 5,
			},
			{
				text: "MR. JEFFREY BONITA",
				font: "arialBold",
				fontSize: 7,
				marginBottom: 0,
			},
			{
				text: "ADMIN",
				font: "arialBold",
				fontSize: 6,
				italic: true,
				marginBottom: 0,
			},
		],
	},
	body: {
		font: "times",
		fontSize: 10,
		lineHeight: 13,
		paragraphSpacing: 10,
		contentMarginX: 15,
		topSpacing: 50,
		fontFamily: "'Times New Roman', serif",
		color: "#000000",
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
		letterSpacing: 4,
		color: "#000000",
		marginBottom: 30,
	},
	contentBox: {
		horizontalPadding: 15,
		paddingTop: 35,
		paddingBottom: 30,
		paddingLeft: 30,
		paddingRight: 30,
		borderWidth: 1.5,
		borderColor: "#000000",
		borderStyle: "solid",
		backgroundColor: "#FFFFFF",
		topOffset: 200,
		bottomOffset: 160,
		leftGap: 8,
		rightGap: 0,
		titleOffset: 266,
		titleSection: {
			marginTop: 30,
			marginBottom: 50,
			textAlign: "center",
			fontSize: 22,
			fontWeight: "bold",
			fontFamily: "Arial Black, Arial, sans-serif",
			letterSpacing: 0,
			color: "#000000",
		},
		bodySection: {
			marginTop: 0,
			marginBottom: 10,
			textAlign: "justify",
			fontSize: 11,
			fontFamily: "'Times New Roman', serif",
			lineHeight: 1.6,
			color: "#000000",
		},
		signatureSection: {
			marginTop: 80,
			textAlign: "center",
			alignment: "center",
		},
	},
	signature: {
		boxWidth: 180,
		boxHeight: 50,
		lineOffsetY: 18,
		offsetFromBody: 30,
		horizontalOffset: 30,
		nameFont: "timesBold",
		nameFontSize: 10,
		nameOffsetY: 22,
		positionFont: "times",
		positionFontSize: 8,
		positionOffsetY: 5,
		boxBorderColor: "#000000",
		boxBorderStyle: "solid",
		nameColor: "#000000",
		positionColor: "#000000",
	},
	footer: {
		lines: [
			{
				text: "ADDRESS:",
				font: "helveticaBold",
				fontSize: 7,
			},
			{
				text: "SAN LUIS AVENUE/PUROK 2, BARANGAY MALINTA,LOS BAÑOS, LAGUNA 4030",
				font: "helvetica",
				fontSize: 7,
			},
			{
				text: "TEL. NO. (049) 502-4396",
				font: "helvetica",
				fontSize: 7,
			},
		],
		lineSpacing: 2,
		bottomOffset: 15,
	},
};

function spacedUppercase(text: string): string {
	return text
		.toUpperCase()
		.split("")
		.map((char) => (char === " " ? " " : char))
		.join(" ")
		.replace(/\s{3,}/g, "  ");
}

function buildPurposeParagraph(
	data: CertificateContentData,
	defaultText: string
): string {
	const base = data.purpose?.trim();
	if (!base) {
		return defaultText.replace(/\s+/g, " ");
	}

	return `This certification is being issued upon the request of ${data.requestedBy} for ${base}.`;
}

function buildResidenceLine(data: CertificateContentData): string {
	const upper = data.requestedBy.toUpperCase();
	const addressSegment = data.address
		? ` and residing at ${data.address}`
		: "";
	return `${upper}, of legal age${addressSegment}, is a resident of Brgy. Malinta, Los Baños, Laguna.`;
}

export const CERTIFICATE_TEMPLATES: CertificateTemplateConfig[] = [
	{
		id: "indigency",
		match: (type) => type.toLowerCase().includes("indigency"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "I N D I G E N C Y", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(
				data
			)} This certifies further that the aforementioned resident belongs to the indigent families of this barangay.`,
			buildPurposeParagraph(
				data,
				`This certification is being issued upon the request of ${data.requestedBy} for whatever legal purpose it may serve.`
			),
		],
		previewDescription: "Certificate of Indigency",
	},
	{
		id: "residency",
		match: (type) => type.toLowerCase().includes("residency"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "R E S I D E N C Y", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(
				data
			)} The aforementioned resident is recognized as a bona fide member of this barangay.`,
			buildPurposeParagraph(
				data,
				`This certification is being issued upon the request of ${data.requestedBy} for residency verification purposes.`
			),
		],
		previewDescription: "Certificate of Residency",
	},
	{
		id: "good-moral",
		match: (type) => type.toLowerCase().includes("good moral"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "G O O D   M O R A L", fontSize: 22, marginBottom: 30 },
			{ text: "C H A R A C T E R", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(
				data
			)} The aforementioned resident is known to be of good moral character and has no derogatory record within Barangay Malinta.`,
			buildPurposeParagraph(
				data,
				`This certification is being issued upon the request of ${data.requestedBy} for character verification purposes.`
			),
		],
		previewDescription: "Certificate of Good Moral Character",
	},
	{
		id: "employment",
		match: (type) => type.toLowerCase().includes("employment"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "E M P L O Y M E N T", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => {
			const jobSentence = data.jobTitle
				? `The aforementioned resident is employed as ${data.jobTitle}${
						data.employmentPeriod
							? ` and has served ${data.employmentPeriod}`
							: ""
				  }.`
				: "The aforementioned resident is currently engaged in gainful employment within the jurisdiction of Barangay Malinta.";

			return [
				`This is to certify that ${buildResidenceLine(data)} ${jobSentence}`,
				buildPurposeParagraph(
					data,
					`This certification is being issued upon the request of ${data.requestedBy} for employment verification purposes.`
				),
			];
		},
		previewDescription: "Certificate of Employment",
	},
	{
		id: "no-pending-case",
		match: (type) => type.toLowerCase().includes("no pending case"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "N O   P E N D I N G", fontSize: 22, marginBottom: 30 },
			{ text: "C A S E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(
				data
			)} Based on barangay records, the aforementioned resident has no pending case or complaint within Barangay Malinta.`,
			buildPurposeParagraph(
				data,
				`This certification is being issued upon the request of ${data.requestedBy} for legal clearance purposes.`
			),
		],
		previewDescription: "Certificate of No Pending Case",
	},
	{
		id: "barangay-clearance",
		match: (type) =>
			type.toLowerCase().includes("barangay clearance") ||
			type.toLowerCase().includes("clearance"),
		titleLines: [
			{ text: "B A R A N G A Y", fontSize: 22, marginBottom: 30 },
			{ text: "C L E A R A N C E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(
				data
			)} The aforementioned resident is of good standing in the community and has no barangay liability to the best of our knowledge.`,
			buildPurposeParagraph(
				data,
				`This barangay clearance is being issued upon the request of ${data.requestedBy} for official purposes.`
			),
		],
		previewDescription: "Barangay Clearance",
	},
	{
		id: "income",
		match: (type) => type.toLowerCase().includes("income"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "I N C O M E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => {
			const income =
				data.income && data.income.trim().length > 0
					? ` an annual income of ₱${data.income}`
					: " a reported income";
			const incomeYear = data.incomeYear
				? ` for the year ${data.incomeYear}`
				: "";

			return [
				`This is to certify that ${buildResidenceLine(
					data
				)} The aforementioned resident declares${income}${incomeYear}.`,
				buildPurposeParagraph(
					data,
					`This certification is being issued upon the request of ${data.requestedBy} for income verification purposes.`
				),
			];
		},
		previewDescription: "Certificate of Income",
	},
	{
		id: "business-closure",
		match: (type) => type.toLowerCase().includes("business closure"),
		titleLines: [
			{ text: "B U S I N E S S", fontSize: 22, marginBottom: 30 },
			{ text: "C L O S U R E", fontSize: 22, marginBottom: 30 },
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => {
			const businessName = data.businessName
				? `the business named ${data.businessName}`
				: "their registered business";
			const businessLocation = data.businessLocation
				? ` located at ${data.businessLocation}`
				: "";
			const closureDate = data.closureDate
				? ` effective ${data.closureDate}`
				: "";

			return [
				`This is to certify that ${buildResidenceLine(
					data
				)} The aforementioned resident has formally requested the closure of ${businessName}${businessLocation}${closureDate}.`,
				buildPurposeParagraph(
					data,
					`This certification is being issued upon the request of ${data.requestedBy} to document the closure of the business.`
				),
			];
		},
		previewDescription: "Business Closure Certification",
	},
	{
		id: "non-residence",
		match: (type) => type.toLowerCase().includes("non-residence"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "N O N - R E S I D E N C E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => {
			const duration = data.nonResidenceDuration
				? ` for ${data.nonResidenceDuration}`
				: "";
			return [
				`This is to certify that ${buildResidenceLine(
					data
				)} The aforementioned resident is presently living outside the barangay${duration}.`,
				buildPurposeParagraph(
					data,
					`This certification is being issued upon the request of ${data.requestedBy} for documentation purposes.`
				),
			];
		},
		previewDescription: "Certificate of Non-Residence",
	},
	{
		id: "no-income",
		match: (type) => type.toLowerCase().includes("no income"),
		titleLines: [
			{ text: "C E R T I F I C A T E", fontSize: 22, marginBottom: 30 },
			{ text: "O F", fontSize: 20, marginBottom: 25 },
			{ text: "N O   I N C O M E", fontSize: 22, marginBottom: 30 },
		],
		buildBody: (data) => {
			const support = data.supportDetails
				? ` and receives support through ${data.supportDetails}`
				: "";
			const allowance = data.allowanceAmount
				? ` amounting to ₱${data.allowanceAmount}`
				: "";
			return [
				`This is to certify that ${buildResidenceLine(
					data
				)} The aforementioned resident has no source of income${support}${allowance}.`,
				buildPurposeParagraph(
					data,
					`This certification is being issued upon the request of ${data.requestedBy} for documentation purposes.`
				),
			];
		},
		previewDescription: "Certificate of No Income",
	},
];

export function getCertificateTemplateConfig(
	type: string
): CertificateTemplateConfig {
	const normalized = type.toLowerCase();
	const template = CERTIFICATE_TEMPLATES.find((item) => item.match(normalized));

	if (template) {
		return template;
	}

	return {
		id: "generic",
		match: () => true,
		titleLines: [
			{
				text: spacedUppercase(type || "Certificate"),
				fontSize: 22,
				marginBottom: 30,
			},
		],
		buildBody: (data) => [
			`This is to certify that ${buildResidenceLine(data)}`,
			buildPurposeParagraph(
				data,
				`This certification is being issued upon the request of ${data.requestedBy} for official purposes.`
			),
		],
		previewDescription: type || "Certificate",
	};
}

