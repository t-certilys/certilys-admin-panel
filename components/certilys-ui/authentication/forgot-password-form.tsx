"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail01Icon, Sent02Icon } from "@hugeicons/core-free-icons";
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
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";

const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Adresse e-mail invalide.",
  }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const [isSent, setIsSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: ForgotPasswordValues) {
    // Handle forgot password submission
    console.log(values);
    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={Sent02Icon} size={24} strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 font-semibold text-lg">Vérifiez vos emails</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Nous avons envoyé un lien de réinitialisation à <span className="font-medium text-foreground">{form.getValues("email")}</span>.
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => setIsSent(false)}
        >
          Renvoyer l'email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <EmailInput
                    placeholder="Entrez votre email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button className="mt-6 w-full" size="lg">
          <HugeiconsIcon icon={Mail01Icon} className="mr-2" size={20} strokeWidth={1.5} />
          Envoyer le lien de réinitialisation
        </Button>
      </form>
    </Form>
  );
};
