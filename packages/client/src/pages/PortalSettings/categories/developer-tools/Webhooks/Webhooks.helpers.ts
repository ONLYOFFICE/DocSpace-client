// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
    default:
      return "";
  }
};
