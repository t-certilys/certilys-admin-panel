"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
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
import { EmailInput } from "@/components/ui/email-input";
import { startAuthAction, googleCallbackAction } from "@/lib/auth-actions";
import { GoogleIcon } from "@/components/icons/google";

const loginSchema = z.object({
  email: z.string().email({
    message: "Adresse e-mail invalide.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await startAuthAction(values.email);

      if (response.success) {
        router.push(
          `/auth/verify-otp?challengeId=${response.challengeId}&masked=${encodeURIComponent(
            response.emailMasked || "",
          )}`,
        );
      } else {
        setErrorMessage(response.message);
      }
    } catch (err) {
      setErrorMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(simulationToken: string) {
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      const response = await googleCallbackAction(simulationToken);

      if (response.success) {
        if (response.status === "REQUIRES_2FA_SETUP") {
          router.push("/auth/2fa/setup");
        } else if (response.status === "REQUIRES_2FA") {
          router.push(`/auth/2fa?challengeId=${response.challengeId}`);
        } else {
          const target = response.redirectTo || "/dashboard";
          if (target.startsWith("http")) {
            window.location.assign(target);
          } else {
            router.push(target);
          }
        }
      } else {
        setErrorMessage(response.message);
      }
    } catch (err) {
      setErrorMessage("Échec de la connexion avec Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse E-mail</FormLabel>
                <FormControl>
                  <EmailInput
                    placeholder="Entrez votre email admin"
                    {...field}
                    disabled={loading || googleLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full text-sm font-semibold"
            size="lg"
            disabled={loading || googleLoading}
            type="submit"
          >
            <HugeiconsIcon
              icon={Mail01Icon}
              className="mr-2"
              size={18}
              strokeWidth={1.5}
            />
            {loading ? "Envoi du code..." : "Continuer avec l'email"}
          </Button>
        </form>
      </Form>

      <div className="relative flex items-center py-2 text-xs text-muted-foreground">
        <div className="flex-grow border-t border-border/80" />
        <span className="mx-4 flex-shrink uppercase text-muted-foreground">
          ou
        </span>
        <div className="flex-grow border-t border-border/80" />
      </div>

      <Button
        variant="outline"
        className="w-full border-border bg-background text-sm font-semibold text-foreground hover:bg-muted hover:text-foreground"
        size="lg"
        onClick={() => handleGoogleLogin("google_active")}
        disabled={loading || googleLoading}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        {googleLoading ? "Connexion Google..." : "Continuer avec Google"}
      </Button>
    </div>
  );
};
