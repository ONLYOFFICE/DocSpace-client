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

/**
 * The files of one conversation with an agent, which keeps them in two
 * folders of its own inside the agent: what its replies produced (the
 * artifacts) and what the user sent with the messages (the attachments).
 * The Files service lists both, as files, and only for the conversation's
 * author. A list is empty until the conversation has such a file.
 */

const threadFilesUrl = (
  projectId: number,
  threadId: string,
  kind: "artifacts" | "attachments",
) =>
  `/files/rooms/${projectId}/threads/${threadId}/${kind}?sortBy=DateAndTime&sortOrder=descending`;

/** The artifacts of a conversation, the newest first. */
export const getAiThreadArtifacts = async (
  projectId: number,
  threadId: string,
) =>
  ((await request({
    method: "GET",
    url: threadFilesUrl(projectId, threadId, "artifacts"),
  })) ?? []) as TFile[];

/** The files the user attached in a conversation, the newest first. */
export const getAiThreadAttachments = async (
  projectId: number,
  threadId: string,
) =>
  ((await request({
    method: "GET",
    url: threadFilesUrl(projectId, threadId, "attachments"),
  })) ?? []) as TFile[];
