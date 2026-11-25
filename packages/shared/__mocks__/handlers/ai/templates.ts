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

import { http, HttpResponse } from "msw";

import type {
  TAiAgentTemplate,
  TAiInstalledTemplate,
  TAiSourceTemplate,
  TAiTemplateCatalog,
} from "../../../api/ai/templates";
import { BASE_URL, API_PREFIX } from "../../e2e/utils";

/**
 * The template catalog of ASC.AI.Chat (`templates/`), cut to one agent of
 * each category with the skill set and knowledge base it brings. Every
 * template carries its room colour and built-in cover, as the shipped files
 * do.
 */
const skillSet = (
  name: string,
  title: string,
  category: string,
  color: string,
  cover: string,
  files: string[],
): TAiSourceTemplate => ({
  id: `skill-sets/${name}`,
  kind: "skillSet",
  name: title,
  description: `Skills of the ${title.toLowerCase()} set.`,
  category,
  color,
  cover,
  files,
});

const knowledgeBase = (
  name: string,
  title: string,
  category: string,
  color: string,
  cover: string,
  files: string[],
): TAiSourceTemplate => ({
  ...skillSet(name, title, category, color, cover, files),
  id: `knowledge-bases/${name}`,
  kind: "knowledgeBase",
  description: `Reference files of the ${title.toLowerCase()} base.`,
});

export const AI_TEMPLATE_SKILL_SETS: TAiSourceTemplate[] = [
  skillSet("budgeting", "Budgeting", "Tables", "61C059", "percent", [
    "budget-builder.md",
    "variance-analysis.md",
  ]),
  skillSet("contract-review", "Contract review", "Document", "6191F2", "clipboard", [
    "clause-risk-check.md",
    "version-compare.md",
  ]),
  skillSet("pitch-decks", "Pitch decks", "Presentation", "FF6680", "star", [
    "deck-outline.md",
  ]),
];

export const AI_TEMPLATE_KNOWLEDGE_BASES: TAiSourceTemplate[] = [
  knowledgeBase("budgeting-guide", "Budgeting guide", "Tables", "61C059", "suitcase", [
    "Budgeting guide.docx",
  ]),
  knowledgeBase(
    "contract-standards",
    "Contract standards",
    "Document",
    "6191F2",
    "book_open",
    ["Standard clauses.docx", "Review checklist.md"],
  ),
  knowledgeBase("pitch-deck-guide", "Pitch deck guide", "Presentation", "FF6680", "medal", [
    "Pitch deck guide.docx",
  ]),
];

export const AI_TEMPLATE_AGENTS: TAiAgentTemplate[] = [
  {
    id: "agents/document/contract-reviewer",
    kind: "agent",
    name: "Contract Reviewer",
    description:
      "Reviews contracts and agreements: flags risky clauses, missing terms and deviations from your standard wording.",
    category: "Document",
    color: "6191F2",
    cover: "shield",
    instructions: "You review contracts and agreements.",
    skills: ["skill-sets/contract-review"],
    knowledges: ["knowledge-bases/contract-standards"],
  },
  {
    id: "agents/presentation/pitch-deck-builder",
    kind: "agent",
    name: "Pitch Deck Builder",
    description: "Builds a pitch deck from your notes, one slide per point.",
    category: "Presentation",
    color: "FF6680",
    cover: "zap",
    instructions: "You build pitch decks.",
    skills: ["skill-sets/pitch-decks"],
    knowledges: ["knowledge-bases/pitch-deck-guide"],
  },
  {
    id: "agents/tables/budget-planner",
    kind: "agent",
    name: "Budget Planner",
    description: "Plans a budget in a spreadsheet and explains plan-versus-actual variance.",
    category: "Tables",
    color: "61C059",
    cover: "dollar",
    instructions: "You plan budgets.",
    skills: ["skill-sets/budgeting"],
    knowledges: ["knowledge-bases/budgeting-guide"],
  },
];

