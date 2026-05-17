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
import { isIOS, deviceType } from "react-device-detect";

import { UseInitProps } from "@/types";
import { setDocumentTitle, showDocEditorMessage } from "@/utils";
import initDesktop from "@/utils/initDesktop";
import { IS_DESKTOP_EDITOR } from "@/utils/constants";

const useInit = ({
  config,
  successAuth,
  fileInfo,
  user,
  t,
  setDocTitle,
  documentReady,
  organizationName,
}: UseInitProps) => {
  React.useEffect(() => {
    if (isIOS && deviceType === "tablet") {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
  }, []);

  React.useEffect(() => {
    if (!config) return;

    setDocumentTitle(
      t,
      config.document.title,
      config.document.fileType,
      documentReady,
      successAuth ?? false,
      organizationName,
      setDocTitle,
    );
  }, [
    t,
    config,
    documentReady,
    fileInfo,
    setDocTitle,
    successAuth,
    organizationName,
  ]);

  React.useEffect(() => {
    if (config && IS_DESKTOP_EDITOR && user && fileInfo?.id) {
      initDesktop(config, user, fileInfo.id, t);
    }
  }, [config, fileInfo?.id, t, user]);

  React.useEffect(() => {
    try {
      const url = window.location.href;

      if (
        successAuth &&
        url.indexOf("#message/") > -1 &&
        fileInfo &&
        fileInfo?.fileExst &&
        fileInfo?.viewAccessibility?.MustConvert &&
        fileInfo?.security?.Convert
      ) {
        showDocEditorMessage(url, fileInfo.id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [fileInfo, successAuth]);

  return {};
};

export default useInit;
