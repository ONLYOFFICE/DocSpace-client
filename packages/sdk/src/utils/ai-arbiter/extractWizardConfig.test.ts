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

import { describe, it, expect } from "vitest";

import type { AgentConfig } from "./agentConfig";
import { extractWizardConfig } from "./extractWizardConfig";

const validConfig: AgentConfig = {
  domain: "Software architecture",
  use_case:
    "Help engineering teams evaluate architectural patterns and trade-offs.",
  tone: "technical",
  experts: [
    {
      role_title: "Distributed Systems Specialist",
      domain_expertise: ["consensus", "replication", "fault tolerance"],
      primary_responsibility:
        "Analyse distributed-system trade-offs around consistency and availability.",
      scope_exclusions: ["UI design", "frontend frameworks"],
      reasoning_style: "Quantify failure modes; cite established theorems.",
      output_format: "Lead with the trade-off, then the supporting reasoning.",
    },
    {
      role_title: "Performance Architect",
      domain_expertise: ["profiling", "latency budgets", "throughput"],
      primary_responsibility:
        "Identify performance bottlenecks and reason about scaling strategies.",
      scope_exclusions: [
        "distributed consensus",
        "team-process and organisational concerns",
      ],
      reasoning_style: "Work in concrete numbers; reference benchmarks.",
      output_format: "Stepwise analysis with measured/expected metrics.",
    },
  ],
  arbiter: {
    output_format:
      "Summarise consensus, then unresolved disagreements, then final recommendation.",
  },
};

const validJson = JSON.stringify(validConfig);

describe("extractWizardConfig", () => {
  it("extracts a fenced ```json block", () => {
    const text = `Sure, here you go:\n\n\`\`\`json\n${validJson}\n\`\`\`\n`;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.config.domain).toBe("Software architecture");
  });

  it("falls back to a bare ``` fence when content starts with {", () => {
    const text = `\`\`\`\n${validJson}\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(true);
  });

  it("ignores ``` blocks for other languages", () => {
    const text = `\`\`\`python\nprint("hello")\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("no_json_block");
  });

  it("falls back to a balanced { ... } scan when no fence is present", () => {
    const text = `Here is the result: ${validJson} that's all.`;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(true);
  });

  it("handles braces inside JSON string values", () => {
    const config = {
      ...validConfig,
      use_case: "Answer questions like 'what is {x} for {y}?'",
    };
    const text = `prefix ${JSON.stringify(config)} suffix`;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(true);
  });

  it("returns no_json_block when no JSON is found", () => {
    const result = extractWizardConfig("Just some prose, no config here.");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("no_json_block");
  });

  it("returns parse_failed for malformed JSON", () => {
    const text = "```json\n{ broken: , }\n```";
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("parse_failed");
  });

  it("returns validation_failed for missing required fields", () => {
    const text = `\`\`\`json\n{ "domain": "x" }\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("validation_failed");
      expect(result.details).toContain("use_case");
    }
  });

  it("rejects too few experts", () => {
    const config: AgentConfig = { ...validConfig, experts: [validConfig.experts[0]] };
    const text = `\`\`\`json\n${JSON.stringify(config)}\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("validation_failed");
      expect(result.details).toContain("experts");
    }
  });

  it("rejects an invalid tone value", () => {
    const config = { ...validConfig, tone: "snarky" };
    const text = `\`\`\`json\n${JSON.stringify(config)}\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("validation_failed");
      expect(result.details).toContain("tone");
    }
  });

  it("reports nested path on per-expert validation errors", () => {
    const config: AgentConfig = {
      ...validConfig,
      experts: [
        { ...validConfig.experts[0], role_title: "" },
        validConfig.experts[1],
      ],
    };
    const text = `\`\`\`json\n${JSON.stringify(config)}\n\`\`\``;
    const result = extractWizardConfig(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.details).toContain("experts[0].role_title");
  });
});
