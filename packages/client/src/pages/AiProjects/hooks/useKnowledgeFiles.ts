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

import React from "react";

import { getFolder } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import { VectorizationStatus } from "@docspace/shared/enums";

export type TKnowledgeFile = {
  id: number | string;
  title: string;
  fileExst: string;
  status: VectorizationStatus | null;
};

// The knowledge column shows the room's first page; a room larger than this
// is still searched in full, only its list is cut.
const KNOWLEDGE_PAGE_COUNT = 100;

// While a file is still being indexed the list is read again at this pace,
// so its status settles without a reload.
const INDEXING_POLL_MS = 5000;

/**
 * The files of a knowledge room with their indexing state, for the project
 * view's knowledge card. `null` room: no list. A failed read leaves an
 * empty list rather than an error: the card is informational.
 */
export const useKnowledgeFiles = (roomId: string | null) => {
  const [files, setFiles] = React.useState<TKnowledgeFile[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!roomId) {
      setFiles([]);
      setTotal(0);
      return undefined;
    }

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    const load = async (first: boolean) => {
      if (first) setIsLoading(true);
      try {
        const filter = FilesFilter.getDefault({
          pageCount: KNOWLEDGE_PAGE_COUNT,
        });
        const data = await getFolder(roomId, filter, controller.signal);
        if (disposed) return;
        const next = data.files.map((file) => ({
          id: file.id,
          title: file.title,
          fileExst: file.fileExst,
          status:
            "vectorizationStatus" in file &&
            typeof file.vectorizationStatus === "number"
              ? (file.vectorizationStatus as VectorizationStatus)
              : null,
        }));
        setFiles(next);
        setTotal(data.total ?? next.length);
        if (next.some((file) => file.status === VectorizationStatus.InProgress)) {
          timer = setTimeout(() => void load(false), INDEXING_POLL_MS);
        }
      } catch {
        if (!disposed && first) {
          setFiles([]);
          setTotal(0);
        }
      } finally {
        if (!disposed && first) setIsLoading(false);
      }
    };

    void load(true);

    return () => {
      disposed = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [roomId]);

  const indexed = files.filter(
    (file) => file.status === VectorizationStatus.Completed,
  ).length;

  return { files, total, indexed, isLoading };
};
