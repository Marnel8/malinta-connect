const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get } = require('firebase/database');

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

// Default settings
const defaultSettings = {
  barangay: {
    barangayName: "Barangay Malinta",
    municipality: "Valenzuela City",
    address: "123 Main Street, Valenzuela City, Metro Manila",
    contact: "+63 (2) 8123 4567",
    email: "malinta@valenzuela.gov.ph"
  },
  officeHours: {
    weekdays: {
      start: "8",
      end: "17"
    },
    weekends: {
      start: "9",
      end: "12"
    }
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    systemNotifications: true
  },
  userRoles: {
    superAdmin: {
      description: "Full access to all features and settings",
      permissions: ["all"]
    },
    staff: {
      description: "Limited access to resident services",
      permissions: ["residents", "certificates", "events"]
    },
    resident: {
      description: "Access to resident portal only",
      permissions: ["profile", "requests", "certificates"]
    }
  }
};

async function initializeSettings() {
  try {
    console.log('Checking if settings already exist...');
    
    // Check if settings already exist
    const settingsRef = ref(database, 'settings');
    const snapshot = await get(settingsRef);
    
    if (snapshot.exists()) {
      console.log('Settings already exist, skipping initialization.');
      return;
    }
    
    console.log('Initializing default settings...');
    
    // Set default settings
    await set(settingsRef, defaultSettings);
    
    console.log('✅ Default settings initialized successfully!');
    console.log('Settings structure:');
    console.log(JSON.stringify(defaultSettings, null, 2));
    
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
  }
}

// Run the initialization
initializeSettings()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
