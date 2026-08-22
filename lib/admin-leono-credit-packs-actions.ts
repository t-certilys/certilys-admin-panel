"use server";

import {
  adminDelete,
  adminGet,
  adminMutation,
  adminPatch,
} from "@/lib/admin-api";

export type AdminLeonoCreditPack = {
  id: string;
  slug: string;
  label: string;
  credits: number;
  amount: number;
  currency: "XOF";
  isActive: boolean;
  recommended: boolean;
  sortOrder: number;
  purchaseCount: number;
};

export type LeonoCreditPackInput = {
  label?: string;
  credits?: number;
  amount?: number;
  isActive?: boolean;
  isRecommended?: boolean;
};

export async function getAdminLeonoCreditPacksAction() {
  const response = await adminGet<{ packs: AdminLeonoCreditPack[] }>(
    "/admin/leono/credit-packs",
  );
  return response.packs;
}

export async function createAdminLeonoCreditPackAction(
  input: Required<Pick<LeonoCreditPackInput, "label" | "credits" | "amount">> &
    LeonoCreditPackInput,
) {
  const response = await adminMutation<{ pack: AdminLeonoCreditPack }>(
    "/admin/leono/credit-packs",
    input,
  );
  return response.pack;
}

export async function updateAdminLeonoCreditPackAction(
  id: string,
  input: LeonoCreditPackInput,
) {
  const response = await adminPatch<{ pack: AdminLeonoCreditPack }>(
    `/admin/leono/credit-packs/${encodeURIComponent(id)}`,
    input,
  );
  return response.pack;
}

export async function deleteAdminLeonoCreditPackAction(id: string) {
  return adminDelete<{
    status: "LEONO_CREDIT_PACK_DELETED" | "LEONO_CREDIT_PACK_ARCHIVED";
    packId?: string;
    pack?: AdminLeonoCreditPack;
  }>(`/admin/leono/credit-packs/${encodeURIComponent(id)}`);
}
