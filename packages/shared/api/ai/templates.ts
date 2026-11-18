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

import { authFetch } from "./index";

/**
 * The templates shipped with ASC.AI.Chat: agents, skill sets and knowledge
 * bases. A template's `id` is its path in the catalog. An agent names the
 * skill sets and knowledge bases it is linked to by their ids; each of those
 * is a template of its own. A template is drawn, and its rooms are created,
 * in its own colour and built-in room cover.
 */

export type TAiSourceTemplate = {
  id: string;
  kind: "skillSet" | "knowledgeBase";
  name: string;
  description: string;
  category: string;
  /** The room's colour, six hexadecimal digits without `#`; the rooms the template becomes take it. */
  color?: string;
  /** The id of the built-in room cover (`files/rooms/covers`) drawn in `color`. */
  cover?: string;
  /** The names of the files the template holds. */
  files: string[];
};

export type TAiAgentTemplate = {
  id: string;
  kind: "agent";
  name: string;
  description: string;
  category: string;
  /** The room's colour, six hexadecimal digits without `#`; the rooms the template becomes take it. */
  color?: string;
  /** The id of the built-in room cover (`files/rooms/covers`) drawn in `color`. */
  cover?: string;
  instructions: string;
  /** Ids of the skill set templates the agent is linked to. */
  skills: string[];
  /** Ids of the knowledge base templates the agent is linked to. */
  knowledges: string[];
};

export type TAiTemplate = TAiAgentTemplate | TAiSourceTemplate;

export type TAiTemplateCatalog = {
  agents: TAiAgentTemplate[];
  skillSets: TAiSourceTemplate[];
  knowledgeBases: TAiSourceTemplate[];
};

/** A room an installation made. */
export type TAiInstalledRoom = { templateId: string; id: string; title: string };

export type TAiInstalledTemplate = TAiInstalledRoom & {
  kind: TAiTemplate["kind"];
  skillSets: TAiInstalledRoom[];
  knowledgeBases: TAiInstalledRoom[];
  /** What was skipped: `modelNotSaved`, `instructionsNotSaved`. */
  warnings: string[];
};

const read = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(new Error(body?.error ?? response.statusText), {
      status: response.status,
    });
  }

  return body as T;
};

export const getAiTemplates = async () =>
  read<TAiTemplateCatalog>(await authFetch(`/api/2.0/ai/templates`));

/**
 * Installs a template into the portal as new rooms: a skill set, a knowledge
 * base, or an agent together with the skill sets and knowledge bases it is
 * linked to.
 */
export const installAiTemplate = async (id: string) =>
  read<TAiInstalledTemplate>(
    await authFetch(`/api/2.0/ai/templates/install`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }),
  );
