"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { CtyIcon } from "@/components/icons/cty-i";
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
import { Input } from "@/components/ui/input";
import { verify2FaAction } from "@/lib/auth-actions";
import { toast } from "sonner";

const totpSchema = z.object({
  code: z.string().length(6, {
    message: "Le code de sécurité doit comporter exactement 6 chiffres.",
  }),
});

const backupSchema = z.object({
  code: z.string().min(1, {
    message: "Veuillez saisir votre code de secours.",
  }),
});

export default function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totpForm = useForm({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: "" },
  });

  const backupForm = useForm({
    resolver: zodResolver(backupSchema),
    defaultValues: { code: "" },
  });

  async function handleTotpSubmit(values: { code: string }) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await verify2FaAction(challengeId, values.code, "TOTP");
      if (response.success) {
        toast.success("Authentification double facteur réussie.");
        router.push(response.redirectTo || "/dashboard");
      } else {
        setErrorMessage(response.message || "Code Double Facteur incorrect.");
        totpForm.reset();
      }
    } catch (err) {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBackupSubmit(values: { code: string }) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await verify2FaAction(challengeId, values.code, "BACKUP_CODE");
      if (response.success) {
        toast.success("Code de secours validé. Accès autorisé.");
        router.push(response.redirectTo || "/dashboard");
      } else {
        setErrorMessage(response.message || "Code de secours incorrect ou expiré.");
        backupForm.reset();
      }
    } catch (err) {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto w-full border border-border/70 pb-0 max-sm:border-t-0 sm:max-w-md sm:rounded-xl sm:bg-card sm:p-1 sm:shadow-lg/3">
        <div className="border border-border/70 bg-muted/60 px-10 py-14 max-sm:border-x-0 sm:rounded-lg sm:shadow-sm/2">
          <CtyIcon className="mx-auto mb-3 text-primary h-12 w-12" />
          
          <h1 className="mt-3 text-center font-semibold text-2xl">
            Double Facteur (2FA)
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-2">
            {useBackupCode 
              ? "Saisissez l'un de vos codes de secours à 8 caractères"
              : "Saisissez le code de sécurité temporaire à 6 chiffres généré par votre application d'authentification"}
          </p>

          <div className="mt-8">
            {errorMessage && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 font-medium mb-6">
                {errorMessage}
              </div>
            )}

            {!useBackupCode ? (
              <Form {...totpForm}>
                <form onSubmit={totpForm.handleSubmit(handleTotpSubmit)} className="space-y-6">
                  <FormField
                    control={totpForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center justify-center space-y-4">
                        <FormLabel className="text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Code d'Authentification (TOTP)
                        </FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            disabled={isLoading}
                            {...field}
                            onChange={(value) => {
                              field.onChange(value);
                              if (value.length === 6) {
                                totpForm.handleSubmit(handleTotpSubmit)();
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

                  <Button className="w-full text-sm font-semibold" size="lg" disabled={isLoading || totpForm.watch("code").length !== 6}>
                    {isLoading ? "Vérification..." : "Valider le code"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...backupForm}>
                <form onSubmit={backupForm.handleSubmit(handleBackupSubmit)} className="space-y-6">
                  <FormField
                    control={backupForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code de Secours (ex: 9999-9999)</FormLabel>
                        <FormControl>
                          <Input placeholder="9999-9999" {...field} disabled={isLoading} className="text-center font-mono tracking-wider border-border" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button className="w-full text-sm font-semibold" size="lg" disabled={isLoading}>
                    {isLoading ? "Validation..." : "Valider le code de secours"}
                  </Button>
                </form>
              </Form>
            )}

            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs text-primary underline font-medium mt-6 hover:text-primary-hover transition-colors"
            >
              {useBackupCode ? "Utiliser l'application d'authentification" : "Utiliser un code de secours"}
            </button>
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
          <p className="relative isolate text-center text-destructive font-medium text-xs px-6">
            Accès sécurisé double facteur requis pour les comptes administratifs.
          </p>
        </div>
      </div>
    </div>
  );
}
