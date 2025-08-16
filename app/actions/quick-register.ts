"use server";

import { createUserAction } from "./auth";

export async function quickRegisterOfficialAction() {
	try {
		const result = await createUserAction(
			"official@gmail.com",
			"official123456",
			"official",
			{
				firstName: "Official",
				lastName: "User",
				phoneNumber: "+63 912 345 6789",
				address: "Barangay Hall, Barangay Malinta, Los Baños, Laguna",
				position: "Barangay Official",
			}
		);

		if (result.success) {
			return {
				success: true,
				message: "Official user created successfully!",
				credentials: {
					email: "official@gmail.com",
					password: "official123456",
				},
			};
		} else {
			return {
				success: false,
				error: result.error || "Failed to create user",
			};
		}
	} catch (error) {
		console.error("Quick register error:", error);
		return {
			success: false,
			error: "An unexpected error occurred during registration",
		};
	}
}
