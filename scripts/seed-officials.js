const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/"
  });
}

const database = getDatabase();

// Sample officials data
const sampleOfficials = [
  {
    id: "official_1704067200000",
    name: "Juan Dela Cruz",
    position: "captain",
    term: "2022-2025",
    email: "captain@malinta.losbanos.gov.ph",
    phone: "(049) 536-XXXX",
    officeHours: "Monday-Friday, 9:00 AM - 5:00 PM",
    committees: [
      "Peace and Order",
      "Infrastructure Development",
      "Budget and Finance",
      "Executive Committee"
    ],
    biography: "It is with great honor and privilege that I serve as your Barangay Captain. Our administration is committed to creating a safe, progressive, and inclusive community for all residents. We believe in transparent governance and active community participation.",
    message: "Together, we can build a better barangay for ourselves and for future generations. I encourage everyone to take part in our community programs and initiatives. My office is always open to hear your concerns and suggestions.",
    projects: [
      "Road Improvement Project",
      "Community Health Program",
      "Youth Development Initiative"
    ],
    achievements: [
      "Best Barangay Award 2024",
      "100% Vaccination Rate",
      "Zero Crime Rate for 6 Months"
    ],
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop",
    status: "active",
    createdAt: 1704067200000,
    updatedAt: 1704067200000
  },
  {
    id: "official_1704153600000",
    name: "Maria Santos",
    position: "councilor",
    term: "2022-2025",
    email: "maria@malinta.losbanos.gov.ph",
    phone: "(049) 536-XXXX",
    officeHours: "Monday-Wednesday, 9:00 AM - 3:00 PM",
    committees: ["Health and Sanitation"],
    biography: "Maria Santos has been serving as a Barangay Councilor since 2019. She is a registered nurse and has been leading initiatives for community health programs and sanitation improvements throughout the barangay.",
    message: "",
    projects: ["Community Vaccination Drive", "Sanitation Awareness Campaign"],
    achievements: ["Health Worker of the Year 2023"],
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1287&auto=format&fit=crop",
    status: "active",
    createdAt: 1704153600000,
    updatedAt: 1704153600000
  },
  {
    id: "official_1704240000000",
    name: "Pedro Reyes",
    position: "councilor",
    term: "2022-2025",
    email: "pedro@malinta.losbanos.gov.ph",
    phone: "(049) 536-XXXX",
    officeHours: "Tuesday-Thursday, 1:00 PM - 5:00 PM",
    committees: ["Education"],
    biography: "Pedro Reyes is a former school principal who now serves as a Barangay Councilor. He is passionate about education and has been spearheading educational programs and scholarship opportunities for barangay youth.",
    message: "",
    projects: ["Scholarship Program", "Community Library"],
    achievements: ["Educator of the Year 2022"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1170&auto=format&fit=crop",
    status: "active",
    createdAt: 1704240000000,
    updatedAt: 1704240000000
  }
];

async function seedOfficials() {
  try {
    console.log('🌱 Starting to seed officials...');
    
    const officialsRef = database.ref('officials');
    
    // Clear existing data
    await officialsRef.remove();
    console.log('🗑️  Cleared existing officials data');
    
    // Add sample officials
    for (const official of sampleOfficials) {
      await officialsRef.child(official.id).set(official);
      console.log(`✅ Added official: ${official.name} (${official.position})`);
    }
    
    console.log('🎉 Successfully seeded officials database!');
    console.log(`📊 Total officials added: ${sampleOfficials.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding officials:', error);
    process.exit(1);
  }
}

// Run the seed function
seedOfficials().then(() => {
  console.log('🏁 Seeding completed');
  process.exit(0);
});
