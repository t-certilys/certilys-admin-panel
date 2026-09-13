"use client";

import * as React from "react";

import type { ReviewCorrectionDraft } from "./course-review.types";

/**
 * Corrections preparees pendant l'examen d'un dossier, avant l'envoi de la
 * decision.
 *
 * L'administration les note en regardant les videos, sur la page d'apercu,
 * puis les envoie depuis l'apercu ou depuis le dossier : elles sont donc
 * partagees entre les pages et conservees pour l'onglet (sessionStorage) en
 * cas de rechargement. Il s'agit d'un contenu nouveau, jamais d'une valeur
 * deja enregistree : aucune confusion possible avec l'etat du backend.
 *
 * Le brouillon appartient a l'administrateur connecte : la cle porte son
 * identifiant et la deconnexion efface tout, pour qu'un autre compte ouvert
 * dans le meme onglet ne voie ni n'envoie les corrections du precedent.
 */

type Listener = () => void;

const EMPTY: ReviewCorrectionDraft[] = [];
const cache = new Map<string, ReviewCorrectionDraft[]>();
const listeners = new Map<string, Set<Listener>>();

const STORAGE_PREFIX = "certilys:review-corrections:";

function storageKey(key: string) {
  return `${STORAGE_PREFIX}${key}`;
}

const ReviewDraftOwnerContext = React.createContext<string | null>(null);

/** Rattache les brouillons de corrections a l'administrateur connecte. */
export function ReviewDraftOwnerProvider({
  adminId,
  children,
}: {
  adminId: string | null;
  children: React.ReactNode;
}) {
  return (
    <ReviewDraftOwnerContext.Provider value={adminId}>
      {children}
    </ReviewDraftOwnerContext.Provider>
  );
}

/** Efface les corrections preparees de tous les dossiers, a la deconnexion. */
export function clearReviewCorrectionDrafts() {
  try {
    const keys: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Stockage indisponible : seul le cache memoire est a vider.
  }
  const touched = [...cache.keys()];
  cache.clear();
  touched.forEach((key) =>
    listeners.get(key)?.forEach((listener) => listener()),
  );
}

function read(key: string): ReviewCorrectionDraft[] {
  const cached = cache.get(key);
  if (cached) return cached;
  let items: ReviewCorrectionDraft[] = EMPTY;
  try {
    const raw = window.sessionStorage.getItem(storageKey(key));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) items = parsed as ReviewCorrectionDraft[];
  } catch {
    items = EMPTY;
  }
  cache.set(key, items);
  return items;
}

function write(key: string, items: ReviewCorrectionDraft[]) {
  cache.set(key, items);
  try {
    if (items.length === 0) {
      window.sessionStorage.removeItem(storageKey(key));
    } else {
      window.sessionStorage.setItem(storageKey(key), JSON.stringify(items));
    }
  } catch {
    // Stockage indisponible (navigation privee stricte) : la liste reste en
    // memoire pour la session en cours.
  }
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: Listener) {
  const set = listeners.get(key) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(key, set);
  return () => {
    set.delete(listener);
  };
}

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * @param courseId formation examinee
 * @param revisionId mise a jour examinee, `null` pour une premiere soumission
 */
export function useReviewCorrectionsDraft(
  courseId: string,
  revisionId: string | null,
) {
  const owner = React.useContext(ReviewDraftOwnerContext) ?? "anonymous";
  const key = `${owner}:${courseId}:${revisionId ?? "course"}`;

  const items = React.useSyncExternalStore(
    React.useCallback((listener) => subscribe(key, listener), [key]),
    () => read(key),
    () => EMPTY,
  );

  const add = React.useCallback(
    (item: Omit<ReviewCorrectionDraft, "key">) => {
      write(key, [...read(key), { ...item, key: newKey() }]);
    },
    [key],
  );

  const remove = React.useCallback(
    (itemKey: string) => {
      write(
        key,
        read(key).filter((item) => item.key !== itemKey),
      );
    },
    [key],
  );

  const replace = React.useCallback(
    (next: ReviewCorrectionDraft[]) => write(key, next),
    [key],
  );

  const clear = React.useCallback(() => write(key, EMPTY), [key]);

  return { items, add, remove, replace, clear };
}
