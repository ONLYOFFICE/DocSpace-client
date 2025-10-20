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
