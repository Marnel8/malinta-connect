const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, set } = require("firebase/database");

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

// Sample events data
const sampleEvents = [
	{
		name: "Barangay Malinta Clean-up Drive",
		date: "2025-05-15",
		time: "07:00 - 11:00",
		location: "Barangay Malinta Plaza",
		description:
			"Join us for our monthly community clean-up initiative. Help keep our barangay clean and beautiful!",
		category: "community",
		organizer: "Environmental Committee",
		contact: "environment@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: true,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		name: "Free Health Seminar and Check-up",
		date: "2025-05-20",
		time: "09:00 - 15:00",
		location: "Barangay Malinta Health Center",
		description:
			"Learn about preventive healthcare and get a free check-up. Open to all residents.",
		category: "health",
		organizer: "Health Committee",
		contact: "health@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		name: "Barangay Malinta Basketball Tournament",
		date: "2025-06-01",
		time: "15:00 - 20:00",
		location: "Barangay Malinta Basketball Court",
		description:
			"Annual basketball competition for all age groups. Registration is now open!",
		category: "sports",
		organizer: "Sports Committee",
		contact: "sports@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1540479859555-17af45c78602?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		name: "Barangay Fiesta Celebration",
		date: "2025-06-15",
		time: "08:00 - 22:00",
		location: "Barangay Malinta Plaza",
		description:
			"Annual celebration of our barangay's patron saint. Food, games, and cultural performances!",
		category: "culture",
		organizer: "Cultural Committee",
		contact: "culture@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1551972873-b7e8754e8e26?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: true,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		name: "Educational Seminar on Financial Literacy",
		date: "2025-06-25",
		time: "14:00 - 17:00",
		location: "Barangay Malinta Multi-Purpose Hall",
		description:
			"Learn about budgeting, saving, and investing. Free seminar for all residents.",
		category: "education",
		organizer: "Education Committee",
		contact: "education@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
	{
		name: "Barangay Assembly Meeting",
		date: "2025-07-01",
		time: "19:00 - 21:00",
		location: "Barangay Malinta Hall",
		description:
			"Monthly barangay assembly meeting. All residents are encouraged to attend.",
		category: "government",
		organizer: "Barangay Council",
		contact: "council@malinta.losbanos.gov.ph",
		image:
			"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1170&auto=format&fit=crop",
		status: "active",
		featured: false,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	},
];

async function seedEvents() {
	try {
		console.log("Starting to seed events...");

		const eventsRef = ref(database, "events");

		for (const event of sampleEvents) {
			const newEventRef = push(eventsRef);
			await set(newEventRef, event);
			console.log(`Added event: ${event.name}`);
		}

		console.log("Events seeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding events:", error);
		process.exit(1);
	}
}

// Run the seeding
seedEvents();
