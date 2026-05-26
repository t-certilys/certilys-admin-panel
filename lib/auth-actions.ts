"use server";

export type ActionResponse = {
  success: boolean;
  message: string;
};

/**
 * Simulates OTP verification logic.
 */
export async function verifyOtpAction(otp: string): Promise<ActionResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (otp === "123456") {
    return {
      success: true,
      message: "Verification successful. Redirecting...",
    };
  }

  return {
    success: false,
    message: "Invalid code. Please try again.",
  };
}

/**
 * Simulates resending OTP code.
 */
export async function resendOtpAction(email: string): Promise<ActionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return {
    success: true,
    message: "A new code has been sent to your email.",
  };
}
