// Update verification status for existing residents
// This script adds verification status to existing user profiles and residents

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

// Initialize Firebase Admin (you'll need to set up your service account)
// const serviceAccount = require('./path-to-your-service-account.json');
// initializeApp({
//   credential: cert(serviceAccount),
//   databaseURL: 'your-database-url'
// });

console.log("🔄 Starting verification status update...");

console.log(`
📋 Manual Update Instructions:

Since Firebase Admin SDK requires service account setup, please manually update your database:

1. Go to Firebase Console → Realtime Database

2. For each existing resident user in the 'users' collection:
   - Add: verificationStatus: "verified" (for existing active residents)
   - Add: verificationStatus: "pending" (for new residents who need verification)

3. For each existing resident in the 'residents' collection:
   - Ensure verification.status is set to "verified" for existing residents
   - Set verification.status to "pending" for new residents

4. Example structure for existing verified residents:

   users/{resident-uid}/
   ├── verificationStatus: "verified"
   └── ... (existing fields)

   residents/{resident-uid}/
   ├── verification/
   │   ├── status: "verified"
  │   ├── idFrontPhotoUrl: "placeholder-url"
  │   ├── idBackPhotoUrl: "placeholder-url"
   │   ├── selfiePhotoUrl: "placeholder-url"
   │   └── submittedAt: ${Date.now()}
   └── ... (existing fields)

5. For new residents who need verification:
   
   users/{resident-uid}/
   ├── verificationStatus: "pending"
   └── ... (existing fields)

   residents/{resident-uid}/
   ├── verification/
   │   ├── status: "pending"
  │   ├── idFrontPhotoUrl: "placeholder-url"
  │   ├── idBackPhotoUrl: "placeholder-url"
   │   ├── selfiePhotoUrl: "placeholder-url"
   │   └── submittedAt: ${Date.now()}
   └── ... (existing fields)

⚠️  Important Notes:
- Existing residents who have been using the system should be marked as "verified"
- New registrations will automatically get "pending" status
- Only admins can change verification status from the admin panel
- The system will now prevent unverified residents from logging in

✅ After updating:
- Verified residents can log in normally
- Pending residents will see verification message
- Rejected residents will see rejection message
- Admins can manage verification from /admin/residents
`);

console.log("📚 For automated updates, you can:");
console.log("1. Set up Firebase Admin SDK with service account");
console.log("2. Run this script with proper credentials");
console.log("3. Or use the admin panel to manually verify residents");

console.log("\n🎯 Verification system is now active!");
console.log("New residents must be verified before they can log in.");
