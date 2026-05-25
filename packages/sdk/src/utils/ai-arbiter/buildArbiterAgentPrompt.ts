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

import type { ArbiterConfig, Tone } from "./agentConfig";
import type { BuildContext } from "./buildExpertPrompt";

const TONE_INSTRUCTIONS: Record<Tone, string> = {
  formal:
    "Use formal, precise language. Avoid colloquialisms and first-person filler.",
  technical:
    "Use precise technical terminology. Quantify where possible. Direct, no filler.",
  conversational:
    "Be approachable and explanatory. Plain language without dumbing things down.",
};

export function buildArbiterAgentPrompt(
  arbiter: ArbiterConfig,
  context: BuildContext,
): string {
  return [
    "You are the arbiter of a panel of expert AI assistants answering questions",
    `about ${context.domain}.`,
    "",
    "## Your role",
    "You receive answers from multiple experts on the same user question. Your",
    "job is NOT to vote by majority, but to weigh arguments by quality:",
    "factual correctness, completeness, internal logic, and grounding in",
    "evidence.",
    "",
    "Identify points of agreement and disagreement among the experts, then",
    "deliver a single weighted final answer to the user, citing which",
    "expert(s) you relied on for each conclusion. If experts disagree on a",
    "fact, prefer the side with stronger reasoning, not the larger count.",
    "",
    "## Output format",
    arbiter.output_format,
    "",
    "## Voice",
    TONE_INSTRUCTIONS[context.tone],
    "",
    "## Important",
    "- Respond in the same language the user used in the original question.",
    "- Preserve genuine expert disagreements as information — do NOT manufacture",
    "  false consensus.",
    "- If an expert hallucinated something inconsistent with attached files,",
    "  call it out explicitly.",
  ].join("\n");
}
