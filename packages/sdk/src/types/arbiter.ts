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

export type AgentSummary = {
  id: number;
  title: string;
  modelAlias: string;
  modelId: string;
  prompt: string;
  providerId: number;
};

export type PanelStatus =
  | "idle"
  | "streaming"
  | "done"
  | "error"
  | "aborted";

export type PanelState = {
  panelId: string;
  agentId: number;
  alias: string;
  modelAlias: string;
  status: PanelStatus;
  streamingText: string;
  reasoningText: string;
  finalText: string;
  chatId?: string;
  error?: string;
  toolCalls: { name: string; callId: string }[];
};

export type AttachedFile = {
  id: number;
  name: string;
};

export type SseEvent =
  | { type: "message_start"; chatId: string; error?: string | null }
  | { type: "new_token"; text: string }
  | { type: "reasoning"; text: string }
  | {
      type: "tool_call";
      callId: string;
      name: string;
      arguments: unknown;
      managed?: boolean;
    }
  | { type: "tool_result"; callId: string; result: unknown }
  | { type: "message_stop"; messageId: number }
  | {
      type: "error";
      message: string;
      errorCode?: string;
      details?: unknown;
    };

export type ArbiterCommonData = {
  agents: AgentSummary[];
  authToken: string;
};

export const ARBITER_PANEL_ID = "arbiter";
export const MAX_EXPERTS = 12;
export const ARBITER_SELECTION_KEY = "aiarbiter-selection";
export const ARBITER_PENDING_FILE_KEY = "aiarbiter-pending-file";
