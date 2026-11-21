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

import { makeAutoObservable, runInAction } from "mobx";

import { getAiProjectKnowledgeFiles } from "@docspace/shared/api/ai/projects";
import { VectorizationStatus } from "@docspace/shared/enums";

type TKnowledgeBaseSource = {
  id: number | string;
  filesCount?: number;
};

/** How far the files of a knowledge base are indexed. */
export type TKnowledgeBaseState = {
  total: number;
  inProgress: number;
  failed: number;
};

/**
 * The state of a knowledge base as a whole: `Failed` when a file could not
 * be indexed, `InProgress` while one still is, `Completed` otherwise.
 * `null` for a base that was not read yet or holds no files.
 */
export const getKnowledgeBaseStatus = (
  state: TKnowledgeBaseState | null,
): VectorizationStatus | null => {
  if (!state || state.total === 0) return null;
  if (state.failed > 0) return VectorizationStatus.Failed;
  if (state.inProgress > 0) return VectorizationStatus.InProgress;
  return VectorizationStatus.Completed;
};

/** How often a base shown while its files are indexed is read again. */
export const KNOWLEDGE_BASE_REREAD_MS = 10_000;

/**
 * How far each knowledge base of the list is indexed. A room's list entry
 * does not say it, so the files of the room are read: once per number of
 * its files when a row first asks, again when the Info panel shows the
 * base, and every `KNOWLEDGE_BASE_REREAD_MS` while a shown base is indexed.
 */
class KnowledgeBasesStore {
  /** The bases read so far, by room id and number of files. */
  states: Record<string, TKnowledgeBaseState> = {};

  /** The reads in flight: one is not started twice. */
  private requests = new Set<string>();

  constructor() {
    makeAutoObservable(this, { requests: false } as never);
  }

  private static key = ({ id, filesCount }: TKnowledgeBaseSource) =>
    `${id}:${filesCount ?? 0}`;

  /** The state of a base when it has been read; `null` until then. */
  get = (room: TKnowledgeBaseSource): TKnowledgeBaseState | null =>
    this.states[KnowledgeBasesStore.key(room)] ?? null;

  /**
   * Reads the base's files unless they are read, being read or could not
   * be. `force` reads them again: indexing ends without the room changing.
   */
  fetch = (room: TKnowledgeBaseSource, force = false): void => {
    const key = KnowledgeBasesStore.key(room);
    if (this.requests.has(key)) return;
    if (!force && this.states[key]) return;
    this.requests.add(key);
    getAiProjectKnowledgeFiles(Number(room.id))
      .then((files) => {
        const count = (status: VectorizationStatus) =>
          files.filter((file) => file.vectorizationStatus === status).length;
        runInAction(() => {
          this.states[key] = {
            total: files.length,
            inProgress: count(VectorizationStatus.InProgress),
            failed: count(VectorizationStatus.Failed),
          };
        });
      })
      // A base that cannot be read keeps its row without a status, until
      // it is asked for again.
      .catch(() => undefined)
      .finally(() => {
        this.requests.delete(key);
      });
  };
}

export default KnowledgeBasesStore;
