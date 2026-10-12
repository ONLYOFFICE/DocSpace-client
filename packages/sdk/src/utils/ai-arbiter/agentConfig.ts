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

export const TONES = ["formal", "technical", "conversational"] as const;
export type Tone = (typeof TONES)[number];

export type ExpertConfig = {
  role_title: string;
  domain_expertise: string[];
  primary_responsibility: string;
  scope_exclusions: string[];
  reasoning_style: string;
  output_format: string;
  model?: string;
};

export type ArbiterConfig = {
  output_format: string;
  model?: string;
};

export type AgentConfig = {
  domain: string;
  use_case: string;
  tone: Tone;
  experts: ExpertConfig[];
  arbiter: ArbiterConfig;
};

export type ValidationIssue = { path: string; message: string };

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

type StringOpts = { min?: number; max?: number };
type ArrayOpts = {
  min?: number;
  max?: number;
  itemMin?: number;
  itemMax?: number;
};

class V {
  issues: ValidationIssue[] = [];

  err(path: string, message: string) {
    this.issues.push({ path, message });
  }

  str(value: unknown, path: string, opts: StringOpts = {}): value is string {
    if (typeof value !== "string") {
      this.err(path, `expected string, got ${typeOf(value)}`);
      return false;
    }
    const len = value.trim().length;
    if (opts.min != null && len < opts.min) {
      this.err(path, `must be at least ${opts.min} characters (got ${len})`);
      return false;
    }
    if (opts.max != null && len > opts.max) {
      this.err(path, `must be at most ${opts.max} characters (got ${len})`);
      return false;
    }
    return true;
  }

  strArr(
    value: unknown,
    path: string,
    opts: ArrayOpts = {},
  ): value is string[] {
    if (!Array.isArray(value)) {
      this.err(path, `expected array, got ${typeOf(value)}`);
      return false;
    }
    if (opts.min != null && value.length < opts.min) {
      this.err(path, `must have at least ${opts.min} items (got ${value.length})`);
    }
    if (opts.max != null && value.length > opts.max) {
      this.err(path, `must have at most ${opts.max} items (got ${value.length})`);
    }
    let ok = true;
    value.forEach((item, i) => {
      if (!this.str(item, `${path}[${i}]`, { min: opts.itemMin, max: opts.itemMax })) {
        ok = false;
      }
    });
    return ok;
  }

  enumOf<T extends string>(
    value: unknown,
    path: string,
    allowed: readonly T[],
  ): value is T {
    if (typeof value !== "string" || !allowed.includes(value as T)) {
      this.err(path, `must be one of: ${allowed.join(", ")}`);
      return false;
    }
    return true;
  }

  obj(value: unknown, path: string): value is Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      this.err(path, `expected object, got ${typeOf(value)}`);
      return false;
    }
    return true;
  }
}

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

const MIN_EXPERTS = 2;
const MAX_EXPERTS = 7;

function validateExpert(v: V, raw: unknown, path: string) {
  if (!v.obj(raw, path)) return;
  v.str(raw.role_title, `${path}.role_title`, { min: 2, max: 150 });
  v.strArr(raw.domain_expertise, `${path}.domain_expertise`, {
    min: 1,
    max: 8,
    itemMin: 1,
  });
  v.str(raw.primary_responsibility, `${path}.primary_responsibility`, {
    min: 10,
    max: 1500,
  });
  v.strArr(raw.scope_exclusions, `${path}.scope_exclusions`, {
    min: 1,
    max: 5,
    itemMin: 1,
  });
  v.str(raw.reasoning_style, `${path}.reasoning_style`, { min: 5, max: 1000 });
  v.str(raw.output_format, `${path}.output_format`, { min: 5, max: 1000 });
  if (raw.model !== undefined) {
    v.str(raw.model, `${path}.model`, { min: 1, max: 200 });
  }
}

export function validateAgentConfig(
  input: unknown,
): ValidationResult<AgentConfig> {
  const v = new V();
  if (!v.obj(input, "")) {
    return { ok: false, issues: v.issues };
  }

  v.str(input.domain, "domain", { min: 2, max: 300 });
  v.str(input.use_case, "use_case", { min: 10, max: 1000 });
  v.enumOf(input.tone, "tone", TONES);

  if (!Array.isArray(input.experts)) {
    v.err("experts", `expected array, got ${typeOf(input.experts)}`);
  } else {
    if (input.experts.length < MIN_EXPERTS) {
      v.err("experts", `must have at least ${MIN_EXPERTS} experts`);
    }
    if (input.experts.length > MAX_EXPERTS) {
      v.err("experts", `must have at most ${MAX_EXPERTS} experts`);
    }
    input.experts.forEach((e, i) => validateExpert(v, e, `experts[${i}]`));
  }

  if (v.obj(input.arbiter, "arbiter")) {
    if (input.arbiter.model !== undefined) {
      v.str(input.arbiter.model, "arbiter.model", { min: 1, max: 200 });
    }
    v.str(input.arbiter.output_format, "arbiter.output_format", {
      min: 5,
      max: 1000,
    });
  }

  return v.issues.length === 0
    ? { ok: true, value: input as AgentConfig }
    : { ok: false, issues: v.issues };
}
