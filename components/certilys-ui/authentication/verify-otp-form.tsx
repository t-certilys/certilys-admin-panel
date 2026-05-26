"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tick01Icon, ArrowRight01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifyOtpAction, resendOtpAction } from "@/lib/auth-actions";
import { useState, useRef } from "react";

const otpSchema = z.object({
  otp: z.string().length(6, {
    message: "OTP must be exactly 6 digits.",
  }),
});

type OTPFormValues = z.infer<typeof otpSchema>;

export const VerifyOTPForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: OTPFormValues) {
    setIsLoading(true);
    try {
      const response = await verifyOtpAction(values.otp);
      if (response.success) {
        toast.success(response.message);
        router.push("/dashboard");
      } else {
        toast.error(response.message);
        form.reset();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle resend
  const handleResend = async () => {
    toast.promise(resendOtpAction("user@example.com"), {
      loading: "Resending code...",
      success: (data) => data.message,
      error: "Failed to resend code.",
    });
  };

  return (
    <Form {...form}>
      <form 
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormLabel className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Verification Code
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    disabled={isLoading}
                    {...field}
                    onChange={(value) => {
                      field.onChange(value);
                      // Auto-submit when 6 digits are reached
                      if (value.length === 6) {
                        form.handleSubmit(onSubmit)();
                      }
                    }}
                    containerClassName="gap-3"
                  >
                    <InputOTPGroup className="space-x-1">
                      <InputOTPSlot className="rounded-md border-l size-10" index={0} />
                      <InputOTPSlot className="rounded-md border-l size-10" index={1} />
                      <InputOTPSlot className="rounded-md border-l size-10" index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup className="space-x-1">
                      <InputOTPSlot className="rounded-md border-l size-10" index={3} />
                      <InputOTPSlot className="rounded-md border-l size-10" index={4} />
                      <InputOTPSlot className="rounded-md border-l size-10" index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            disabled={isLoading || form.watch("otp").length !== 6}
            className="w-full" 
            size="lg"
          >
            {isLoading ? (
               "Verifying..."
            ) : (
              <>
                Confirm Code
                <HugeiconsIcon icon={Tick01Icon} className="ml-2" size={18} />
              </>
            )}
          </Button>
          
          <button
            type="button"
            onClick={handleResend}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium "
          >
            Didn&apos;t receive the code? <span className="text-primary underline underline-offset-4">Resend</span>
          </button>
        </div>
      </form>
    </Form>
  );
};
