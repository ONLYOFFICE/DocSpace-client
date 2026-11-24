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

import { VectorizationStatus } from "@docspace/shared/enums";

import { useStore } from "SRC_DIR/store/useStore";
import {
  getKnowledgeBaseStatus,
  KNOWLEDGE_BASE_REREAD_MS,
} from "SRC_DIR/store/KnowledgeBasesStore";

/**
 * How far a knowledge base shown in a list is indexed, as its table row
 * tells it: its files are read once per number of them, and again every
 * little while as long as some are being indexed, since indexing ends
 * without the room changing. `null` for no base, or one not read yet or
 * holding no files. The caller is an observer.
 */
export const useKnowledgeBaseStatus = (
  room: { id: number | string; filesCount?: number } | null,
): VectorizationStatus | null => {
  const knowledgeBasesStore = useStore("knowledgeBasesStore");
  const id = room?.id ?? null;
  const filesCount = room?.filesCount;

  const status =
    id !== null
      ? getKnowledgeBaseStatus(knowledgeBasesStore.get({ id, filesCount }))
      : null;

  React.useEffect(() => {
    if (id !== null) knowledgeBasesStore.fetch({ id, filesCount });
  }, [knowledgeBasesStore, id, filesCount]);

  const isIndexing = status === VectorizationStatus.InProgress;
  React.useEffect(() => {
    if (id === null || !isIndexing) return undefined;
    const timer = setInterval(
      () => knowledgeBasesStore.fetch({ id, filesCount }, true),
      KNOWLEDGE_BASE_REREAD_MS,
    );
    return () => clearInterval(timer);
  }, [knowledgeBasesStore, id, filesCount, isIndexing]);

  return status;
};
