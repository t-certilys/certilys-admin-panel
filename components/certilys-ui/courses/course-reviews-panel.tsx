"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { courseReviewModerationSchema, type CourseReviewModerationValues } from "@/lib/reviews/course-review-moderation.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCourseReviewsAction,
  setAdminCourseReviewReplyVisibilityAction,
  setAdminCourseReviewVisibilityAction,
  type AdminCourseReview,
  type AdminCourseReviewsResponse,
} from "@/lib/admin-course-reviews-actions";

const PAGE_SIZE = 10;

type ModerationTarget = {
  kind: "review" | "reply";
  review: AdminCourseReview;
  hidden: boolean;
};

export function CourseReviewsPanel({ courseId }: { courseId: string }) {
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [rating, setRating] = React.useState("all");
  const [visibility, setVisibility] = React.useState<"all" | "visible" | "hidden">("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<AdminCourseReviewsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [moderation, setModeration] = React.useState<ModerationTarget | null>(null);
  const form = useForm<CourseReviewModerationValues>({
    resolver: zodResolver(courseReviewModerationSchema),
    mode: "onChange",
    defaultValues: { reason: "" },
  });
  const reason = form.watch("reason");
  const [moderationError, setModerationError] = React.useState<string | null>(null);
  const [isModerating, setIsModerating] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const requestVersion = React.useRef(0);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const load = React.useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      setIsLoading(true);
      const result = await getAdminCourseReviewsAction(courseId, {
        q: debouncedQuery,
        rating: rating === "all" ? undefined : Number(rating),
        visibility,
        page,
        limit: PAGE_SIZE,
      });
      if (version !== requestVersion.current) return false;
      if (!result.success) throw new Error(result.error);
      const response = result.data;
      setData(response);
      if (page > Math.max(1, response.pagination.totalPages)) {
        setPage(Math.max(1, response.pagination.totalPages));
      }
      setError(null);
      return true;
    } catch (requestError) {
      if (version !== requestVersion.current) return false;
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible de charger les avis.",
      );
      return false;
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [courseId, debouncedQuery, page, rating, visibility]);

  React.useEffect(() => {
    void load();
    return () => { requestVersion.current += 1; };
  }, [load]);

  function openModeration(target: ModerationTarget) {
    form.reset({ reason: "" });
    setModerationError(null);
    setModeration(target);
  }

  function closeModeration() {
    if (isModerating) return;
    if (form.formState.isDirty && !window.confirm("Quitter sans enregistrer le motif de modération ?")) return;
    form.reset({ reason: "" });
    setModeration(null);
  }

  React.useEffect(() => {
    if (!moderation || !form.formState.isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
    const navigate = (event: Event) => {
      const destination = (event as Event & { destination: { url: string } }).destination;
      if (!event.cancelable || new URL(destination.url).pathname === window.location.pathname) return;
      if (!window.confirm("Quitter sans enregistrer le motif de modération ?")) event.preventDefault();
    };
    navigation?.addEventListener("navigate", navigate);
    if (navigation) {
      return () => {
        window.removeEventListener("beforeunload", beforeUnload);
        navigation.removeEventListener("navigate", navigate);
      };
    }

    const guardUrl = window.location.href;
    let sentinelActive = true;
    let cleaningUp = false;
    window.history.pushState(
      { ...(window.history.state ?? {}), __unsavedChangesGuard: true },
      "",
      guardUrl,
    );
    const handlePopState = (event: PopStateEvent) => {
      if (cleaningUp) {
        cleaningUp = false;
        sentinelActive = false;
        event.stopImmediatePropagation();
        return;
      }
      if (!sentinelActive) return;
      if (window.confirm("Quitter sans enregistrer le motif de modération ?")) {
        sentinelActive = false;
        return;
      }
      event.stopImmediatePropagation();
      window.history.pushState(
        { ...(window.history.state ?? {}), __unsavedChangesGuard: true },
        "",
        guardUrl,
      );
    };
    window.addEventListener("popstate", handlePopState, true);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("popstate", handlePopState, true);
      if (sentinelActive) {
        cleaningUp = true;
        window.history.back();
      }
    };
  }, [moderation, form.formState.isDirty]);

  const confirmModeration = form.handleSubmit(async ({ reason: trimmedReason }) => {
    if (!moderation || isModerating) return;

    setIsModerating(true);
    setModerationError(null);
    setNotice(null);
    try {
      if (moderation.kind === "review") {
        const result = await setAdminCourseReviewVisibilityAction(
          courseId,
          moderation.review.id,
          moderation.hidden,
          trimmedReason,
        );
        if (!result.success) throw new Error(result.error);
      } else {
        const result = await setAdminCourseReviewReplyVisibilityAction(
          courseId,
          moderation.review.id,
          moderation.hidden,
          trimmedReason,
        );
        if (!result.success) throw new Error(result.error);
      }
      setModeration(null);
      form.reset({ reason: "" });
      const refreshed = await load();
      setNotice(
        refreshed
          ? "La modération a été enregistrée et la liste a été actualisée."
          : "La modération a été enregistrée, mais l’actualisation de la liste a échoué.",
      );
    } catch (requestError) {
      setModerationError(
        requestError instanceof Error
          ? requestError.message
          : "Impossible d’appliquer cette modération.",
      );
    } finally {
      setIsModerating(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avis des apprenants</CardTitle>
        <p className="text-sm text-muted-foreground">
          Modérez séparément un avis et la réponse de son formateur. Chaque action est consignée dans les logs d’audit.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {data ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Note moyenne" value={data.summary.ratingAverage == null ? "Aucune" : `${formatRating(data.summary.ratingAverage)} / 5`} />
            <Metric label="Évaluations visibles" value={String(data.summary.ratingCount)} />
            <Metric label="Commentaires visibles" value={String(data.summary.commentCount)} />
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_190px]">
          <Input
            value={query}
            maxLength={200}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un commentaire"
            aria-label="Rechercher un commentaire"
          />
          <Select value={rating} onValueChange={(value) => { setRating(value); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les notes</SelectItem>
              {[5, 4, 3, 2, 1].map((value) => (
                <SelectItem key={value} value={String(value)}>{value} étoile{value > 1 ? "s" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visibility} onValueChange={(value) => { setVisibility(value as typeof visibility); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="visible">Avis visibles</SelectItem>
              <SelectItem value="hidden">Avis masqués</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {notice ? (
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">{notice}</div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
            <Button type="button" variant="outline" size="sm" className="ml-3" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        ) : null}

        {!data && isLoading ? (
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        ) : data?.reviews.length ? (
          <div className="space-y-4" aria-busy={isLoading}>
            {data.reviews.map((review) => (
              <article key={review.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={review.author.avatarUrl ?? undefined} alt={review.author.displayName} />
                      <AvatarFallback>{review.author.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{review.author.displayName}</p>
                        <Badge variant={review.isHidden ? "secondary" : "outline"}>
                          {review.isHidden ? "Avis masqué" : "Avis visible"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.rating}/5 · {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={review.isHidden ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => openModeration({ kind: "review", review, hidden: !review.isHidden })}
                  >
                    {review.isHidden ? "Restaurer l’avis" : "Masquer l’avis"}
                  </Button>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                  {review.comment || <span className="italic text-muted-foreground">Aucun commentaire.</span>}
                </p>

                {review.reply ? (
                  <div className="mt-4 rounded-lg border-l-4 border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">Réponse du formateur</p>
                        <Badge variant={review.reply.isHidden ? "secondary" : "outline"}>
                          {review.reply.isHidden ? "Réponse masquée" : review.isHidden ? "Masquée avec l’avis" : "Réponse visible"}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant={review.reply.isHidden ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => openModeration({ kind: "reply", review, hidden: !review.reply!.isHidden })}
                      >
                        {review.reply.isHidden ? "Restaurer la réponse" : "Masquer la réponse"}
                      </Button>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">{review.reply.body}</p>
                  </div>
                ) : null}
              </article>
            ))}

            {data.pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Précédent</Button>
                <span className="text-sm text-muted-foreground">Page {page} sur {data.pagination.totalPages}</span>
                <Button type="button" variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Suivant</Button>
              </div>
            ) : null}
          </div>
        ) : data ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucun avis ne correspond à ces filtres.
          </div>
        ) : null}
      </CardContent>

      <Dialog open={Boolean(moderation)} onOpenChange={(open) => { if (!open) closeModeration(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {moderation?.hidden ? "Masquer le contenu" : "Restaurer le contenu"}
            </DialogTitle>
            <DialogDescription>
              Le motif est obligatoire et sera enregistré avec l’action de modération.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="review-moderation-reason" className="text-sm font-medium text-foreground">Motif</label>
            <Textarea
              id="review-moderation-reason"
              maxLength={1000}
              disabled={isModerating}
              aria-invalid={Boolean(form.formState.errors.reason || moderationError)}
              aria-describedby="review-moderation-error"
              {...form.register("reason")}
              placeholder="Expliquez précisément la raison de cette action…"
            />
            <div className="flex justify-between gap-3 text-xs text-muted-foreground">
              <span id="review-moderation-error" role="alert" className="text-destructive">{form.formState.errors.reason?.message ?? moderationError}</span>
              <span className="ml-auto tabular-nums">{reason.length}/1 000</span>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isModerating} onClick={closeModeration}>Annuler</Button>
            <Button
              type="button"
              variant={moderation?.hidden ? "destructive" : "default"}
              disabled={isModerating || !form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}
              onClick={() => void confirmModeration()}
            >
              {isModerating ? "Enregistrement…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatRating(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}
