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

import { Trans } from "react-i18next";
import { TFunction } from "i18next";

import { Link, LinkTarget } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { TTranslation } from "@docspace/shared/types";
import { TFolder } from "@docspace/shared/api/files/types";

export const showSuccessExportRoomIndexToast = (
  t: TTranslation,
  fileName: string,
  fileUrl: string,
  openOnNewPage: boolean,
) => {
  const toastMessage = (
    <Trans
      t={t as TFunction}
      i18nKey="FileExportDestination"
      ns="Files"
      values={{ fileName, sectionName: t("Common:MyDocuments") }}
      components={{
        1: (
          <Link
            tag="a"
            href={fileUrl}
            target={openOnNewPage ? LinkTarget.blank : LinkTarget.self}
            color="accent"
          />
        ),
      }}
    />
  );

  toastr.success(toastMessage);
};

export const showSuccessCreateFolder = (
  t: TTranslation,
  item: TFolder,
  onOpenFolder: (item: TFolder & { isFolder: true }) => void,
) => {
  const toastMessage = (
    <Trans
      t={t as TFunction}
      i18nKey="FolderSuccessfullyCreated"
      ns="Files"
      values={{ folderTitle: item.title }}
      components={{
        1: (
          <Link
            tag="a"
            onClick={() => onOpenFolder({ ...item, isFolder: true })}
            target={LinkTarget.self}
            color="accent"
          />
        ),
      }}
    />
  );

  toastr.success(toastMessage);
};
