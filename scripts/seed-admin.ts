import { ref, set } from "firebase/database";
import { database } from "../app/firebase/firebase";

// Admin user data to seed
const adminUser = {
	uid: "admin-user-123", // This should match the actual Firebase Auth UID
	email: "admin@barangay.gov",
	role: "admin",
	firstName: "Juan",
	lastName: "Dela Cruz",
	phoneNumber: "+63 912 345 6789",
	address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
	position: "Barangay Captain",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	permissions: {
		canManageUsers: true,
		canManageEvents: true,
		canManageCertificates: true,
		canManageAppointments: true,
		canViewAnalytics: true,
		canManageSettings: true,
	},
};

// Official user data to seed
const officialUser = {
	uid: "official-user-456", // This should match the actual Firebase Auth UID
	email: "official@barangay.gov",
	role: "official",
	firstName: "Maria",
	lastName: "Santos",
	phoneNumber: "+63 912 345 6790",
	address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
	position: "Barangay Secretary",
	createdAt: Date.now(),
	updatedAt: Date.now(),
	permissions: {
		canManageUsers: false,
		canManageEvents: true,
		canManageCertificates: true,
		canManageAppointments: true,
		canViewAnalytics: false,
		canManageSettings: false,
	},
};

// Resident user data to seed
const residentUser = {
	uid: "resident-user-789", // This should match the actual Firebase Auth UID
	email: "resident@example.com",
	role: "resident",
	firstName: "Pedro",
	lastName: "Garcia",
	phoneNumber: "+63 912 345 6791",
	address: "123 Main Street, Barangay Malinta, Los Baños, Laguna",
	createdAt: Date.now(),
	updatedAt: Date.now(),
};

async function seedDatabase() {
	try {
		console.log("🌱 Starting database seeding...");

		// Seed admin user
		await set(ref(database, "users/admin-user-123"), adminUser);
		console.log("✅ Admin user seeded successfully");

		// Seed official user
		await set(ref(database, "users/official-user-456"), officialUser);
		console.log("✅ Official user seeded successfully");

		// Seed resident user
		await set(ref(database, "users/resident-user-789"), residentUser);
		console.log("✅ Resident user seeded successfully");

		// Seed some sample data
		const sampleEvents = {
			"event-1": {
				id: "event-1",
				title: "Barangay Assembly",
				description: "Monthly barangay assembly meeting",
				date: "2024-12-15",
				time: "09:00",
				location: "Barangay Hall",
				type: "meeting",
				status: "upcoming",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
			"event-2": {
				id: "event-2",
				title: "Medical Mission",
				description: "Free medical checkup for residents",
				date: "2024-12-20",
				time: "08:00",
				location: "Barangay Health Center",
				type: "health",
				status: "upcoming",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
		};

		await set(ref(database, "events"), sampleEvents);
		console.log("✅ Sample events seeded successfully");

		const sampleCertificates = {
			"cert-1": {
				id: "cert-1",
				type: "Barangay Clearance",
				residentId: "resident-user-789",
				residentName: "Pedro Garcia",
				purpose: "Employment",
				status: "pending",
				requestedAt: Date.now(),
				createdAt: Date.now(),
				updatedAt: Date.now(),
			},
		};

		await set(ref(database, "certificates"), sampleCertificates);
		console.log("✅ Sample certificates seeded successfully");

		console.log("🎉 Database seeding completed successfully!");
		console.log("\n📋 Seeded Users:");
		console.log("   - Admin: admin@barangay.gov (admin-user-123)");
		console.log("   - Official: official@barangay.gov (official-user-456)");
		console.log("   - Resident: resident@example.com (resident-user-789)");
		console.log("\n⚠️  Note: These are placeholder UIDs. You need to:");
		console.log("   1. Create actual Firebase Auth users with these emails");
		console.log(
			"   2. Update the UIDs in this script to match the real Firebase Auth UIDs"
		);
		console.log("   3. Run this script again with the correct UIDs");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
	}
}

// Run the seeding function
seedDatabase();
