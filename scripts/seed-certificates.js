const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, push } = require("firebase/database");

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBikZaDVZB1OjPxE3DEQ-0rj_CcEBeAZgM",
	authDomain: "malinta-connect.firebaseapp.com",
	projectId: "malinta-connect",
	storageBucket: "malinta-connect.firebasestorage.app",
	messagingSenderId: "660399403341",
	appId: "1:660399403341:web:66e44c464ca7dc4582c704",
	databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sample certificate data
const sampleCertificates = [
	{
		type: "Barangay Clearance",
		requestedBy: "Juan Dela Cruz",
		requestedOn: "April 22, 2025",
		status: "processing",
		purpose: "Job application",
		estimatedCompletion: "April 24, 2025",
		notes: "Standard processing time applies",
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		type: "Certificate of Residency",
		requestedBy: "Maria Santos",
		requestedOn: "April 20, 2025",
		status: "ready",
		purpose: "Voter's registration",
		estimatedCompletion: "April 21, 2025",
		notes: "Ready for pickup",
		createdAt: Date.now() - 86400000, // 1 day ago
		updatedAt: Date.now() - 86400000,
	},
	{
		type: "Certificate of Indigency",
		requestedBy: "Pedro Reyes",
		requestedOn: "April 15, 2025",
		status: "additionalInfo",
		purpose: "Medical assistance",
		estimatedCompletion: "Pending requirements",
		notes:
			"Additional documents required: proof of income, medical certificate",
		createdAt: Date.now() - 604800000, // 7 days ago
		updatedAt: Date.now() - 604800000,
	},
	{
		type: "Barangay Clearance",
		requestedBy: "Ana Martinez",
		requestedOn: "April 18, 2025",
		status: "pending",
		purpose: "Business permit renewal",
		estimatedCompletion: "April 25, 2025",
		notes: "New application",
		createdAt: Date.now() - 259200000, // 3 days ago
		updatedAt: Date.now() - 259200000,
	},
	{
		type: "Certificate of Residency",
		requestedBy: "Carlos Rodriguez",
		requestedOn: "April 10, 2025",
		status: "completed",
		purpose: "School enrollment",
		estimatedCompletion: "April 12, 2025",
		notes: "Certificate issued and delivered",
		completedOn: "April 12, 2025",
		createdAt: Date.now() - 1209600000, // 14 days ago
		updatedAt: Date.now() - 1209600000,
	},
	{
		type: "Certificate of Indigency",
		requestedBy: "Luz Fernandez",
		requestedOn: "April 5, 2025",
		status: "rejected",
		purpose: "Housing assistance",
		estimatedCompletion: "N/A",
		notes: "Application incomplete",
		rejectedReason:
			"Insufficient documentation and incomplete application form",
		createdAt: Date.now() - 1814400000, // 21 days ago
		updatedAt: Date.now() - 1814400000,
	},
];

async function seedCertificates() {
	try {
		console.log("🌱 Starting to seed certificates...");

		const certificatesRef = ref(database, "certificates");

		for (const certificate of sampleCertificates) {
			const newCertRef = push(certificatesRef);
			await set(newCertRef, certificate);
			console.log(
				`✅ Added certificate: ${certificate.type} for ${certificate.requestedBy}`
			);
		}

		console.log("🎉 Successfully seeded all certificates!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding certificates:", error);
		process.exit(1);
	}
}

// Run the seed function
seedCertificates();
