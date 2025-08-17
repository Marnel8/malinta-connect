const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, push } = require("firebase/database");

const firebaseConfig = {
	apiKey: "your-api-key",
	authDomain: "your-auth-domain",
	databaseURL: "your-database-url",
	projectId: "your-project-id",
	storageBucket: "your-storage-bucket",
	messagingSenderId: "your-messaging-sender-id",
	appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sample data with meaningful reference numbers
const sampleCertificates = [
	{
		id: "CERT-2025-0426-001",
		type: "Barangay Clearance",
		requestedBy: "Juan Dela Cruz",
		requestedOn: "April 26, 2025",
		status: "pending",
		purpose: "Employment requirement",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		id: "CERT-2025-0426-002",
		type: "Indigency Certificate",
		requestedBy: "Maria Santos",
		requestedOn: "April 26, 2025",
		status: "processing",
		purpose: "Scholarship application",
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
];

const sampleAppointments = [
	{
		id: "APT-2025-0426-001",
		title: "Barangay Consultation",
		description: "Discussion about community concerns",
		date: "2025-04-27",
		time: "09:00 AM",
		requestedBy: "Pedro Reyes",
		contactNumber: "09123456789",
		email: "pedro@example.com",
		status: "pending",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		id: "APT-2025-0426-002",
		title: "Document Processing",
		description: "Assistance with document requirements",
		date: "2025-04-28",
		time: "02:00 PM",
		requestedBy: "Ana Garcia",
		contactNumber: "09876543210",
		email: "ana@example.com",
		status: "confirmed",
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
];

const sampleBlotterEntries = [
	{
		id: "BLT-2025-0426-001",
		title: "Noise Complaint",
		description: "Excessive noise from construction site",
		reportedBy: "Luis Mendoza",
		contactNumber: "09111222333",
		email: "luis@example.com",
		status: "pending",
		priority: "medium",
		location: "123 Main Street",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		id: "BLT-2025-0426-002",
		title: "Traffic Violation",
		description: "Illegal parking blocking driveway",
		reportedBy: "Carmen Lopez",
		contactNumber: "09444555666",
		email: "carmen@example.com",
		status: "investigating",
		priority: "high",
		location: "456 Oak Avenue",
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
];

const sampleEvents = [
	{
		id: "EVT-2025-0426-001",
		name: "Community Clean-up Drive",
		date: "2025-05-01",
		time: "08:00 AM",
		location: "Barangay Plaza",
		description: "Annual community clean-up activity",
		category: "community",
		organizer: "Barangay Council",
		contact: "09123456789",
		status: "active",
		featured: true,
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		id: "EVT-2025-0426-002",
		name: "Health Seminar",
		date: "2025-05-05",
		time: "02:00 PM",
		location: "Barangay Hall",
		description: "Free health awareness seminar",
		category: "health",
		organizer: "Health Department",
		contact: "09876543210",
		status: "active",
		featured: false,
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
];

async function seedReferenceNumbers() {
	try {
		console.log("🌱 Seeding database with meaningful reference numbers...");

		// Seed certificates
		console.log("📄 Seeding certificates...");
		for (const cert of sampleCertificates) {
			await set(ref(database, `certificates/${cert.id}`), cert);
			console.log(`   ✅ Created: ${cert.id} - ${cert.type}`);
		}

		// Seed appointments
		console.log("📅 Seeding appointments...");
		for (const apt of sampleAppointments) {
			await set(ref(database, `appointments/${apt.id}`), apt);
			console.log(`   ✅ Created: ${apt.id} - ${apt.title}`);
		}

		// Seed blotter entries
		console.log("📝 Seeding blotter entries...");
		for (const blt of sampleBlotterEntries) {
			await set(ref(database, `blotter/${blt.id}`), blt);
			console.log(`   ✅ Created: ${blt.id} - ${blt.title}`);
		}

		// Seed events
		console.log("🎉 Seeding events...");
		for (const evt of sampleEvents) {
			await set(ref(database, `events/${evt.id}`), evt);
			console.log(`   ✅ Created: ${evt.id} - ${evt.name}`);
		}

		console.log("\n🎯 Reference Number Format Examples:");
		console.log("   📄 Certificates: CERT-2025-0426-001 (Certificate-YYYY-MMDD-Sequence)");
		console.log("   📅 Appointments: APT-2025-0426-001 (Appointment-YYYY-MMDD-Sequence)");
		console.log("   📝 Blotter: BLT-2025-0426-001 (Blotter-YYYY-MMDD-Sequence)");
		console.log("   🎉 Events: EVT-2025-0426-001 (Event-YYYY-MMDD-Sequence)");
		
		console.log("\n✅ Database seeded successfully!");
		console.log("💡 Each reference number includes:");
		console.log("   - Module prefix (CERT, APT, BLT, EVT)");
		console.log("   - Year (2025)");
		console.log("   - Month and Day (0426 = April 26)");
		console.log("   - Sequential number for the day (001, 002, etc.)");

	} catch (error) {
		console.error("❌ Error seeding database:", error);
	}
}

// Run the seeding function
seedReferenceNumbers();
