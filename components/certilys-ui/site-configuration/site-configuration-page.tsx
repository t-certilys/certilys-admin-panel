"use client";

import * as React from "react";
import { getImageProps } from "next/image";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  CheckmarkBadge01Icon,
  Delete02Icon,
  Edit02Icon,
  ImageUpload01Icon,
  Loading02Icon,
  PlusSignIcon,
  Settings02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryState } from "nuqs";
import { toast } from "sonner";
import { AppDialog } from "@/components/certilys-ui/dialogs";
import { ImageCropDialog } from "@/components/certilys-ui/image-crop-dialog";
import { ExpertiseDomainsDialog } from "@/components/certilys-ui/instructors/expertise-domains-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createFeaturedInstructorAction,
  deleteFeaturedInstructorAction,
  getEligibleFeaturedInstructorsAction,
  getFeaturedInstructorsAction,
  getVerifiedInstructorsSettingsAction,
  reorderFeaturedInstructorsAction,
  type AdminFeaturedInstructor,
  type EligibleFeaturedInstructor,
  type VerifiedInstructorsSettings,
  updateFeaturedInstructorAction,
  updateVerifiedInstructorsSettingsAction,
  uploadFeaturedInstructorImageAction,
} from "@/lib/admin-site-config-actions";
import { imageUploadSchema } from "@/lib/images/image-upload.schema";

type EditorState = {
  entry: AdminFeaturedInstructor | null;
  instructorId: string;
  displayNameOverride: string;
  expertiseOverride: string;
  imageAlt: string;
  image: File | null;
};

type CropRequest =
  | {
      kind: "entry";
      entry: AdminFeaturedInstructor;
      source: string;
    }
  | {
      kind: "editor";
      source: string;
      fileName: string;
    };

const EMPTY_EDITOR: EditorState = {
  entry: null,
  instructorId: "",
  displayNameOverride: "",
  expertiseOverride: "",
  imageAlt: "",
  image: null,
};

