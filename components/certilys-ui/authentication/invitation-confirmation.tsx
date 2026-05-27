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
import {
  getInvitationDetails,
  acceptInvitation,
  rejectInvitation,
  InvitationDetails,
} from "@/lib/invitation-actions";
import { toast } from "sonner";

export default function InvitationConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);

  useEffect(() => {
    // Si pas de token, on simule "token_valid" pour les tests UI faciles
    const invitationToken = token || "token_valid";
    fetchDetails(invitationToken);
  }, [token]);

  const fetchDetails = async (tokenOrId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInvitationDetails(tokenOrId);

      if (response.success && response.data) {
        setInvitation(response.data);
      } else {
        setError(
          response.message ||
            "Impossible de récupérer les détails de l'invitation.",
        );
      }
    } catch (err) {
      setError("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    const invitationToken = token || "token_valid";

    try {
      setAccepting(true);

      const response = await acceptInvitation(invitationToken);

      if (response.success) {
        toast.success(response.message);
        // Redirection vers le login passwordless
        router.push("/auth/login");
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Erreur lors de l'acceptation.");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    const invitationToken = token || "token_valid";

    try {
      setRejecting(true);

      const response = await rejectInvitation(invitationToken);

      if (response.success) {
        toast.success(response.message);
        router.push("/auth/login");
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      toast.error("Erreur lors du rejet.");
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 auth-pattern items-center justify-center p-12 relative overflow-hidden">
          <Image
            src="/images/illustrations/Invite-cuate.svg"
            alt="Illustration d'invitation"
            width={500}
            height={500}
            className="relative z-10 max-w-full max-h-full object-contain"
            priority
          />
        </div>

        <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8">
          <p className="text-gray-400 animate-pulse">
            Chargement de votre invitation sécurisée...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 auth-pattern items-center justify-center p-12 relative overflow-hidden">
          <Image
            src="/images/illustrations/Invite-cuate.svg"
            alt="Illustration d'invitation"
            width={500}
            height={500}
            className="relative z-10 max-w-full max-h-full object-contain"
            priority
          />
        </div>

        <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="mx-auto size-14 text-destructive"
              strokeWidth={1.5}
            />

            <h1 className="text-2xl font-bold font-sora">
              Invitation Invalide
            </h1>

            <p className="text-gray-400 text-sm">{error}</p>

            <div className="max-w-xs mx-auto">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-sm font-semibold"
                onClick={() => router.push("/auth/login")}
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Pattern + Illustration */}
      <div className="hidden lg:flex lg:w-1/2 auth-pattern items-center justify-center p-12 relative overflow-hidden">
        <Image
          src="/images/illustrations/Invite-cuate.svg"
          alt="Illustration d'invitation"
          width={500}
          height={500}
          className="relative z-10 max-w-full max-h-full object-contain"
          priority
        />
      </div>

      {/* Right Section - Content on black background */}
      <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold font-sora mb-4 leading-tight">
              Invitation d'administration{" "}
              <span className="text-primary">Certilys</span>
            </h1>

            <p className="text-gray-400 text-sm">
              Vous avez été invité par{" "}
              <strong className="text-white">{invitation?.inviterName}</strong>{" "}
              à rejoindre l'équipe d'administration pour l'espace{" "}
              <strong className="text-white">{invitation?.teamName}</strong>.
            </p>
          </div>

          {/* Invitation Details Info Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              Email invité
            </div>

            <div className="text-sm font-semibold text-white font-mono mt-0.5">
              {invitation?.email}
            </div>

            <div className="text-[10px] text-zinc-500 mt-2">
              L'activation de ce compte est strictement soumise à l'acceptation
              de cette invitation avant connexion.
            </div>
          </div>

          {/* Responsibilities */}
          <div className="mb-8 space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-zinc-400 mb-2">
              Droits et Responsabilités
            </h2>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded bg-primary/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={DatabaseIcon}
                  className="size-4 text-primary"
                  strokeWidth={1.5}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">
                  Validation des formations
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  Examiner et valider les programmes de formations soumis par
                  les formateurs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded bg-primary/20 flex items-center justify-center">
                <HugeiconsIcon
                  icon={UserIcon}
                  className="size-4 text-primary"
                  strokeWidth={1.5}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-white">
                  Gestion des formateurs
                </h3>

                <p className="text-xs text-gray-400 mt-0.5">
                  Contrôler les documents légaux des formateurs et accorder les
                  droits de publication.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold"
              size="lg"
              onClick={handleAccept}
              disabled={accepting || rejecting}
            >
              {accepting ? (
                "Acceptation en cours..."
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
              className="w-full bg-transparent border border-zinc-800 text-white hover:bg-zinc-950 text-sm font-semibold"
              size="lg"
              onClick={handleReject}
              disabled={accepting || rejecting}
            >
              {rejecting ? (
                "Rejet en cours..."
              ) : (
                <>
                  <HugeiconsIcon icon={Cancel01Icon} className="mr-2 size-5" />
                  Décliner l'invitation
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Lien expirable à usage unique. Besoin d'aide ?{" "}
              <button
                className="text-primary font-medium hover:underline"
                onClick={() => router.push("/auth/login")}
              >
                Retour
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
