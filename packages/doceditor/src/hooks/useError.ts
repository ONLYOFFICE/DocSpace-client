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

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { frameCallCommand } from "@docspace/shared/utils/common";

import { TError } from "@/types";

interface UseErrorProps {
  error?: TError;
  editorUrl?: string;
}

const useError = ({ error, editorUrl }: UseErrorProps) => {
  React.useEffect(() => {
    if (error?.message === "unauthorized") {
      sessionStorage.setItem("referenceUrl", window.location.href);

      window.open(
        combineUrl(window.ClientConfig?.proxy?.url, "/login"),
        "_self",
      );
    }
    if (error?.message === "unavailable") {
      window.open(
        combineUrl(window.ClientConfig?.proxy?.url, "/unavailable"),
        "_self",
      );
    }

    if (error?.message === "restore-backup") {
      window.open(
        combineUrl(window.ClientConfig?.proxy?.url, "/preparation-portal"),
        "_self",
      );
    }
  }, [error]);

  React.useEffect(() => {
    if (error?.status === 402) {
      const portalUrl = window.location.origin;

      window.history.pushState({}, "false", portalUrl);
      document.location.reload();
    } else {
      const tempElm = document.getElementById("loader");

      const isLoadingDocumentError = !!error;
      const isLoadedDocument = !error && editorUrl;

      if (tempElm && (isLoadingDocumentError || isLoadedDocument))
        tempElm.outerHTML = "";

      if (isLoadingDocumentError) frameCallCommand("setIsLoaded");
    }
  }, [editorUrl, error]);

  const getErrorMessage = React.useCallback(() => {
    if (typeof error !== "string") return error?.message;

    return error;
  }, [error]);

  return { getErrorMessage };
};

export default useError;
