const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "malinta-connect",
  private_key_id: "f74ce46e4642c3c41c6ea15d6fcf4212c1ef060d",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ||
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChNbSip+PCRuIY\nygN0nDm6cKTgHpUlXHkJk0OdmsBtPn2t6IX4zmog+RWpo0txQ0h/1ziX5KCx/K31\nLg9VE0pAGdpdDP6L9OQoFyuGMcO05VIUGs4hmHV21ilprtARrotKssCDX+4fPgc+\nGEmWI0owLsJdgUrVmRI95oLY5R0Doe0DBn4dea7PabHRxlGkdt5f+C7hpCEHojyv\nSx1x5+/3zCJGxLlzgx6MraE7gLCP3B5xfg+3OKpXY5J0DZt/HrTowpEQz0rgWsez\nQ8JF/vD93kgqX6T6JhvMAUVys08RW7lMHbKPwis4He7lPtbOrtEzmdcOzb8ghrUK\nPMk81khBAgMBAAECggEAC9TvPwjndHjTW1JoUoSsz/w4faKA+87/qy49xjF3cg0m\nGD96pbowm97sMhkkDloL1iYrpypGiQmsktQgl/PkfTPojO/JNuhwXmjk7uJ0JLC4\nB3W4L0sLQ/+P5ovIBaQz4PWhn4LI7U4WJf6OWBCa/1JPPaGhpm+noRdr/xNBv+Ri\npUJjv7Wh1M+ZooVZ7RPbYzKxJ6YVdG3uj582PJQ+CPcba40DbHsOqi3wR7+gAyjY\nYuaZpUIKIj1UHxL3TfFaS+8Dxh9YG/WMUJiuwNPJAJuopj72Duz8fo2e2ttU+1ok\nhd8CYAkShGAm3GN8Lryr+1vuoaRR13R6P2YhEy98SQKBgQDaPc29bKbEdl/orKi2\nbj7DZWR3huh/EviGRLdj3KMVTV4KkGQd01GxtGVFiDe6JpqI43bnVYV+g9Toc2mg\ni17zqaMGeWOoMGFGj4uDVCCXK5c8eqfBODaBXOQMtwjc5WeXqQ1l/E5w5g1M5zJX\nqJV18j0L5xTi6u+BHsUrppegUwKBgQC9GeWQyQUTTjYLBybzHMpV/+Ugt3yqOymA\nC/WpaiIe1Sj9R3BPVOkxzv1lgonM2xtJx4/pDfHLDZku0wY1cs8tOD2uS+Q5qdGt\n8fT0Px5wlGXZBhDchnvtss6XH9INVPtFFRdPtrb4ugaq561N9Z8DVIbyPjzhHifg\nlHtQ4GgymwKBgBYbsq7gxdgbIcYhT4oDiwoiSFYvbXgKBPEdHvLX1BGBX+h0DiBT\nWvBElQnBLdwGsxrw6AexSy+wzS2rG2UvGTRX1/L88xKDrCcIvZpVOGP3/38Z8cqK\nFkNulI+RLy2pc6ASeQ/+yjd3pptGxHvK0TE8k+CTzTLbl92dr12np66PAoGBALcs\nrbYZMuRnf2whSnZ2rfyuO0n80zKmymVxsE6iM1kAjIsDt2PxUU5hPg4la8xXddB7\nEgjj7BMQIhE8cqg1hUA9WWpLs1C0EhtX5DrwJVFSPnICMTUcxFEVQo8bUMJ/TkK1\n0nXx/L1knW7Rqot44MY+C9X9ucUrC9+8lNNb/TL/AoGBAMbKkVgQypf3q5xb2x3C\nGlHXA3ia7reUM5nQVmz6j9EG1YFzcfJeUTHHl16RDuHeZ7Fo6fUjVmXjAYMD5Ygo\n7VB7/0Kaasv6rK7Ewb0tq5nUVwHtEfqi9QTlGJ2tftVlmcGFYEemWawizy3kRvFq\nSP6ifosst4iVc3BFVOXllFN/\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@malinta-connect.iam.gserviceaccount.com",
  client_id: "117594762334329442156",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40malinta-connect.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Initialize Firebase Admin if not already initialized
if (!require("firebase-admin/app").getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
  });
}

const database = getDatabase();

const sampleAppointments = [
  {
    id: "APT-2025-0426-001",
    title: "Barangay Captain Consultation",
    description: "Discuss community project proposal for street lighting improvement",
    date: "2025-04-26",
    time: "10:00",
    requestedBy: "Juan Dela Cruz",
    contactNumber: "09123456789",
    email: "juan.delacruz@email.com",
    status: "confirmed",
    notes: "Resident wants to discuss street lighting project for their area",
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "APT-2025-0503-002",
    title: "Dispute Resolution",
    description: "Property boundary dispute with neighbor regarding fence placement",
    date: "2025-05-03",
    time: "14:00",
    requestedBy: "Maria Santos",
    contactNumber: "09234567890",
    email: "maria.santos@email.com",
    status: "pending",
    notes: "Needs mediation for property boundary issue",
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172800000, // 2 days ago
  },
  {
    id: "APT-2025-0415-003",
    title: "Social Welfare Assistance",
    description: "Inquire about educational assistance program for children",
    date: "2025-04-15",
    time: "09:00",
    requestedBy: "Pedro Reyes",
    contactNumber: "09345678901",
    email: "pedro.reyes@email.com",
    status: "cancelled",
    notes: "Resident cancelled due to emergency",
    createdAt: Date.now() - 259200000, // 3 days ago
    updatedAt: Date.now() - 86400000, // 1 day ago
  },
  {
    id: "APT-2025-0501-004",
    title: "Business Permit Assistance",
    description: "Help with business permit renewal and requirements",
    date: "2025-05-01",
    time: "11:00",
    requestedBy: "Ana Garcia",
    contactNumber: "09456789012",
    email: "ana.garcia@email.com",
    status: "confirmed",
    notes: "Small business owner needs assistance with permit renewal",
    createdAt: Date.now() - 43200000, // 12 hours ago
    updatedAt: Date.now() - 1800000, // 30 minutes ago
  },
  {
    id: "APT-2025-0505-005",
    title: "Other Services",
    description: "Request for community clean-up drive coordination",
    date: "2025-05-05",
    time: "15:00",
    requestedBy: "Roberto Martinez",
    contactNumber: "09567890123",
    email: "roberto.martinez@email.com",
    status: "pending",
    notes: "Community leader wants to organize clean-up drive",
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 7200000, // 2 hours ago
  },
];

async function seedAppointments() {
  try {
    console.log("🌱 Seeding appointments data...");
    
    const appointmentsRef = database.ref("appointments");
    
    for (const appointment of sampleAppointments) {
      await appointmentsRef.child(appointment.id).set(appointment);
      console.log(`✅ Created appointment: ${appointment.id}`);
    }
    
    console.log("🎉 Appointments seeding completed successfully!");
    console.log(`📊 Total appointments created: ${sampleAppointments.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding appointments:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedAppointments().then(() => {
  console.log("🏁 Seeding process completed");
  process.exit(0);
});
