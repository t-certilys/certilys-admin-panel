"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  UserIcon,
  InformationCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PhoneInput, type PhoneValue } from "@/components/ui/phone-input";
import { ProfileImageUpload } from "@/components/ui/profile-image-upload";
import { CharacterCounter } from "@/components/ui/character-counter";
import { AddonInput } from "@/components/ui/addon-input";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [phone, setPhone] = React.useState<PhoneValue>("" as PhoneValue);
  const [avatar, setAvatar] = React.useState<string>("https://api.dicebear.com/9.x/avataaars/svg?seed=murgo");
  const [bio, setBio] = React.useState("Developer passionate about design and user experience. Creator of Murgodash.");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your public information and how others see you.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border border-border/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Profile Picture</CardTitle>
            <CardDescription>
              Click on the avatar to change your photo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload
              value={avatar}
              onChange={setAvatar}
              onReset={() => setAvatar("")}
              fallbackText="Murgo Dash"
            />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Full Name</Label>
              <div className="relative">
                <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="fullname" placeholder="John Doe" className="pl-10" defaultValue="Murgo Dash" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input id="username" placeholder="johndoe" className="pl-8" defaultValue="murgodash" />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Business Email</Label>
            <div className="relative">
              <HugeiconsIcon icon={Mail01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input id="email" type="email" placeholder="john@example.com" className="pl-10" defaultValue="hello@murgodash.com" />
            </div>
            <p className="text-xs text-muted-foreground">
              This email will be used for security notifications.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <PhoneInput 
                value={phone} 
                onChange={setPhone} 
                placeholder="Renseigner votre numéro"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Add a phone number for 2FA or system notifications.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <div className="relative">
              <HugeiconsIcon icon={InformationCircleIcon} className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="min-h-32 pl-10 pt-3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={250}
              />
            </div>
            <CharacterCounter currentLength={bio.length} maxLength={250} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <AddonInput 
              id="website" 
              prefixAddon="https://" 
              placeholder="murgodash.dev" 
              defaultValue="murgodash.dev" 
            />
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button 
            className="min-w-32 gap-2" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
