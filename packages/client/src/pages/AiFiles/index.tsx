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

// (c) Copyright Ascensio System SIA 2009-2026
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
import { inject, observer } from "mobx-react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";

type AiFilesProps = {
  myFolderId?: number | null;
};

// Host `?section=` -> the SDK `DocsSection` value the personal-files frame
// bridge understands (it routes internally via `navigateSection`, so the
// iframe stays mounted instead of reloading on every section switch).
const HOST_TO_SDK: Record<string, string> = {
  "": "my-documents",
  "shared-with-me": "shared-with-me",
  recent: "recent",
  favorites: "favorites",
  trash: "trash",
};

// SDK `DocsSection` -> host `?section=`. `my-documents` maps to no section
// param (keeps `/ai-files` URLs clean and matches the sidebar default).
const SDK_TO_HOST: Record<string, string> = {
  "my-documents": "",
  "shared-with-me": "shared-with-me",
  recent: "recent",
  favorites: "favorites",
  trash: "trash",
};

const getSrc = (
  section: string,
  myFolderId?: number | null,
  search?: string | null,
  folder?: string | null,
): string => {
  const parentIdParam =
    myFolderId != null ? `parentId=${myFolderId}` : "";

  const buildQuery = (base: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(base)) {
      if (v != null && v !== "") params.set(k, v);
    }
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  switch (section) {
    case "recent":
      return `/sdk/personal-files/recent${buildQuery({ search, id: folder, parentId: myFolderId != null ? String(myFolderId) : null })}`;
    case "favorites":
      return `/sdk/personal-files/favorites${buildQuery({ search, id: folder, parentId: myFolderId != null ? String(myFolderId) : null })}`;
    case "shared-with-me":
      return `/sdk/personal-files/shared-with-me${buildQuery({ search, id: folder })}`;
    case "trash":
      return `/sdk/personal-files/trash${buildQuery({ search, id: folder })}`;
    default:
      return `/sdk/personal-files${buildQuery({ search, id: folder, ...(parentIdParam ? { parentId: String(myFolderId) } : {}) })}`;
  }
};

const AiFiles = ({ myFolderId }: AiFilesProps) => {
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:DashboardFilesTitle");
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get("section") ?? "";
  const lastSdkSectionRef = React.useRef<string | null>(null);

  const searchParamsRef = React.useRef(searchParams);
  searchParamsRef.current = searchParams;
  const setSearchParamsRef = React.useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  // Iframe -> parent: the SDK reports its section on every internal
  // navigation. Mirror it into the host URL without touching `src`, so the
  // iframe does NOT remount.
  const handleSdkNavigate = React.useCallback((sdkSection: string) => {
    lastSdkSectionRef.current = sdkSection;
    const target = SDK_TO_HOST[sdkSection] ?? "";
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (target) next.set("section", target);
        else next.delete("section");
        // A section change resets the in-section search filter.
        next.delete("search");
        return next;
      },
      { replace: true },
    );
  }, []);

  const handleFilterSearch = React.useCallback((value: string) => {
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set("search", value);
        } else {
          next.delete("search");
        }
        return next;
      },
      { replace: true },
    );
  }, []);

  // The host owns the iframe and freezes `src` on first show, so it stays
  // mounted across app/section switches. A direct deep link
  // (`?section=&folder=&search=`) still loads the right folder/search.
  const apiRef = useSdkFrame({
    appId: "ai-files",
    enabled: true,
    title: t("Common:DashboardFilesTitle"),
    getSrc: () => {
      const sp = searchParamsRef.current;
      return getSrc(
        sp.get("section") ?? "",
        myFolderId,
        sp.get("search"),
        sp.get("folder"),
      );
    },
    onNavigate: handleSdkNavigate,
    onFilterSearch: handleFilterSearch,
  });

  // Parent -> iframe: when the host section changes (sidebar click, deep
  // link), tell the SDK to route internally rather than reloading the
  // frame. Skip if the SDK just reported this exact section (echo).
  const sdkSection = HOST_TO_SDK[section] ?? "my-documents";
  React.useEffect(() => {
    if (lastSdkSectionRef.current === sdkSection) return;
    apiRef.current?.call("navigateSection", { section: sdkSection });
  }, [sdkSection, apiRef]);

  return null;
};

const AiFilesConnected = inject<TStore>(({ treeFoldersStore }) => ({
  myFolderId: treeFoldersStore.myFolderId,
}))(observer(AiFiles));

export { AiFilesConnected as AiFiles };
export default AiFilesConnected;
