import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

// Check if we're in a server environment
if (typeof window === "undefined") {
	// Server-side only
	const serviceAccount = {
		type: "service_account",
		project_id: "malinta-connect",
		private_key_id: "f74ce46e4642c3c41c6ea15d6fcf4212c1ef060d",
		private_key:
			process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") ||
			"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQChNbSip+PCRuIY\nygN0nDm6cKTgHpUlXHkJk0OdmsBtPn2t6IX4zmog+RWpo0txQ0h/1ziX5KCx/K31\nLg9VE0pAGdpdDP6L9OQoFyuGMcO05VIUGs4hmHV21ilprtARrotKssCDX+4fPgc+\nGEmWI0owLsJdgUrVmRI95oLY5R0Doe0DBn4dea7PabHRxlGkdt5f+C7hpCEHojyv\nSx1x5+/3zCJGxLlzgx6MraE7gLCP3B5xfg+3OKpXY5J0DZt/HrTowpEQz0rgWsez\nQ8JF/vD93kgqX6T6JhvMAUVys08RW7lMHbKPwis4He7lPtbOrtEzmdcOzb8ghrUK\nPMk81khBAgMBAAECggEAC9TvPwjndHjTW1JoUoSsz/w4faKA+87/qy49xjF3cg0m\nGD96pbowm97sMhkkDloL1iYrpypGiQmsktQgl/PkfTPojO/JNuhwXmjk7uJ0JLC4\nB3W4L0sLQ/+P5ovIBaQz4PWhn4LI7U4WJf6OWBCa/1JPPaGhpm+noRdr/xNBv+Ri\npUJjv7Wh1M+ZooVZ7RPbYzKxJ6YVdG3uj582PJQ+CPcba40DbHsOqi3wR7+gAyjY\nYuaZpUIKIj1UHxL3TfFaS+8Dxh9YG/WMUJiuwNPJAJuopj72Duz8fo2e2ttU+1ok\nhd8CYAkShGAm3GN8Lryr+1vuoaRR13R6P2YhEy98SQKBgQDaPc29bKbEdl/orKi2\nbj7DZWR3huh/EviGRLdj3KMVTV4KkGQd01GxtGVFiDe6JpqI43bnVYV+g9Toc2mg\ni17zqaMGeWOoMGFGj4uDVCCXK5c8eqfBODaBXOQMtwjc5WeXqQ1l/E5w5g1M5zJX\nqJV18j0L5xTi6u+BHsUrppegUwKBgQC9GeWQyQUTTjYLBybzHMpV/+Ugt3yqOymA\nC/WpaiIe1Sj9R3BPVOkxzv1lgonM2xtJx4/pDfHLDZku0wY1cs8tOD2uS+Q5qdGt\n8fT0Px5wlGXZBhDchnvtss6XH9INVPtFFRdPtrb4ugaq561N9Z8DVIbyPjzhHifg\nlHtQ4GgymwKBgBYbsq7gxdgbIcYhT4oDiwoiSFYvbXgKBPEdHvLX1BGBX+h0DiBT\nWvBElQnBLdwGsxrw6AexSy+wzS2rG2UvGTRX1/L88xKDrCcIvZpVOGP3/38Z8cqK\nFkNulI+RLy2pc6ASeQ/+yjd3pptGxHvK0TE8k+CTzTLbl92dr12np66PAoGBALcs\nrbYZMuRnf2whSnZ2rfyuO0n80zKmymVxsE6iM1kAjIsDt2PxUU5hPg4la8xXddB7\nEgjj7BMQIhE8cqg1hUA9WWpLs1C0EhtX5DrwJVFSPnICMTUcxFEVQo8bUMJ/TkK1\n0nXx/L1knW7Rqot44MY+C9X9ucUrC9+8lNNb/TL/AoGBAMbKkVgQypf3q5xb2x3C\nGlHXA3ia7reUM5nQVmz6j9EG1YFzcfJeUTHHl16RDuHeZ7Fo6fUjVmXjAYMD5Ygo\n7VB7/0Kaasv6rK7Ewb0tq5nUVwHtEfqi9QTlGJ2tftVlmcGFYEemWawizy3kRvFq\nSP6ifosst4iVc3BFVOXllFN/\n-----END PRIVATE KEY-----\n",
		client_email:
			"firebase-adminsdk-fbsvc@malinta-connect.iam.gserviceaccount.com",
		client_id: "117594762334329442156",
		auth_uri: "https://accounts.google.com/o/oauth2/auth",
		token_uri: "https://oauth2.googleapis.com/token",
		auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
		client_x509_cert_url:
			"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40malinta-connect.iam.gserviceaccount.com",
		universe_domain: "googleapis.com",
	} as any;

	// Initialize Firebase Admin if not already initialized
	if (getApps().length === 0) {
		initializeApp({
			credential: cert(serviceAccount),
			databaseURL: "https://malinta-connect-default-rtdb.firebaseio.com/",
		});
	}
}

// Export admin instances
export const adminAuth = getAuth();
export const adminDatabase = getDatabase();
export const adminApp = getApps()[0];
