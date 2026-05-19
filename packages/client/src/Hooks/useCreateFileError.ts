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
import { toastr } from "@docspace/ui-kit/components/toast";

type UseCreateFileErrorProps = {
  setPortalTariff: () => void;
  setFormCreationInfo: (info: {
    newTitle: string;
    fromExst: string;
    toExst: string;
    open: boolean;
    actionId: string;
    fileInfo: {
      id: string;
      folderId: number;
      fileExst: string;
    };
  }) => void;
  setConvertPasswordDialogVisible: (visible: boolean) => void;
};

const useCreateFileError = ({
  setPortalTariff,
  setFormCreationInfo,
  setConvertPasswordDialogVisible,
}: UseCreateFileErrorProps) => {
  const alreadyUsed = React.useRef(false);

  const { t, ready } = useTranslation([
    "Common",
    "Translations",
    "ConvertPasswordDialog",
  ]);

  React.useEffect(() => {
    if (alreadyUsed.current || !ready) return;
    alreadyUsed.current = true;
    const searchParams = new URLSearchParams(window.location.search);

    const createError = searchParams.get("createError");
    if (!createError) return;

    const error = JSON.parse(createError);

    if (error?.fileInfo?.password) {
      toastr.error(
        t("ConvertPasswordDialog:CreationError"),
        t("Common:Warning"),
      );
    } else {
      toastr.error(t("Translations:FileProtected"), t("Common:Warning"));
    }

    setFormCreationInfo?.({
      newTitle: error?.fileInfo?.title,
      fromExst: ".docx",
      toExst: error?.fileInfo?.extension,
      open: error?.fileInfo?.open === "true",
      actionId: error?.fileInfo?.id,
      fileInfo: {
        id: error?.fileInfo?.templateId,
        folderId: Number(error?.fileInfo?.parentId),
        fileExst: error?.fileInfo?.extension,
      },
    });
    setConvertPasswordDialogVisible?.(true);
  }, [
    setConvertPasswordDialogVisible,
    setFormCreationInfo,
    setPortalTariff,
    t,
    ready,
  ]);
};

export default useCreateFileError;
