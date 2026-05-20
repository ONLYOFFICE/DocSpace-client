/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

import { cookies } from "next/headers";

import { getAiAgents } from "@/api/arbiter";
import type { ArbiterCommonData } from "@/types/arbiter";

import AiArbiterShell from "./layout.client";

export const dynamic = "force-dynamic";

export default async function AiArbiterServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value ?? "";

  const agents = await getAiAgents();

  const commonData: ArbiterCommonData = {
    agents,
    authToken,
  };

  return <AiArbiterShell commonData={commonData}>{children}</AiArbiterShell>;
}
