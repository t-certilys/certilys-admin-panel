"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  Loading02Icon,
  Mail01Icon,
  Tick02Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { AddonInput } from "@/components/ui/addon-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterCounter } from "@/components/ui/character-counter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput, type PhoneValue } from "@/components/ui/phone-input";
import { ProfileImageUpload } from "@/components/ui/profile-image-upload";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminSessionAction,
  type AdminUser,
  updateAdminProfileAction,
} from "@/lib/auth-actions";

type ProfileFormState = {
  displayName: string;
  handle: string;
  email: string;
  phoneNumber: PhoneValue;
  avatarUrl: string;
  bio: string;
  website: string;
};

const emptyProfile: ProfileFormState = {
  displayName: "",
  handle: "",
  email: "",
  phoneNumber: "" as PhoneValue,
  avatarUrl: "",
  bio: "",
  website: "",
};

function profileFromUser(user: AdminUser): ProfileFormState {
  return {
    displayName: user.displayName?.trim() || user.email.split("@")[0] || "",
    handle: user.handle ?? "",
    email: user.email,
    phoneNumber: (user.phoneNumber ?? "") as PhoneValue,
    avatarUrl: user.avatarUrl ?? "",
    bio: user.bio ?? "",
    website: (user.website ?? "").replace(/^https?:\/\//i, ""),
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [profile, setProfile] = React.useState<ProfileFormState>(emptyProfile);
  const [initialProfile, setInitialProfile] = React.useState<ProfileFormState>(emptyProfile);
  const [removeAvatar, setRemoveAvatar] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    getAdminSessionAction()
      .then((session) => {
        if (!mounted) return;
        if (!session) {
          toast.error("Session administrateur expirée.");
          return;
        }
        const nextProfile = profileFromUser(session);
        setUser(session);
        setProfile(nextProfile);
        setInitialProfile(nextProfile);
      })
      .catch(() => {
        if (mounted) {
          toast.error("Impossible de charger le profil administrateur.");
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateProfile = React.useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setProfile((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const resetForm = React.useCallback(() => {
    setProfile(initialProfile);
    setRemoveAvatar(false);
  }, [initialProfile]);

  const handleAvatarChange = React.useCallback((value: string) => {
    updateProfile("avatarUrl", value);
    setRemoveAvatar(false);
  }, [updateProfile]);

  const handleAvatarReset = React.useCallback(() => {
    updateProfile("avatarUrl", "");
    setRemoveAvatar(true);
  }, [updateProfile]);

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await updateAdminProfileAction({
        displayName: profile.displayName,
        ...(profile.handle.trim() ? { handle: profile.handle } : {}),
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        bio: profile.bio,
        website: profile.website,
        ...(profile.avatarUrl.startsWith("data:")
          ? { avatarDataUrl: profile.avatarUrl }
          : {}),
        ...(removeAvatar ? { removeAvatar: true as const } : {}),
      });

      if (!result.success || !result.user) {
        toast.error(result.message || "Impossible de mettre à jour le profil.");
        return;
      }

      const nextProfile = profileFromUser(result.user);
      setUser(result.user);
      setProfile(nextProfile);
      setInitialProfile(nextProfile);
      setRemoveAvatar(false);
      toast.success("Profil administrateur mis à jour.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }, [profile, removeAvatar, router]);

  const fallbackText = profile.displayName || user?.email || "Admin";

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations administrateur et votre identité visible dans le panel.
        </p>
      </div>

      <div className="grid gap-8">
        <Card className="border border-border/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-lg">Photo de profil</CardTitle>
            <CardDescription>
              Cliquez sur l’avatar pour modifier votre photo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload
              value={profile.avatarUrl}
              onChange={handleAvatarChange}
              onReset={handleAvatarReset}
              fallbackText={fallbackText}
              disabled={isLoading || isSaving}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullname">Nom complet</Label>
              <div className="relative">
                <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="fullname"
                  placeholder="Nom complet"
                  className="pl-10"
                  value={profile.displayName}
                  onChange={(event) => updateProfile("displayName", event.target.value)}
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Nom d’utilisateur</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  id="username"
                  placeholder="nom-utilisateur"
                  className="pl-8"
                  value={profile.handle}
                  onChange={(event) => updateProfile("handle", event.target.value)}
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Adresse e-mail professionnelle</Label>
            <div className="relative">
              <HugeiconsIcon icon={Mail01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="admin@certilys.com"
                className="pl-10"
                value={profile.email}
                onChange={(event) => updateProfile("email", event.target.value)}
                disabled={isLoading || isSaving}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Cette adresse est utilisée pour les notifications et la connexion administrateur.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="relative">
              <PhoneInput
                id="phone"
                value={profile.phoneNumber}
                onChange={(value) => updateProfile("phoneNumber", value)}
                placeholder="Renseignez votre numéro"
                disabled={isLoading || isSaving}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ajoutez un numéro pour les notifications sensibles ou le support interne.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <div className="relative">
              <HugeiconsIcon icon={InformationCircleIcon} className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Textarea
                id="bio"
                placeholder="Présentez brièvement votre rôle dans l’équipe Certilys."
                className="min-h-32 pl-10 pt-3"
                value={profile.bio}
                onChange={(event) => updateProfile("bio", event.target.value)}
                maxLength={250}
                disabled={isLoading || isSaving}
              />
            </div>
            <CharacterCounter currentLength={profile.bio.length} maxLength={250} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="website">Site web</Label>
            <AddonInput
              id="website"
              prefixAddon="https://"
              placeholder="certilys.com"
              value={profile.website}
              onChange={(event) => updateProfile("website", event.target.value)}
              disabled={isLoading || isSaving}
            />
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={resetForm} disabled={isLoading || isSaving}>
            Annuler
          </Button>
          <Button
            className="min-w-32 gap-2"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? (
              <>
                <HugeiconsIcon icon={Loading02Icon} size={18} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2} />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
