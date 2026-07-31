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

import { WebhookTriggers } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";

export const getTriggerTranslate = (trigger: number, t: TTranslation) => {
  switch (trigger) {
    case WebhookTriggers.UserCreated:
      return t("UserCreated");
    case WebhookTriggers.UserInvited:
      return t("UserInvited");
    case WebhookTriggers.UserUpdated:
      return t("UserUpdated");
    case WebhookTriggers.UserDeleted:
      return t("UserDeleted");
    case WebhookTriggers.GroupCreated:
      return t("GroupCreated");
    case WebhookTriggers.GroupUpdated:
      return t("GroupUpdated");
    case WebhookTriggers.GroupDeleted:
      return t("GroupDeleted");
    case WebhookTriggers.FileCreated:
      return t("FileCreated");
    case WebhookTriggers.FileUploaded:
      return t("FileUploaded");
    case WebhookTriggers.FileUpdated:
      return t("FileUpdated");
    case WebhookTriggers.FileTrashed:
      return t("FileTrashed");
    case WebhookTriggers.FileDeleted:
      return t("FileDeleted");
    case WebhookTriggers.FileRestored:
      return t("FileRestored");
    case WebhookTriggers.FileCopied:
      return t("FileCopied");
    case WebhookTriggers.FileMoved:
      return t("FileMoved");
    case WebhookTriggers.FolderCreated:
      return t("FolderCreated");
    case WebhookTriggers.FolderUpdated:
      return t("FolderUpdated");
    case WebhookTriggers.FolderTrashed:
      return t("FolderTrashed");
    case WebhookTriggers.FolderDeleted:
      return t("FolderDeleted");
    case WebhookTriggers.FolderRestored:
      return t("FolderRestored");
    case WebhookTriggers.FolderCopied:
      return t("FolderCopied");
    case WebhookTriggers.FolderMoved:
      return t("FolderMoved");
    case WebhookTriggers.RoomCreated:
      return t("Files:RoomCreated");
    case WebhookTriggers.RoomUpdated:
      return t("RoomUpdated");
    case WebhookTriggers.RoomArchived:
      return t("RoomArchived");
    case WebhookTriggers.RoomDeleted:
      return t("RoomDeleted");
    case WebhookTriggers.RoomRestored:
      return t("RoomRestored");
    case WebhookTriggers.RoomCopied:
      return t("RoomCopied");
    case WebhookTriggers.FormFilledOut:
      return t("FormFilledOut");
    case WebhookTriggers.FormStopped:
      return t("FormStopped");
    case WebhookTriggers.FormSubmit:
      return t("FormSubmit");
    case WebhookTriggers.AgentCreated:
      return t("AgentCreated");
    case WebhookTriggers.AgentUpdated:
      return t("AgentUpdated");
    case WebhookTriggers.AgentDeleted:
      return t("AgentDeleted");
    case WebhookTriggers.FileDownloaded:
      return t("FileDownloaded");
    case WebhookTriggers.FolderDownloaded:
      return t("FolderDownloaded");
    default:
      return "";
  }
};

export function validateUrl(url: string) {
  return URL.canParse(url);
}

