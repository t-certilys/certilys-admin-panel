"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockKeyIcon,
  Shield01Icon,
  SmartPhone01Icon,
  Logout01Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Security & Privacy
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage your credentials, two-factor authentication, and monitor your
          active sessions.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Password Section */}
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={LockKeyIcon} size={20} strokeWidth={1.5} />
              Password
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ensure your account is using a strong password. It is recommended
              to change it every 6 months.
            </p>
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Update Password
              </CardTitle>
              <CardDescription>
                Enter your current password and choose a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <PasswordInput id="current-password" placeholder="••••••••" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput id="new-password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <PasswordInput id="confirm-password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-start">
                <Button variant="outline" size="sm">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        {/* 2FA Section */}
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={1.5} />
              Two-Factor Authentication
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add an extra layer of security to your account by requiring more
              than just a password to log in.
            </p>
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <HugeiconsIcon
                      icon={Shield01Icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      Enable 2FA via Authenticator App
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use apps like Google Authenticator or 1Password to
                      generate codes.
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        {/* Sessions Section */}
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={SmartPhone01Icon}
                size={20}
                strokeWidth={1.5}
              />
              Active Sessions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              This is a list of devices that have logged into your account.
              Revoke any sessions that you do not recognize.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              {
                device: "MacBook Pro",
                browser: "Chrome",
                location: "Cotonou, Benin",
                current: true,
                icon: ComputerIcon,
              },
              {
                device: "iPhone 15 Pro",
                browser: "Safari",
                location: "Cotonou, Benin",
                current: false,
                icon: SmartPhone01Icon,
              },
            ].map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card transition-all hover:border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                    <HugeiconsIcon
                      icon={session.icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="grid gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {session.device} • {session.browser}
                      </span>
                      {session.current && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 py-0 bg-primary/5 text-primary border-primary/20"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {session.location}
                    </span>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <HugeiconsIcon
                      icon={Logout01Icon}
                      size={18}
                      strokeWidth={1.5}
                    />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
