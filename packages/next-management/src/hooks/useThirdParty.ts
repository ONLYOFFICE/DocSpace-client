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
"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  openConnectWindow as openConnectWindowApi,
  deleteThirdParty as deleteThirdPartyApi,
} from "@docspace/shared/api/files";
import type {
  Nullable,
  ProviderType,
  TTranslation,
} from "@docspace/shared/types";

const convertServiceName = (serviceName: string) => {
  // Docusign, OneDrive, Wordpress
  switch (serviceName) {
    case "GoogleDrive":
      return "google";
    case "Box":
      return "box";
    case "DropboxV2":
      return "dropbox";
    case "OneDrive":
      return "onedrive";
    default:
      return "";
  }
};

const oAuthPopup = (url: string, modal: Nullable<Window>, t: TTranslation) => {
  let newWindow = modal;

  if (newWindow) {
    newWindow.location = url;
  }

  try {
    const params =
      "height=600,width=1020,resizable=0,status=0,toolbar=0,menubar=0,location=1";
    newWindow = modal
      ? newWindow
      : window.open(url, t("Common:Authorization"), params);
  } catch (err) {
    newWindow = modal ? newWindow : window.open(url, t("Common:Authorization"));
  }

  return newWindow;
};

export const useThirdParty = () => {
  const { t } = useTranslation(["Common"]);
  const [providers, setThirdPartyProviders] = useState<ProviderType[]>([]);

  const openConnectWindow = useCallback(
    (
      serviceName: string,
      modal: Nullable<Window>,
    ): Promise<Nullable<Window>> => {
      const service = convertServiceName(serviceName);
      return openConnectWindowApi(service).then((link) => {
        return oAuthPopup(link, modal, t);
      });
    },
    [t],
  );

  const deleteThirdParty = useCallback(async (id: string) => {
    await deleteThirdPartyApi(id);
  }, []);

  return {
    openConnectWindow,
    deleteThirdParty,
    providers,
    setThirdPartyProviders,
  };
};
