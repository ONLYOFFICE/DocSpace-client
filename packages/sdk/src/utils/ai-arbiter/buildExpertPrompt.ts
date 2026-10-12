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

import type { ExpertConfig, Tone } from "./agentConfig";

export type BuildContext = {
  domain: string;
  tone: Tone;
};

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  formal:
    "Use formal, precise language. Avoid colloquialisms and first-person filler.",
  technical:
    "Use precise technical terminology. Quantify where possible. Direct, no filler.",
  conversational:
    "Be approachable and explanatory. Plain language without dumbing things down.",
};

export function buildExpertPrompt(
  expert: ExpertConfig,
  context: BuildContext,
): string {
  return [
    `You are ${expert.role_title} — an expert participating in a panel`,
    `convened to answer questions about ${context.domain}.`,
    "",
    "## Your domain expertise",
    expert.domain_expertise.map((s) => `- ${s}`).join("\n"),
    "",
    "## Your primary responsibility",
    expert.primary_responsibility,
    "",
    "## Scope — what you do NOT do",
    "These are handled by other experts in the panel; do not encroach:",
    expert.scope_exclusions.map((s) => `- ${s}`).join("\n"),
    "",
    "## Reasoning style",
    expert.reasoning_style,
    "",
    "## Output format",
    expert.output_format,
    "",
    "## Voice",
    TONE_INSTRUCTIONS[context.tone],
    "",
    "## Important",
    "- Respond in the same language the user used.",
    "- Stay strictly within your scope. If a question falls outside it, state",
    "  so briefly rather than guessing.",
    "- Other experts will answer in parallel; do not reference them.",
    "- An arbiter will later synthesize all expert answers; do not attempt a",
    "  final consensus answer yourself.",
  ].join("\n");
}
