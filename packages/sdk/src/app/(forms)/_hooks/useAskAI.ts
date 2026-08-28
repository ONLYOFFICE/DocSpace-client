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

"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { useOpenAiChat } from "@docspace/ui-kit/ai-agent/ai-chat-panel";
import {
  useAttachHostFilesToChat,
  notifyAlreadyAttached,
  notifyAttachmentLimit,
} from "@docspace/ui-kit/ai-agent/providers/files";
import type { TFile } from "@docspace/shared/api/files/types";

export default function useAskAI() {
  const { t } = useTranslation(["Common"]);
  const attachToChat = useAttachHostFilesToChat();
  const openChat = useOpenAiChat();

  return useCallback(
    (file: TFile) => {
      openChat();

      // The shared hook owns the whole attach contract — duplicate filter,
      // attachment cap, loading chip, image bucket — so this action only has
      // to report what it left out.
      attachToChat([
        {
          id: file.id,
          title: file.title,
          fileExst: file.fileExst,
          fileType: file.fileType,
          // Carry the form metadata: the hook reads it to decide whether
          // the chat offers the form-specific hints.
          isForm: file.isForm,
          externalDbTableName: file.externalDbTableName,
        },
      ])
        .then(({ duplicates, skippedOverLimit }) => {
          notifyAlreadyAttached(t, duplicates);
          notifyAttachmentLimit(t, skippedOverLimit);
        })
        .catch((e: unknown) => toastr.error(e as string));
    },
    [openChat, attachToChat, t],
  );
}
