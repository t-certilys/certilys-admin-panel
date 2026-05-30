"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { AppDialog } from "./app-dialog";
import { ProfileSummary, type ProfileStatusTone } from "./profile-summary";

export interface InternalProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    name: string;
    email: string;
    initials?: string;
    avatarUrl?: string | null;
    status?: ProfileStatusTone;
    role: string;
    accountStatus: string;
    twoFactorEnabled: boolean | string;
    lastLogin: string;
  } | null;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/25 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

export function InternalProfileDialog({ open, onOpenChange, profile }: InternalProfileDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Profil collaborateur"
      footer={
        <div className="flex sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fermer
          </Button>
        </div>
      }
    >
      {profile ? (
        <div className="space-y-5">
          <ProfileSummary
            name={profile.name}
            email={profile.email}
            initials={profile.initials}
            avatarUrl={profile.avatarUrl}
            status={profile.status}
          />
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="Rôle système" value={profile.role} />
            <InfoItem label="Statut compte" value={profile.accountStatus} />
            <InfoItem
              label="2FA"
              value={typeof profile.twoFactorEnabled === "boolean" ? (profile.twoFactorEnabled ? "Activée" : "Désactivée") : profile.twoFactorEnabled}
            />
            <InfoItem label="Dernière connexion" value={profile.lastLogin} />
          </div>
        </div>
      ) : null}
    </AppDialog>
  );
}