export function SiteConfigurationPage() {
  const [tab, setTab] = useQueryState("tab", { defaultValue: "landing" });
  const [settings, setSettings] =
    React.useState<VerifiedInstructorsSettings | null>(null);
  const [entries, setEntries] = React.useState<AdminFeaturedInstructor[]>([]);
  const [eligible, setEligible] = React.useState<EligibleFeaturedInstructor[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [editor, setEditor] = React.useState<EditorState | null>(null);
  const [editorSaving, setEditorSaving] = React.useState(false);
  const [candidateSearch, setCandidateSearch] = React.useState("");
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminFeaturedInstructor | null>(null);
  const [expertiseOpen, setExpertiseOpen] = React.useState(false);
  const [cropRequest, setCropRequest] = React.useState<CropRequest | null>(
    null,
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [nextSettings, nextEntries, nextEligible] = await Promise.all([
        getVerifiedInstructorsSettingsAction(),
        getFeaturedInstructorsAction(),
        getEligibleFeaturedInstructorsAction(),
      ]);
      setSettings(nextSettings);
      setEntries(nextEntries);
      setEligible(nextEligible);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Chargement impossible.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const visibleCandidates = React.useMemo(() => {
    const query = candidateSearch.trim().toLowerCase();
    return eligible.filter((candidate) => {
      if (candidate.isSelected) return false;
      if (!query) return true;
      return [
        candidate.displayName,
        candidate.username,
        candidate.expertise,
        candidate.email,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [candidateSearch, eligible]);

  async function saveSettings() {
    if (!settings || savingSettings) return;
    setSavingSettings(true);
    try {
      const updated = await updateVerifiedInstructorsSettingsAction({
        enabled: settings.enabled,
        title: settings.title.trim(),
        description: settings.description.trim(),
      });
      setSettings(updated);
      toast.success("Configuration de la carte enregistrée.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  function openEditor(entry?: AdminFeaturedInstructor) {
    setCandidateSearch("");
    setEditor(
      entry
        ? {
            entry,
            instructorId: entry.instructorId,
            displayNameOverride: entry.displayNameOverride ?? "",
            expertiseOverride: entry.expertiseOverride ?? "",
            imageAlt: entry.imageAlt ?? "",
            image: null,
          }
        : { ...EMPTY_EDITOR },
    );
  }

  async function saveEditor() {
    if (!editor || !editor.instructorId || editorSaving) return;
    setEditorSaving(true);
    try {
      let saved = editor.entry
        ? await updateFeaturedInstructorAction(editor.entry.id, {
            displayNameOverride: editor.displayNameOverride,
            expertiseOverride: editor.expertiseOverride,
            imageAlt: editor.imageAlt,
          })
        : await createFeaturedInstructorAction({
            instructorId: editor.instructorId,
            displayNameOverride: editor.displayNameOverride,
            expertiseOverride: editor.expertiseOverride,
            imageAlt: editor.imageAlt,
          });

      if (editor.image) {
        saved = await uploadFeaturedInstructorImageAction(
          saved.id,
          editor.image,
        );
      }

      setEntries((current) => {
        const exists = current.some((item) => item.id === saved.id);
        return exists
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [...current, saved];
      });
      setEligible((current) =>
        current.map((candidate) =>
          candidate.id === saved.instructorId
            ? { ...candidate, isSelected: true }
            : candidate,
        ),
      );
      setEditor(null);
      toast.success(
        editor.entry
          ? "Présentation du formateur mise à jour."
          : "Formateur ajouté à la landing.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible.",
      );
    } finally {
      setEditorSaving(false);
    }
  }

  async function toggleEntry(entry: AdminFeaturedInstructor, checked: boolean) {
    setBusyId(entry.id);
    try {
      const updated = await updateFeaturedInstructorAction(entry.id, {
        isActive: checked,
      });
      setEntries((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Modification impossible.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function switchToProfileImage(entry: AdminFeaturedInstructor) {
    setBusyId(entry.id);
    try {
      const updated = await updateFeaturedInstructorAction(entry.id, {
        imageMode: "PROFILE",
      });
      setEntries((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("La photo du profil sera utilisée.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Modification impossible.",
      );
    } finally {
      setBusyId(null);
    }
  }

  function openEntryCrop(entry: AdminFeaturedInstructor) {
    const imageUrl =
      entry.imageMode === "CUSTOM"
        ? entry.customImageUrl
        : entry.profileImageUrl;
    if (!imageUrl) {
      toast.error("Ce formateur n’a pas encore de photo à repositionner.");
      return;
    }
    setCropRequest({
      kind: "entry",
      entry,
      source: getCropSourceUrl(imageUrl),
    });
  }

  function closeCropDialog() {
    setCropRequest((current) => {
      if (current?.kind === "editor") URL.revokeObjectURL(current.source);
      return null;
    });
  }

  async function saveCrop(blob: Blob) {
    if (!cropRequest) return;
    const file = new File([blob], "portrait-landing.webp", {
      type: "image/webp",
    });
    if (cropRequest.kind === "editor") {
      setEditor((current) => (current ? { ...current, image: file } : current));
      return;
    }

    const entry = cropRequest.entry;
    setBusyId(entry.id);
    try {
      const updated = await uploadFeaturedInstructorImageAction(entry.id, file);
      setEntries((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("Le cadrage de la photo a été enregistré.");
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer le cadrage de cette photo.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function moveEntry(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= entries.length || busyId) return;
    const previous = entries;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next);
    setBusyId(entries[index].id);
    try {
      setEntries(
        await reorderFeaturedInstructorsAction(next.map((item) => item.id)),
      );
    } catch (error) {
      setEntries(previous);
      toast.error(
        error instanceof Error ? error.message : "Réorganisation impossible.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setBusyId(target.id);
    setDeleteTarget(null);
    try {
      await deleteFeaturedInstructorAction(target.id);
      setEntries((current) => current.filter((item) => item.id !== target.id));
      setEligible((current) =>
        current.map((candidate) =>
          candidate.id === target.instructorId
            ? { ...candidate, isSelected: false }
            : candidate,
        ),
      );
      toast.success("Formateur retiré de la landing.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Suppression impossible.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const activeTab = tab === "referentiels" ? "referentiels" : "landing";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-sora text-2xl font-semibold tracking-tight text-foreground">
          Configurations du site
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Pilotez les contenus publics de Certilys sans modifier le code de la
          landing.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => void setTab(value)}
        className="gap-6"
      >
        <TabsList variant="line" className="h-10">
          <TabsTrigger value="landing" className="px-3">
            Landing page
          </TabsTrigger>
          <TabsTrigger value="referentiels" className="px-3">
            Référentiels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="space-y-6">
          {loading || !settings ? (
            <div className="space-y-4">
              <Skeleton className="h-52 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Contenu de la carte</CardTitle>
                  <CardDescription>
                    Ces textes sont affichés sous l’animation des profils
                    vérifiés.
                  </CardDescription>
                  <CardAction className="flex items-center gap-2">
                    <Label
                      htmlFor="verified-section-enabled"
                      className="text-xs"
                    >
                      Visible
                    </Label>
                    <Switch
                      id="verified-section-enabled"
                      checked={settings.enabled}
                      onCheckedChange={(enabled) =>
                        setSettings((current) =>
                          current ? { ...current, enabled } : current,
                        )
                      }
                    />
                  </CardAction>
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[1fr_21rem]">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="verified-title">Titre</Label>
                      <Input
                        id="verified-title"
                        value={settings.title}
                        maxLength={80}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            title: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verified-description">Description</Label>
                      <Textarea
                        id="verified-description"
                        value={settings.description}
                        maxLength={240}
                        onChange={(event) =>
                          setSettings({
                            ...settings,
                            description: event.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => void saveSettings()}
                      disabled={
                        savingSettings ||
                        settings.title.trim().length < 2 ||
                        settings.description.trim().length < 2
                      }
                      className="gap-2"
                    >
                      {savingSettings ? (
                        <HugeiconsIcon
                          icon={Loading02Icon}
                          className="size-4 animate-spin"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={Settings02Icon}
                          className="size-4"
                        />
                      )}
                      Enregistrer
                    </Button>
                  </div>

                  <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] bg-secondary p-5 text-secondary-foreground">
                    <div className="mx-auto mt-3 flex size-28 items-center justify-center rounded-full border-4 border-accent bg-background text-secondary">
                      <HugeiconsIcon icon={UserGroupIcon} className="size-12" />
                    </div>
                    <div className="absolute inset-x-5 bottom-5">
                      <p className="flex items-center gap-2 font-sora text-xl font-semibold">
                        {settings.title || "Formateurs vérifiés"}
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
                          <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            className="size-4"
                          />
                        </span>
                      </p>
                      <p className="mt-2 text-sm leading-6 text-secondary-foreground/75">
                        {settings.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Formateurs mis en avant</CardTitle>
                  <CardDescription>
                    Jusqu’à huit profils actifs, affichés dans l’ordre
                    ci-dessous.
                  </CardDescription>
                  <CardAction>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => openEditor()}
                      disabled={
                        entries.filter((entry) => entry.isActive).length >= 8
                      }
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                      Ajouter
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-3">
                  {entries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
                      <p className="font-medium text-foreground">
                        Aucun formateur configuré
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        La landing affichera son état générique jusqu’à votre
                        première sélection.
                      </p>
                    </div>
                  ) : (
                    entries.map((entry, index) => {
                      const imageUrl =
                        entry.imageMode === "CUSTOM"
                          ? entry.customImageUrl
                          : entry.profileImageUrl;
                      return (
                        <div
                          key={entry.id}
                          className="flex flex-col gap-3 rounded-xl border border-border/60 p-3 transition-colors hover:border-primary/25 md:flex-row md:items-center"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Avatar className="size-12">
                              {imageUrl ? (
                                <AvatarImage src={imageUrl} alt="" />
                              ) : null}
                              <AvatarFallback>
                                {initials(entry.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">
                                {entry.displayNameOverride || entry.displayName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {entry.expertiseOverride ||
                                  entry.profileExpertise}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {entry.imageMode === "CUSTOM"
                                    ? "Image personnalisée"
                                    : "Photo du profil"}
                                </Badge>
                                {!entry.isActive ? (
                                  <Badge variant="secondary">Masqué</Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Monter le formateur"
                                disabled={index === 0 || Boolean(busyId)}
                                onClick={() => void moveEntry(index, -1)}
                              >
                                <HugeiconsIcon
                                  icon={ArrowUp01Icon}
                                  className="size-4"
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Descendre le formateur"
                                disabled={
                                  index === entries.length - 1 ||
                                  Boolean(busyId)
                                }
                                onClick={() => void moveEntry(index, 1)}
                              >
                                <HugeiconsIcon
                                  icon={ArrowDown01Icon}
                                  className="size-4"
                                />
                              </Button>
                            </div>
                            {entry.imageMode === "CUSTOM" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busyId === entry.id}
                                onClick={() => void switchToProfileImage(entry)}
                              >
                                Utiliser le profil
                              </Button>
                            ) : null}
                            {imageUrl ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={busyId === entry.id}
                                onClick={() => openEntryCrop(entry)}
                              >
                                Repositionner la photo
                              </Button>
                            ) : null}
                            <Switch
                              checked={entry.isActive}
                              disabled={busyId === entry.id}
                              onCheckedChange={(checked) =>
                                void toggleEntry(entry, checked)
                              }
                              aria-label={`Afficher ${entry.displayName}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Modifier ${entry.displayName}`}
                              onClick={() => openEditor(entry)}
                            >
                              <HugeiconsIcon
                                icon={Edit02Icon}
                                className="size-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Retirer ${entry.displayName}`}
                              onClick={() => setDeleteTarget(entry)}
                            >
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                className="size-4"
                              />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="referentiels">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Domaines d’expertise</CardTitle>
              <CardDescription>
                Gérez les choix proposés aux formateurs pendant leur onboarding
                et dans leur profil.
              </CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  onClick={() => setExpertiseOpen(true)}
                >
                  Gérer les domaines
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Les renommages sont répercutés sur les spécialités principales
                existantes. Un domaine utilisé ne peut pas être supprimé.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExpertiseDomainsDialog
        open={expertiseOpen}
        onOpenChange={setExpertiseOpen}
      />

      <AppDialog
        open={Boolean(editor)}
        onOpenChange={(open) => {
          if (!open && !editorSaving) setEditor(null);
        }}
        size="lg"
        title={
          editor?.entry ? "Modifier la présentation" : "Ajouter un formateur"
        }
        description="Les textes saisis ici restent propres à la landing et ne modifient pas le profil officiel."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditor(null)}
              disabled={editorSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={() => void saveEditor()}
              disabled={!editor?.instructorId || editorSaving}
              className="gap-2"
            >
              {editorSaving ? (
                <HugeiconsIcon
                  icon={Loading02Icon}
                  className="size-4 animate-spin"
                />
              ) : null}
              Enregistrer
            </Button>
          </div>
        }
      >
        {editor ? (
          <div className="space-y-5">
            {!editor.entry ? (
              <div className="space-y-3">
                <Label htmlFor="featured-instructor-search">Formateur</Label>
                <Input
                  id="featured-instructor-search"
                  placeholder="Rechercher par nom, email ou expertise…"
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                />
                <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-border/60 p-2">
                  {visibleCandidates.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                      Aucun formateur disponible.
                    </p>
                  ) : (
                    visibleCandidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() =>
                          setEditor((current) =>
                            current
                              ? { ...current, instructorId: candidate.id }
                              : current,
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                          editor.instructorId === candidate.id
                            ? "border-primary bg-primary/5"
                            : "border-transparent hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <Avatar className="size-9">
                          {candidate.photoUrl ? (
                            <AvatarImage src={candidate.photoUrl} alt="" />
                          ) : null}
                          <AvatarFallback>
                            {initials(candidate.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {candidate.displayName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {candidate.expertise} · {candidate.email}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="featured-name">Nom affiché, facultatif</Label>
                <Input
                  id="featured-name"
                  value={editor.displayNameOverride}
                  maxLength={120}
                  placeholder={editor.entry?.displayName ?? "Nom du profil"}
                  onChange={(event) =>
                    setEditor({
                      ...editor,
                      displayNameOverride: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="featured-expertise">
                  Expertise affichée, facultative
                </Label>
                <Input
                  id="featured-expertise"
                  value={editor.expertiseOverride}
                  maxLength={160}
                  placeholder={
                    editor.entry?.profileExpertise ?? "Expertise du profil"
                  }
                  onChange={(event) =>
                    setEditor({
                      ...editor,
                      expertiseOverride: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured-alt">
                Description accessible de l’image
              </Label>
              <Input
                id="featured-alt"
                value={editor.imageAlt}
                maxLength={180}
                placeholder="Ex. : Portrait de la formatrice Awa Diop"
                onChange={(event) =>
                  setEditor({ ...editor, imageAlt: event.target.value })
                }
              />
            </div>

            <div className="rounded-xl border border-dashed border-border p-4">
              <Label
                htmlFor="featured-image"
                className="flex items-center gap-2"
              >
                <HugeiconsIcon icon={ImageUpload01Icon} className="size-4" />
                Image personnalisée, facultative
              </Label>
              <Input
                id="featured-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="mt-3 h-auto py-2"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = "";
                  if (!file) return;
                  const validation = imageUploadSchema.safeParse(file);
                  if (!validation.success) {
                    toast.error(
                      validation.error.issues[0]?.message ??
                        "L’image sélectionnée n’est pas valide.",
                    );
                    return;
                  }
                  setCropRequest({
                    kind: "editor",
                    source: URL.createObjectURL(file),
                    fileName: file.name,
                  });
                }}
              />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                JPEG, PNG ou WebP, 5 Mo maximum. Vous pourrez ajuster le cadrage
                avant l’enregistrement.
              </p>
              {editor.image ? (
                <p className="mt-2 text-xs font-medium text-primary">
                  Le cadrage personnalisé est prêt à être enregistré.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </AppDialog>

      <ImageCropDialog
        open={Boolean(cropRequest)}
        imageSrc={cropRequest?.source ?? null}
        title={
          cropRequest?.kind === "entry"
            ? `Repositionner la photo de ${cropRequest.entry.displayName}`
            : "Recadrer l’image personnalisée"
        }
        description="Le cercle correspond au portrait affiché sur la landing. La photo de profil publique ne sera jamais modifiée."
        onOpenChange={(open) => {
          if (!open) closeCropDialog();
        }}
        onConfirm={saveCrop}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Retirer ce formateur de la landing ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Le compte et le profil de {deleteTarget?.displayName} ne seront
              pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void confirmDelete()}
            >
              Retirer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getCropSourceUrl(imageUrl: string) {
  if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }
  try {
    const { props } = getImageProps({
      src: imageUrl,
      alt: "",
      width: 1024,
      height: 1024,
      quality: 90,
    });
    return typeof props.src === "string" ? props.src : imageUrl;
  } catch {
    return imageUrl;
  }
}
