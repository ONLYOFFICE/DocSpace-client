// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

import { getAIAgents, getAIConfig } from "@/api/ai";

import AgentsListPage from "./page.client";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AgentsList({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const initialSearch = sp.search ?? "";

  // Build the same RoomsFilter the client used to build (see useEffect in
  // page.client.tsx) — keeps SSR + post-hydration in sync so the first
  // socket-driven refetch on the client doesn't change the result set.
  const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AIAgents);
  if (initialSearch) filter.filterValue = initialSearch;

  const [agentsData, aiConfig] = await Promise.all([
    getAIAgents(filter),
    getAIConfig(),
  ]);

  return (
    <AgentsListPage
      initialSearch={initialSearch}
      initialAgents={agentsData?.folders ?? []}
      initialTotal={agentsData?.total ?? 0}
      initialRootFolderId={agentsData?.current?.id ?? null}
      initialAIConfig={aiConfig ?? null}
    />
  );
}
