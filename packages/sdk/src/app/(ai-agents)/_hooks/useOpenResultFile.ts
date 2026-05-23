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

"use client";

import React from "react";
import { useRouter } from "next/navigation";

import {
  useAiRoomStore,
  useAgentLoadingStore,
} from "../_store";

/**
 * Port of the `openResultFile` callback from client Shell.jsx: switches the
 * AI room to the Result Storage tab, selects the file, navigates with proper
 * query params and primes the section-body loader.
 */
export const useOpenResultFile = () => {
  const aiRoomStore = useAiRoomStore();
  const loadingStore = useAgentLoadingStore();
  const router = useRouter();

  return React.useCallback(
    (fileId: number | string) => {
      const roomId = aiRoomStore.roomId;
      if (!roomId) return;

      aiRoomStore.setCurrentTab("result");
      aiRoomStore.setSelectedResultFileId(Number(fileId));
      loadingStore.setIsSectionBodyLoading(true);

      const params = new URLSearchParams();
      params.set("tab", "result");
      params.set("fileId", String(fileId));
      router.push(`/ai-agents/${roomId}?${params.toString()}`);
    },
    [aiRoomStore, loadingStore, router],
  );
};

export default useOpenResultFile;
