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

import { request } from "../client";
import type { TFile } from "../files/types";
import { authFetch } from "./index";

/**
 * The files of one conversation with an agent. What its replies produced
 * (the artifacts) is kept in the conversation's own folder inside the agent
 * and listed by the Files service. What the user attached is listed by the
 * AI service from the conversation's messages: an attachment is a file
 * wherever it already is. Both answer files as the Files service describes
 * them, and only for the conversation's author.
 */

/** The artifacts of a conversation, the newest first; empty while it has produced none. */
export const getAiThreadArtifacts = async (
  projectId: number,
  threadId: string,
) =>
  ((await request({
    method: "GET",
    url: `/files/rooms/${projectId}/threads/${threadId}/artifacts?sortBy=DateAndTime&sortOrder=descending`,
  })) ?? []) as TFile[];

/** The files the user attached in a conversation, in the order they were first attached. */
export const getAiThreadAttachments = async (threadId: string) => {
  const response = await authFetch(
    `/api/2.0/ai/threads/attachments?threadId=${encodeURIComponent(threadId)}`,
  );
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(new Error(body?.error ?? response.statusText), {
      status: response.status,
    });
  }

  return (Array.isArray(body) ? body : []) as TFile[];
};