export const AI_TEMPLATE_CATALOG: TAiTemplateCatalog = {
  agents: AI_TEMPLATE_AGENTS,
  skillSets: AI_TEMPLATE_SKILL_SETS,
  knowledgeBases: AI_TEMPLATE_KNOWLEDGE_BASES,
};

/**
 * The built-in room covers the templates name (`GET files/rooms/covers`), as
 * plain squares: what a cover looks like does not matter to the specs.
 */
export const AI_TEMPLATE_COVERS = [
  ...AI_TEMPLATE_AGENTS,
  ...AI_TEMPLATE_SKILL_SETS,
  ...AI_TEMPLATE_KNOWLEDGE_BASES,
].map(({ cover }) => ({
  id: cover!,
  data: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" rx="3" fill="#fff"/></svg>',
}));

/** `GET files/rooms/covers`: the built-in room covers. */
export const roomCoversHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms/covers`, () =>
    HttpResponse.json({ response: AI_TEMPLATE_COVERS }),
  );

/** `GET ai/templates`: the catalog, answered bare as ASC.AI.Chat does. */
export const aiTemplatesHandler = (
  port: string,
  catalog: TAiTemplateCatalog = AI_TEMPLATE_CATALOG,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/templates`, () =>
    HttpResponse.json(catalog),
  );

let nextRoomId = 9000;

/**
 * `POST ai/templates/install`, as ASC.AI.Chat answers it: an agent with the
 * rooms made for its skill sets and knowledge bases, and the `warnings` of
 * what was skipped. By default it says `instructionsNotSaved`, since no route
 * of the portal stores an agent's instructions yet; a spec passes `[]` for a
 * clean installation, or `modelNotSaved` for a portal with no chat model. An
 * unknown id is answered 404 and a body with none 400, with `{ error }`.
 */
export const aiTemplateInstallHandler = (
  port: string,
  {
    catalog = AI_TEMPLATE_CATALOG,
    warnings = ["instructionsNotSaved"],
  }: { catalog?: TAiTemplateCatalog; warnings?: string[] } = {},
) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/ai/templates/install`,
    async ({ request }) => {
      const body = (await request.json().catch(() => null)) as {
        id?: unknown;
      } | null;
      const id = typeof body?.id === "string" ? body.id.trim() : "";
      if (!id) {
        return HttpResponse.json(
          { error: "id must be the id of a template" },
          { status: 400 },
        );
      }
      const sources = [...catalog.skillSets, ...catalog.knowledgeBases];
      const room = (template: { id: string; name: string }) => ({
        templateId: template.id,
        id: String(++nextRoomId),
        title: template.name,
      });
      const linked = (ids: string[]) =>
        ids
          .map((linkedId) => sources.find((source) => source.id === linkedId))
          .filter((source) => source !== undefined)
          .map(room);

      const agent = catalog.agents.find((template) => template.id === id);
      if (agent) {
        const skillSets = linked(agent.skills);
        const knowledgeBases = linked(agent.knowledges);
        const answer: TAiInstalledTemplate = {
          ...room(agent),
          kind: "agent",
          skillSets,
          knowledgeBases,
          warnings,
        };
        return HttpResponse.json(answer);
      }
      const source = sources.find((template) => template.id === id);
      if (!source) {
        return HttpResponse.json({ error: "Template not found" }, { status: 404 });
      }
      const answer: TAiInstalledTemplate = {
        ...room(source),
        kind: source.kind,
        skillSets: [],
        knowledgeBases: [],
        warnings: [],
      };
      return HttpResponse.json(answer);
    },
  );

/** The catalog, its installation and the room covers it is drawn with. */
export const aiTemplatesHandlers = (
  port: string,
  options?: Parameters<typeof aiTemplateInstallHandler>[1],
) => [
  aiTemplatesHandler(port, options?.catalog),
  aiTemplateInstallHandler(port, options),
  roomCoversHandler(port),
];
