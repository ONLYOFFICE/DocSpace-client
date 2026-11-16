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

import { parseSkillFile, type TSkillFile } from "@docspace/shared/utils/skillFile";

type TSkillSource = {
  id: number | string;
  version?: number;
  viewUrl?: string;
};

/** Reads the text of a skill file with the caller's session. */
const readText = async (viewUrl: string) => {
  const response = await fetch(viewUrl);
  if (!response.ok) throw new Error(response.statusText);
  return response.text();
};

/**
 * What the skill files say of themselves: the `name`, `description` and
 * instructions of each. A file's list entry carries none of it, so its text
 * is read once per version, when the list or the Info panel first asks, and
 * kept for both.
 */
class SkillsStore {
  /** The skills read so far, by file id and version. */
  skills: Record<string, TSkillFile> = {};

  /** The reads in flight and the ones that failed: neither is started again. */
  private requests = new Set<string>();

  constructor() {
    makeAutoObservable(this, { requests: false } as never);
  }

  private static key = ({ id, version }: TSkillSource) => `${id}:${version ?? 0}`;

  /** The skill of a file when it has been read; `null` until then. */
  get = (file: TSkillSource): TSkillFile | null =>
    this.skills[SkillsStore.key(file)] ?? null;

  /** Reads the file's skill unless it is read, being read or could not be. */
  fetch = (file: TSkillSource): void => {
    const key = SkillsStore.key(file);
    if (!file.viewUrl || this.skills[key] || this.requests.has(key)) return;
    this.requests.add(key);
    readText(file.viewUrl)
      .then((text) => {
        runInAction(() => {
          this.skills[key] = parseSkillFile(text);
        });
      })
      // A file that cannot be read keeps its row without a description.
      .catch(() => undefined);
  };
}

export default SkillsStore;
