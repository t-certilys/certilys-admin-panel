import { Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { VerifyOTPForm } from "@/components/certilys-ui/authentication/verify-otp-form";

const VerifyOTP = () => (
  <div className="flex min-h-screen items-center justify-center py-12">
    <div className="mx-auto w-full border border-border/70 pb-0 max-sm:border-t-0 sm:max-w-md sm:rounded-xl sm:bg-card sm:p-1 sm:shadow-lg/3">
      <div className="border border-border/70 bg-muted/60 px-10 py-14 max-sm:border-x-0 sm:rounded-lg sm:shadow-sm/2">
        <HugeiconsIcon
          icon={Shield01Icon}
          className="mx-auto size-8 text-primary"
          strokeWidth={1.5}
        />
        <h1 className="mt-3 text-center font-semibold text-2xl tracking-tight">
          Verify your identity
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          We&apos;ve sent a 6-digit code to your email.
        </p>

        <div className="mt-10">
          <VerifyOTPForm />
        </div>
      </div>

      <div className="relative py-5">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
        linear-gradient(45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%),
        linear-gradient(-45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%)
      `,
            backgroundSize: "40px 40px",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
          }}
        />

        <p className="relative isolate text-center text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
          Secure Verification
        </p>
      </div>
    </div>
  </div>
);

export default VerifyOTP;
