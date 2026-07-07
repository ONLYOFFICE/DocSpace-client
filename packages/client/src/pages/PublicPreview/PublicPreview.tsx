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

import React from "react";
import { useTranslation } from "react-i18next";
import { match } from "ts-pattern";
import { useLoaderData, useRevalidator } from "react-router";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { ValidationStatus } from "@docspace/shared/enums";
import { PublicRoomPasswordForm } from "@docspace/shared/pages/PublicRoom";
import useFilesSettings from "@docspace/ui-kit/selectors/utils/hooks/useFilesSettings";
import type { FilesSettingsDto } from "@docspace/ui-kit/selectors/Files/FilesSelector.types";

import PublicPreviewViewer from "./PublicPreview.viewer";
import type { PublicPreviewLoaderProps } from "./PublicPreview.types";

export const PublicPreview = () => {
  const { t } = useTranslation();
  const revalidator = useRevalidator();
  const { validateData, key, settings } =
    useLoaderData<PublicPreviewLoaderProps>();

  const { getIcon } = useFilesSettings(
    undefined,
    settings as unknown as FilesSettingsDto,
  );

  const onSuccessValidation = () => {
    revalidator.revalidate();
  };

  const getIconString = (size: number, fileExst: string) => {
    const icon = getIcon(fileExst, size);
    return typeof icon === "string" ? icon : "";
  };

  const getIconByExst = (fileExst: string) => getIconString(32, fileExst);

  return match(validateData?.status)
    .with(ValidationStatus.Ok, () => (
      <PublicPreviewViewer
        getIcon={getIconString}
        extsImagePreviewed={settings.extsImagePreviewed}
      />
    ))
    .with(ValidationStatus.ExternalAccessDenied, () => {
      if (typeof window === "undefined") return;

      const pathName = window.location.pathname;
      const searchName = window.location.search;

      window.location.href = combineUrl(
        window.ClientConfig?.proxy?.url,
        "/login",
        `?referenceUrl=${pathName}${searchName}`,
      );
    })
    .with(ValidationStatus.Password, () => (
      <PublicRoomPasswordForm
        t={t}
        roomKey={key}
        getIcon={getIconByExst}
        validationData={validateData}
        onSuccessValidationCallback={onSuccessValidation}
      />
    ))
    .otherwise(() => {
      return null;
    });
};
