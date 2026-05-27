"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tick01Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { verifyOtpAction, startAuthAction } from "@/lib/auth-actions";
import { useState, useRef } from "react";

const otpSchema = z.object({
  otp: z.string().length(6, {
    message: "Le code OTP doit comporter exactement 6 chiffres.",
  }),
});

type OTPFormValues = z.infer<typeof otpSchema>;

export const VerifyOTPForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId") || "";
  const maskedEmail = searchParams.get("masked") || "votre email";

  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: OTPFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await verifyOtpAction(challengeId, values.otp);
      if (response.success) {
        toast.success(response.message || "Vérification réussie !");
        
        if (response.status === "REQUIRES_2FA_SETUP") {
          router.push("/auth/2fa/setup");
        } else if (response.status === "REQUIRES_2FA") {
          router.push(`/auth/2fa?challengeId=${response.challengeId}`);
        } else {
          router.push(response.redirectTo || "/dashboard");
        }
      } else {
        setErrorMessage(response.message || "Code incorrect.");
        form.reset();
      }
    } catch (error) {
      setErrorMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleResend = async () => {
    setResending(true);
    setErrorMessage(null);
    try {
      // Pour simuler le renvoi, on utilise l'email en attente (stocké dans les cookies du serveur)
      // On rappelle l'action de démarrage.
      const response = await startAuthAction("active@certilys.fr");
      if (response.success) {
        toast.success("Un nouveau code a été envoyé sur votre email.");
      } else {
        setErrorMessage(response.message);
      }
    } catch (err) {
      toast.error("Échec de renvoi du code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground mb-4">
        Un code de vérification à 6 chiffres a été envoyé à :<br/>
        <strong className="text-foreground">{decodeURIComponent(maskedEmail)}</strong>
      </div>

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
                    Saisir le Code de Sécurité
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      disabled={isLoading}
                      {...field}
                      onChange={(value) => {
                        field.onChange(value);
                        if (value.length === 6) {
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                      containerClassName="gap-3"
                    >
                      <InputOTPGroup className="space-x-1">
                        <InputOTPSlot className="rounded-md border border-border size-10" index={0} />
                        <InputOTPSlot className="rounded-md border border-border size-10" index={1} />
                        <InputOTPSlot className="rounded-md border border-border size-10" index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup className="space-x-1">
                        <InputOTPSlot className="rounded-md border border-border size-10" index={3} />
                        <InputOTPSlot className="rounded-md border border-border size-10" index={4} />
                        <InputOTPSlot className="rounded-md border border-border size-10" index={5} />
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
              className="w-full text-sm font-semibold" 
              size="lg"
            >
              {isLoading ? (
                 "Vérification..."
              ) : (
                <>
                  Confirmer le Code
                  <HugeiconsIcon icon={Tick01Icon} className="ml-2" size={18} />
                </>
              )}
            </Button>
            
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || isLoading}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Vous n'avez pas reçu le code ? <span className="text-primary underline underline-offset-4">{resending ? "Renvoi..." : "Renvoyer un nouveau code"}</span>
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};
