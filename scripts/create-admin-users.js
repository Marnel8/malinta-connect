const admin = require("firebase-admin");
const { getDatabase } = require("firebase-admin/database");

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
});

const db = getDatabase();

// User data to create
const usersToCreate = [
	{
		email: "admin@barangay.gov",
		password: "admin123456",
		displayName: "Juan Dela Cruz",
		role: "admin",
		firstName: "Juan",
		lastName: "Dela Cruz",
		phoneNumber: "+63 912 345 6789",
		address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
		position: "Barangay Captain",
		permissions: {
			canManageUsers: true,
			canManageEvents: true,
			canManageCertificates: true,
			canManageAppointments: true,
			canViewAnalytics: true,
			canManageSettings: true,
		},
	},
	{
		email: "official@barangay.gov",
		password: "official123456",
		displayName: "Maria Santos",
		role: "official",
		firstName: "Maria",
		lastName: "Santos",
		phoneNumber: "+63 912 345 6790",
		address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
		position: "Barangay Secretary",
		permissions: {
			canManageUsers: false,
			canManageEvents: true,
			canManageCertificates: true,
			canManageAppointments: true,
			canViewAnalytics: false,
			canManageSettings: false,
		},
	},
	{
		email: "resident@example.com",
		password: "resident123456",
		displayName: "Pedro Garcia",
		role: "resident",
		firstName: "Pedro",
		lastName: "Garcia",
		phoneNumber: "+63 912 345 6791",
		address: "123 Main Street, Barangay Malinta, Los Baños, Laguna",
	},
];

async function createUsersAndSeedDatabase() {
	try {
		console.log("🚀 Starting user creation and database seeding...");

		for (const userData of usersToCreate) {
			try {
				// Create Firebase Auth user
				const userRecord = await admin.auth().createUser({
					email: userData.email,
					password: userData.password,
					displayName: userData.displayName,
					emailVerified: true,
				});

				console.log(
					`✅ Created Firebase Auth user: ${userData.email} (UID: ${userRecord.uid})`
				);

				// Prepare user profile for database
				const userProfile = {
					uid: userRecord.uid,
					email: userData.email,
					role: userData.role,
					firstName: userData.firstName,
					lastName: userData.lastName,
					phoneNumber: userData.phoneNumber,
					address: userData.address,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				};

				// Add role-specific fields
				if (userData.role === "admin" || userData.role === "official") {
					userProfile.position = userData.position;
					userProfile.permissions = userData.permissions;
				}

				// Save user profile to database
				await db.ref(`users/${userRecord.uid}`).set(userProfile);
				console.log(`✅ Saved user profile to database: ${userData.email}`);
			} catch (error) {
				if (error.code === "auth/email-already-exists") {
					console.log(`⚠️  User already exists: ${userData.email}`);

					// Try to get existing user and update database
					try {
						const userRecord = await admin
							.auth()
							.getUserByEmail(userData.email);
						console.log(`📝 Updating existing user profile: ${userData.email}`);

						const userProfile = {
							uid: userRecord.uid,
							email: userData.email,
							role: userData.role,
							firstName: userData.firstName,
							lastName: userData.lastName,
							phoneNumber: userData.phoneNumber,
							address: userData.address,
							createdAt: Date.now(),
							updatedAt: Date.now(),
						};

						if (userData.role === "admin" || userData.role === "official") {
							userProfile.position = userData.position;
							userProfile.permissions = userData.permissions;
						}

						await db.ref(`users/${userRecord.uid}`).set(userProfile);
						console.log(
							`✅ Updated user profile in database: ${userData.email}`
						);
					} catch (updateError) {
						console.error(
							`❌ Error updating user profile: ${userData.email}`,
							updateError
						);
					}
				} else {
					console.error(`❌ Error creating user: ${userData.email}`, error);
				}
			}
		}

		// Seed sample data
		console.log("\n🌱 Seeding sample data...");

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

		await db.ref("events").set(sampleEvents);
		console.log("✅ Sample events seeded successfully");

		console.log("\n🎉 Setup completed successfully!");
		console.log("\n📋 Login Credentials:");
		console.log("   Admin: admin@barangay.gov / admin123456");
		console.log("   Official: official@barangay.gov / official123456");
		console.log("   Resident: resident@example.com / resident123456");
	} catch (error) {
		console.error("❌ Error in setup process:", error);
	} finally {
		process.exit(0);
	}
}

// Run the setup
createUsersAndSeedDatabase();
