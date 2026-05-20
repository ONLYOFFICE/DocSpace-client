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

import type { AttachedFile } from "@/types/arbiter";

const ARBITER_SYSTEM_HINT = `\
You are the arbiter of a panel of expert AI assistants.
Your job is NOT to vote by majority, but to weigh arguments by quality: \
factual correctness, completeness, internal logic, and grounding in evidence.
You must explicitly identify points of agreement and disagreement among the \
experts, then deliver a single weighted final answer to the user, citing which \
expert(s) you relied on for each conclusion. If experts disagree on a fact, \
prefer the side with stronger reasoning, not the larger count.`;

export type ExpertAnswer = {
  alias: string;
  modelAlias: string;
  text: string;
  errored?: boolean;
};

export function buildArbiterPrompt(
  question: string,
  expertAnswers: ExpertAnswer[],
  attachedFile?: AttachedFile,
): string {
  const usable = expertAnswers.filter((a) => !a.errored);
  const total = expertAnswers.length;

  const fileSection = attachedFile
    ? `\n\n## Attached file\n\
The user attached the file **${attachedFile.name}** to this run. Every expert \
above received the same file; the file is also attached to this prompt so \
you can verify their claims against the source. When you weigh expert \
answers, prefer the ones that are clearly grounded in the file's contents \
over those that contradict or ignore the file. If an expert hallucinated \
something not supported by the file, call it out explicitly.`
    : "";

  const expertSections = expertAnswers
    .map((a) => {
      const label = a.errored
        ? `### Expert "${a.alias}" (${a.modelAlias}) [FAILED]`
        : `### Expert "${a.alias}" (${a.modelAlias})`;
      return `${label}\n${a.text || "(no answer)"}`;
    })
    .join("\n\n");

  const fileTask = attachedFile
    ? `\n5. Verify factual claims against the attached file (${attachedFile.name}). \
Flag any expert claim that contradicts the file.`
    : "";

  return `${ARBITER_SYSTEM_HINT}

## Original user question
${question}${fileSection}

## Expert responses (${usable.length}/${total} usable)
${expertSections}

## Your task
1. Briefly summarise where the experts agree.
2. List points of disagreement and explain which side has the stronger argument and why.
3. Output a final answer that weights expert claims by argument quality (not by count).
4. Mark any open questions you could not resolve.${fileTask}

Respond in the same language the user used in the question.`;
}
