"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  Tick02Icon,
  UserRemoveIcon,
  Configuration01Icon,
  Download01Icon,
  Calendar02Icon,
  RocketIcon,
  GlobeIcon,
  TranslateIcon,
  Clock01Icon,
  Settings01Icon,
  GlobalIcon,
  Search01Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AccountPage() {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Manage your account preferences, application-wide configurations, and
          data status.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Account Essentials Section */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={Configuration01Icon}
                  size={20}
                  strokeWidth={1.5}
                />
                Account Essentials
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Core identity and administrative information.
              </p>
            </div>
            <div className="flex items-center gap-2 p-2 px-3 bg-muted/50 rounded-lg border border-border/50">
              <HugeiconsIcon
                icon={Calendar02Icon}
                size={16}
                strokeWidth={1.5}
                className="text-muted-foreground"
              />
              <span className="text-xs font-medium">Joined June 2024</span>
            </div>
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardContent className="pt-6 grid gap-4">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card transition-all hover:border-primary/20">
                <div className="grid gap-0.5">
                  <span className="text-sm font-medium">Account ID</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    USR_8274_9102
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20"
                >
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        {/* App Information Section (From Global) */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={RocketIcon} size={20} strokeWidth={1.5} />
              Application Info
            </h2>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <Card className="border border-border/50 bg-muted/20">
            <CardContent className="pt-6 grid gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input
                    id="app-name"
                    defaultValue="Murgo Dash"
                    placeholder="e.g. My Dashboard"
                    className="bg-card"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="app-url">Site URL</Label>
                  <Input
                    id="app-url"
                    defaultValue="https://murgodash.dev"
                    placeholder="e.g. https://example.com"
                    className="bg-card"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seo-description">SEO Description</Label>
                <Input
                  id="seo-description"
                  defaultValue="The ultimate dashboard for modern businesses."
                  placeholder="Describe your site for search engines"
                  className="bg-card"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Localization & Region (From Global) */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon icon={GlobeIcon} size={20} strokeWidth={1.5} />
              Localization & Region
            </h2>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label
                htmlFor="default-lang"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <HugeiconsIcon icon={TranslateIcon} size={14} />
                Preferred Language
              </Label>
              <Select defaultValue="en">
                <SelectTrigger id="default-lang" className="bg-card">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="fr">French (France)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="timezone"
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                Default Timezone
              </Label>
              <Select defaultValue="utc">
                <SelectTrigger id="timezone" className="bg-card">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC (Universal Time)</SelectItem>
                  <SelectItem value="utc+1">GMT +1 (Porto-Novo)</SelectItem>
                  <SelectItem value="est">EST (Eastern Time)</SelectItem>
                  <SelectItem value="pst">PST (Pacific Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* System Behavior (From Global) */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Settings01Icon}
                size={20}
                strokeWidth={1.5}
              />
              System Behavior
            </h2>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card transition-all hover:bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                  <HugeiconsIcon
                    icon={GlobalIcon}
                    size={20}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Maintenance Mode
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    Disable public access to the dashboard during updates.
                  </p>
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card transition-all hover:bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={20}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Search Indexing
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    Allow search engines to crawl and index your site content.
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Notification Settings (From Global) */}
        <div className="grid gap-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Notification01Icon}
                size={20}
                strokeWidth={1.5}
              />
              Notification Settings
            </h2>
            <Separator className="flex-1 bg-border/50" />
          </div>

          <div className="grid gap-4">
            <Card className="border border-border/50 bg-muted/20">
              <CardContent className="pt-6 grid gap-4">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-70">
                  Delivery Channels
                </p>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      Email Notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Receive critical alerts via email.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      Browser Push
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Receive real-time dashboard notifications.
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-muted/20">
              <CardContent className="pt-6 grid gap-4">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-70">
                  Subscription Topics
                </p>
                <div className="flex items-center justify-between p-2">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium">
                      Billing & Invoices
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Get notified about receipts and payment failures.
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between p-2">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium">Security Alerts</span>
                    <span className="text-xs text-muted-foreground">
                      Get notified about new logins and password changes.
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between p-2">
                  <div className="grid gap-1">
                    <span className="text-sm font-medium">
                      Marketing & News
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stay updated on new features and product tips.
                    </span>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Data Management Section */}
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <HugeiconsIcon
                icon={Download01Icon}
                size={20}
                strokeWidth={1.5}
              />
              Data Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Download your account information or archive your history.
            </p>
          </div>

          <Card className="border border-border/50 bg-muted/20 transition-all hover:bg-muted/30">
            <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="grid gap-1">
                <span className="text-sm font-medium">
                  Export Personal Data
                </span>
                <span className="text-xs text-muted-foreground">
                  Download a complete copy of your personal data in JSON format
                  for your records.
                </span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <HugeiconsIcon
                  icon={Download01Icon}
                  size={16}
                  strokeWidth={1.5}
                />
                Export Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border/50" />

        {/* Danger Zone */}
        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={Alert01Icon} size={20} strokeWidth={1.5} />
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Irreversible actions related to your account.
            </p>
          </div>

          <Card className="border border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-base font-medium text-destructive">
                Delete Account
              </CardTitle>
              <CardDescription className="text-destructive/80 text-xs md:text-sm">
                Once you delete your account, there is no going back. Please be
                certain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="gap-2 shadow-sm border border-destructive/20"
              >
                <HugeiconsIcon
                  icon={UserRemoveIcon}
                  size={18}
                  strokeWidth={1.5}
                />
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="outline">Discard Changes</Button>
          <Button
            className="min-w-32 gap-2 shadow-lg shadow-primary/10"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2} />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
