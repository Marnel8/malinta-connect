const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');

// Firebase config (same as in your app)
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

// Sample announcements data
const sampleAnnouncements = [
	{
		title: "Water Service Interruption Notice",
		description: "Please be informed that there will be a scheduled water service interruption on May 2, 2025, from 10:00 PM to 5:00 AM the following day. This is due to maintenance work on the main water lines. We advise all residents to store enough water for their needs during this period.",
		category: "Important",
		status: "published",
		visibility: "public",
		author: "Barangay Water Department",
		publishedOn: "2025-04-25",
		expiresOn: "2025-05-10",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		title: "New Garbage Collection Schedule",
		description: "Starting May 1, 2025, we will implement a new garbage collection schedule. Biodegradable waste will be collected on Mondays and Thursdays, while non-biodegradable waste will be collected on Tuesdays and Fridays. Please ensure proper segregation of your waste.",
		category: "Notice",
		status: "published",
		visibility: "public",
		author: "Barangay Sanitation Office",
		publishedOn: "2025-04-20",
		expiresOn: "2025-06-30",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		title: "Barangay ID Renewal Period",
		description: "The annual Barangay ID renewal period will be from May 1 to June 30, 2025. Residents can visit the Barangay Hall from Monday to Friday, 8:00 AM to 5:00 PM, to renew their IDs. Please bring your old Barangay ID and proof of residency.",
		category: "Notice",
		status: "published",
		visibility: "public",
		author: "Barangay Secretary",
		publishedOn: "2025-04-15",
		expiresOn: "2025-07-31",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		title: "Community Health Fair",
		description: "Join us for our annual Community Health Fair on May 15, 2025, from 8:00 AM to 4:00 PM at the Barangay Hall. Free health check-ups, vaccinations, and health education sessions will be available for all residents.",
		category: "Event",
		status: "published",
		visibility: "public",
		author: "Barangay Health Center",
		publishedOn: "2025-04-10",
		expiresOn: "2025-05-20",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		title: "Emergency Contact Numbers",
		description: "Important emergency contact numbers for Barangay Malinta: Police Station: 123-4567, Fire Station: 123-4568, Ambulance: 123-4569, Barangay Hall: 123-4570. Save these numbers for emergency situations.",
		category: "Emergency",
		status: "published",
		visibility: "public",
		author: "Barangay Chairman",
		publishedOn: "2025-04-05",
		expiresOn: "2025-12-31",
		createdAt: Date.now(),
		updatedAt: Date.now()
	},
	{
		title: "Street Light Maintenance",
		description: "Street light maintenance will be conducted on April 30, 2025, from 9:00 PM to 11:00 PM. Some areas may experience temporary darkness during this period. We apologize for any inconvenience.",
		category: "Notice",
		status: "published",
		visibility: "public",
		author: "Barangay Engineering Office",
		publishedOn: "2025-04-28",
		expiresOn: "2025-05-05",
		createdAt: Date.now(),
		updatedAt: Date.now()
	}
];

async function seedAnnouncements() {
	try {
		console.log('🌱 Starting to seed announcements...');
		
		const announcementsRef = ref(database, 'announcements');
		
		for (const announcement of sampleAnnouncements) {
			const newAnnouncementRef = push(announcementsRef);
			await set(newAnnouncementRef, announcement);
			console.log(`✅ Created announcement: ${announcement.title}`);
		}
		
		console.log('🎉 Successfully seeded all announcements!');
		console.log(`📊 Total announcements created: ${sampleAnnouncements.length}`);
		
	} catch (error) {
		console.error('❌ Error seeding announcements:', error);
	} finally {
		process.exit(0);
	}
}

// Run the seeding
seedAnnouncements();
