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

import { type AgentConfig, validateAgentConfig } from "./agentConfig";

export type ExtractResult =
  | { ok: true; config: AgentConfig }
  | {
      ok: false;
      reason: "no_json_block" | "parse_failed" | "validation_failed";
      details?: string;
    };

export function extractWizardConfig(text: string): ExtractResult {
  const raw = matchFencedJson(text) ?? matchOutermostObject(text);
  if (!raw) return { ok: false, reason: "no_json_block" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      ok: false,
      reason: "parse_failed",
      details: e instanceof Error ? e.message : String(e),
    };
  }

  const result = validateAgentConfig(parsed);
  if (!result.ok) {
    const details = result.issues
      .map((i) => `${i.path || "root"}: ${i.message}`)
      .join("; ");
    return { ok: false, reason: "validation_failed", details };
  }

  return { ok: true, config: result.value };
}

function matchFencedJson(text: string): string | null {
  const explicit = text.match(/```json\s*\n?([\s\S]*?)```/);
  if (explicit && explicit[1].trim()) return explicit[1].trim();

  const bare = text.match(/```\s*\n([\s\S]*?)```/);
  if (bare && bare[1].trim().startsWith("{")) return bare[1].trim();

  return null;
}

function matchOutermostObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
