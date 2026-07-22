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
import { startAuthAction } from "@/lib/auth-actions";

const loginSchema = z.object({
  email: z.string().email({
    message: "Adresse e-mail invalide.",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    } catch {
      setErrorMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
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
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full text-sm font-semibold"
            size="lg"
            disabled={loading}
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

    </div>
  );
};
