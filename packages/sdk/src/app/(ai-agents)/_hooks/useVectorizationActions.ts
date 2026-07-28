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

"use client";

import React from "react";

import { retryVectorization } from "@docspace/shared/api/ai";
import type { TFile } from "@docspace/shared/api/files/types";
import { VectorizationStatus } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import {
  useKnowledgeFilesStore,
  useResultFilesStore,
} from "../_store";

// SDK port of client `FilesActionsStore.retryVectorization` (and the
// per-file `FilesStore.updateFileVectorizationStatus`). Optimistically
// flips status to InProgress, calls the AI vectorization API, and
// reverts to Failed on error. Mirrors the client one-toast-on-failure
// pattern — no success toast (the row badge clears on its own).
//
// The optimistic flip touches whichever per-agent store currently owns
// the file. Knowledge is the only surface that exposes Vectorization
// today, but Result files share the same listing primitive, so we keep
// both stores in sync defensively.
export const useVectorizationActions = () => {
  const knowledgeStore = useKnowledgeFilesStore();
  const resultStore = useResultFilesStore();

  const flipStatus = React.useCallback(
    (fileId: TFile["id"], status: VectorizationStatus) => {
      knowledgeStore.updateFileVectorizationStatus(fileId, status);
      resultStore.updateFileVectorizationStatus(fileId, status);
    },
    [knowledgeStore, resultStore],
  );

  // Accept loose row shapes (TFile, TFolder, the union the row components
  // pass) — the only fields we read are `id` and `security?.Vectorization`,
  // so a narrow `TFile[]` signature would force every caller to cast. We
  // read security through an unknown-narrowing helper to avoid coupling to
  // either the file or the folder security shape (folders don't declare
  // Vectorization, so an intersection type would reject them).
  const retry = React.useCallback(
    async (files: ReadonlyArray<{ id: TFile["id"]; security?: unknown }>) => {
      const hasVectorizationAccess = (security: unknown) =>
        !!security &&
        typeof security === "object" &&
        "Vectorization" in security &&
        Boolean(
          (security as { Vectorization?: unknown }).Vectorization,
        );

      // Server enforces `security.Vectorization` as the retry permission;
      // mirror the client filter so we don't fire a doomed POST and don't
      // flip rows the user can't actually retry.
      const eligible = files.filter((file) =>
        hasVectorizationAccess(file.security),
      );
      if (eligible.length === 0) return;

      const fileIds = eligible.map((file) => file.id);

      try {
        fileIds.forEach((id) =>
          flipStatus(id, VectorizationStatus.InProgress),
        );
        await retryVectorization(fileIds);
      } catch (e) {
        fileIds.forEach((id) =>
          flipStatus(id, VectorizationStatus.Failed),
        );
        toastr.error(e instanceof Error ? e.message : String(e));
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [flipStatus],
  );

  return { retry };
};

export default useVectorizationActions;
