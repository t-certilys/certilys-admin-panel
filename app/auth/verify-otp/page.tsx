import VerifyOTP from "@/components/certilys-ui/authentication/verify-otp";

export const metadata = {
  title: "Verify OTP | Murgo",
  description: "Enter the 6-digit code sent to your email to verify your identity.",
};

export default function VerifyOTPPage() {
  return <VerifyOTP />;
}
