/*
 * (c) Copyright Ascensio System SIA 2009-2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

const MODEL_NAME_MAP: Record<string, string> = {
  // xAI
  "x-ai/grok-4": "Grok 4",
  "x-ai/grok-4.1-fast": "Grok 4.1 Fast",
  "grok-4-1-fast-reasoning": "Grok 4.1 Fast Reasoning",
  "grok-4-1-fast-non-reasoning": "Grok 4.1 Fast",

  // DeepSeek
  "deepseek-chat": "DeepSeek Chat",
  "deepseek-reasoner": "DeepSeek Reasoner",
  "deepseek-ai/DeepSeek-V3.1": "DeepSeek V3.1",
  "deepseek/deepseek-v3.1-terminus": "DeepSeek V3.1",

  // Qwen
  "Qwen/Qwen3-235B-A22B-fp8-tput": "Qwen 3",
  "qwen/qwen3-max": "Qwen 3 Max",
};

const PARTIAL_MATCHES: [string, string][] = [
  ["gpt-5.2", "GPT-5.2"],
  ["claude-haiku", "Claude Haiku 4.5"],
  ["claude-sonnet", "Claude Sonnet 4.5"],
  ["claude-opus", "Claude Opus 4.5"],
  ["gemini-3-pro-preview", "Gemini 3 Pro"],
  ["gemini-3-flash-preview", "Gemini 3 Flash"],
];

export const getAiModelName = (id: string): string =>
  MODEL_NAME_MAP[id] ??
  PARTIAL_MATCHES.find(([p]) => id.includes(p))?.[1] ??
  id;
