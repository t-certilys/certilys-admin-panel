"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import QRCode from "qrcode";
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
import { get2FASetupDetailsAction, confirm2FASetupAction } from "@/lib/auth-actions";
import { toast } from "sonner";

const setupSchema = z.object({
  code: z.string().length(6, {
    message: "Le code d'activation doit comporter exactement 6 chiffres.",
  }),
});

export default function TwoFactorSetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeSvg, setQrCodeSvg] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    fetchSetupDetails();
  }, []);

  useEffect(() => {
    let active = true;

    async function generateQrCode() {
      if (!qrCodeUrl) return;
      try {
        const svg = await QRCode.toString(qrCodeUrl, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 1,
          width: 176,
          color: {
            dark: "#020617",
            light: "#ffffff",
          },
        });
        if (active) setQrCodeSvg(svg);
      } catch {
        if (active) {
          setErrorMessage(
            "Impossible de générer le QR Code. Copiez la clé secrète manuellement.",
          );
        }
      }
    }

    void generateQrCode();

    return () => {
      active = false;
    };
  }, [qrCodeUrl]);

  async function fetchSetupDetails() {
    try {
      const response = await get2FASetupDetailsAction();
      if (response.success) {
        setQrCodeUrl(response.qrCodeUrl);
        setSecretKey(response.secretKey);
        setBackupCodes(response.backupCodes);
      } else {
        setErrorMessage(
          response.message ||
            "Impossible de charger la configuration de double authentification.",
        );
      }
    } catch {
      setErrorMessage("Échec du chargement des détails de configuration 2FA.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function onSubmit(values: { code: string }) {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await confirm2FASetupAction(values.code);
      if (response.success) {
        toast.success("Double Facteur (2FA) configuré avec succès !");
        setBackupCodes(response.backupCodes ?? []);
        setRedirectTo(response.redirectTo || "/dashboard");
        setIsActivated(true);
      } else {
        setErrorMessage(response.message || "Code incorrect.");
        form.reset();
      }
    } catch {
      setErrorMessage("Une erreur est survenue lors de l'activation.");
    } finally {
      setIsLoading(false);
    }
  }

  if (loadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground text-sm">Chargement des paramètres de sécurité...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="mx-auto w-full border border-border/70 pb-0 max-sm:border-t-0 sm:max-w-2xl sm:rounded-xl sm:bg-card sm:p-1 sm:shadow-lg/3">
        <div className="border border-border/70 bg-muted/60 px-8 py-10 max-sm:border-x-0 sm:rounded-lg sm:shadow-sm/2">
          <CtyIcon className="mx-auto mb-3 text-primary h-12 w-12" />
          
          <h1 className="mt-3 text-center font-semibold text-2xl">
            Activer le Double Facteur (2FA)
          </h1>
          <p className="text-center text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            La double authentification est obligatoire pour tous les administrateurs Certilys afin de protéger les données sensibles.
          </p>

          {errorMessage && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 font-medium my-6">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 items-start">
            
            {/* Étape 1 : QR Code et Clé */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="border border-border p-3 rounded-xl bg-white shadow-sm flex items-center justify-center">
                {qrCodeSvg ? (
                  <div
                    aria-label="QR Code 2FA"
                    className="h-44 w-44 [&_svg]:h-full [&_svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-lg bg-muted text-center text-xs text-muted-foreground">
                    Génération du QR Code...
                  </div>
                )}
              </div>
              <div className="text-center w-full">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                  Clé Secrète de Configuration
                </span>
                <code className="text-xs bg-muted border border-border px-3 py-1.5 rounded-lg block font-mono text-foreground font-semibold mt-1 select-all select-none">
                  {secretKey}
                </code>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scannez ce QR Code avec une application d&apos;authentification (Google Authenticator, Microsoft Authenticator, Bitwarden, etc.) ou copiez la clé manuellement.
              </p>
            </div>

            {/* Étape 2 : Codes de secours & Validation */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block mb-2">
                  1. Codes de secours
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs bg-muted border border-border p-3 rounded-lg font-mono text-center">
                  {backupCodes.length > 0 ? (
                    backupCodes.map((code) => (
                      <div key={code} className="border border-border/60 bg-background/50 rounded p-1 select-all">
                        {code}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 rounded border border-border/60 bg-background/50 p-2 text-muted-foreground">
                      Ils apparaîtront ici après validation du code.
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  ⚠️ Stockez ces codes dans un endroit sûr. Ils vous permettront d&apos;accéder à votre compte si vous perdez votre appareil.
                </p>
              </div>

              <div className="border-t border-border/80 pt-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center md:items-start space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                            2. Validez le code d&apos;activation
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
                              containerClassName="gap-2"
                            >
                              <InputOTPGroup className="space-x-0.5">
                                <InputOTPSlot className="rounded-md border border-border size-9" index={0} />
                                <InputOTPSlot className="rounded-md border border-border size-9" index={1} />
                                <InputOTPSlot className="rounded-md border border-border size-9" index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup className="space-x-0.5">
                                <InputOTPSlot className="rounded-md border border-border size-9" index={3} />
                                <InputOTPSlot className="rounded-md border border-border size-9" index={4} />
                                <InputOTPSlot className="rounded-md border border-border size-9" index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isActivated ? (
                      <Button
                        type="button"
                        className="w-full text-xs font-semibold"
                        onClick={() => router.push(redirectTo)}
                      >
                        Continuer vers le dashboard
                      </Button>
                    ) : (
                      <Button className="w-full text-xs font-semibold" disabled={isLoading || form.watch("code").length !== 6}>
                        {isLoading ? "Activation..." : "Activer la double authentification"}
                      </Button>
                    )}
                  </form>
                </Form>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
