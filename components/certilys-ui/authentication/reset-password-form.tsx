"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
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
import { PasswordInput } from "@/components/ui/password-input";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ResetPasswordValues) {
    // Handle password reset submission
    console.log(values);
    setIsSuccess(true);
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
          <HugeiconsIcon icon={LockKeyIcon} size={24} strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 font-semibold text-lg">
          Password reset successful
        </h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Your password has been changed successfully. You will be redirected to
          the login page in a few seconds.
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => router.push("/auth/login")}
        >
          Go to login now
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Enter new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button className="mt-6 w-full" size="lg">
          <HugeiconsIcon
            icon={LockKeyIcon}
            className="mr-2"
            size={20}
            strokeWidth={1.5}
          />
          Reset Password
        </Button>
      </form>
    </Form>
  );
};
