/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { selectActivePanel } from "@/utils/ai-arbiter";

import { getAiAgents } from "@/api/arbiter";
import { getSelf } from "@/api/people";
import type {
  ActivePanelSummary,
  ArbiterCommonData,
} from "@/types/arbiter";

import AiArbiterShell from "./layout.client";

export const dynamic = "force-dynamic";

// Temporarily unpublished: the arbiter still drives the removed C# AI
// endpoints (chat streaming, providers, models), which the Node AI service
// does not serve. Flip to false once the product is migrated or removed.
// Typed as boolean (not literal true) so the code below stays reachable
// for the compiler and keeps typechecking.
const AI_ARBITER_TEMPORARILY_DISABLED: boolean = true;

export default async function AiArbiterServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (AI_ARBITER_TEMPORARILY_DISABLED) notFound();

  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value ?? "";

  const user = await getSelf();
  const userId = user?.id ?? null;

  let activePanel: ActivePanelSummary | null = null;
  if (userId) {
    const agents = await getAiAgents(userId);
    const picked = selectActivePanel(agents);
    if (picked) {
      activePanel = picked;
    }
  }

  const commonData: ArbiterCommonData = {
    activePanel,
    authToken,
    userId,
  };

  return <AiArbiterShell commonData={commonData}>{children}</AiArbiterShell>;
}
