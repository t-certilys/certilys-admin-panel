"use server";

import {
  adminDelete,
  adminGet,
  adminMutation,
  adminPatch,
} from "@/lib/admin-api";

export type AdminExpertiseDomain = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  usageCount: number;
};

type DomainsResponse = { domains: AdminExpertiseDomain[] };
type DomainResponse = { domain: AdminExpertiseDomain };

export async function getAdminExpertiseDomainsAction() {
  const response = await adminGet<DomainsResponse>(
    "/admin/expertise-domains",
  );
  return response.domains;
}

export async function createAdminExpertiseDomainAction(name: string) {
  const response = await adminMutation<DomainResponse>(
    "/admin/expertise-domains",
    { name: name.trim() },
  );
  return response.domain;
}

export async function updateAdminExpertiseDomainAction(
  id: string,
  name: string,
) {
  const response = await adminPatch<DomainResponse>(
    `/admin/expertise-domains/${encodeURIComponent(id)}`,
    { name: name.trim() },
  );
  return response.domain;
}

export async function deleteAdminExpertiseDomainAction(id: string) {
  await adminDelete<{
    status: "EXPERTISE_DOMAIN_DELETED";
    domainId: string;
  }>(`/admin/expertise-domains/${encodeURIComponent(id)}`);
}
