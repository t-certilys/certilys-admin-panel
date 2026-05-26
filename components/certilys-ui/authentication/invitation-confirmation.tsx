"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  DatabaseIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface InvitationDetails {
  teamName: string;
  teamDescription?: string;
  inviterName?: string;
}

export default function InvitationConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invitationId = searchParams.get("invitationId");

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pour le développement front-end, on ne redirige pas automatiquement
    if (token || invitationId) {
      fetchInvitationDetails();
    } else {
      setLoading(false);
    }
  }, [token, invitationId]);

  const fetchInvitationDetails = async () => {
    try {
      setLoading(true);
      // TODO: Appeler l'API pour récupérer les détails de l'invitation
      setLoading(false);
    } catch (err) {
      setError("Impossible de récupérer les détails de l'invitation");
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setAccepting(true);
      // TODO: Appeler l'API pour accepter l'invitation
      router.push("/dashboard");
    } catch (err) {
      setError("Erreur lors de l'acceptation de l'invitation");
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    try {
      setRejecting(true);
      // TODO: Appeler l'API pour rejeter l'invitation
      router.push("/auth/login");
    } catch (err) {
      setError("Erreur lors du rejet de l'invitation");
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src="/images/illustrations/Invite-cuate.svg"
              alt="Illustration d'invitation"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8">
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
          <div className="w-full h-full flex items-center justify-center">
            <Image
              src="/images/illustrations/Invite-cuate.svg"
              alt="Illustration d'invitation"
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="mx-auto size-12 text-destructive"
              strokeWidth={1.5}
            />
            <h1 className="mt-4 text-center font-semibold text-2xl">Erreur</h1>
            <p className="mt-2 text-gray-400">{error}</p>
            <Button
              className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/auth/login")}
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted items-center justify-center p-12">
        <div className="w-full h-full flex items-center justify-center">
          <Image
            src="/images/illustrations/Invite-cuate.svg"
            alt="Illustration d'invitation"
            width={500}
            height={500}
            className="max-w-full max-h-full object-contain"
            priority
          />
        </div>
      </div>

      {/* Right Section - Content on black background */}
      <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Invitation à rejoindre l'équipe{" "}
              <span className="text-primary">Certilys</span>
            </h1>
            <p className="text-gray-400">
              Vous avez été invité à rejoindre l'équipe d'administration de
              l'application Certilys. Vous pouvez accepter ou rejeter la demande.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-10 space-y-4">
            <h2 className="text-lg font-semibold mb-4">
              Avantages en tant qu'administrateur
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={DatabaseIcon}
                  className="size-5 text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3 className="font-medium">Gestion des recettes</h3>
                <p className="text-sm text-gray-400">
                  Gérer la base de données des recettes de manière complète
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={UserIcon}
                  className="size-5 text-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3 className="font-medium">Gestion des utilisateurs</h3>
                <p className="text-sm text-gray-400">
                  Gérer les utilisateurs de la plateforme et leurs permissions
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={handleAccept}
              disabled={accepting || rejecting}
            >
              {accepting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Acceptation...
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="mr-2 size-5"
                  />
                  Accepter l'invitation
                </>
              )}
            </Button>

            <Button
              className="w-full bg-transparent border border-gray-700 text-white hover:bg-gray-900"
              size="lg"
              onClick={handleReject}
              disabled={accepting || rejecting}
            >
              {rejecting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Rejet...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Cancel01Icon} className="mr-2 size-5" />
                  Rejeter l'invitation
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Vous avez déjà un compte ?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => router.push("/auth/login")}
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
