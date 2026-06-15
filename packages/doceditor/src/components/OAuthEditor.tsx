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

"use client";

import React from "react";

import { request } from "@docspace/shared/api/client";
import { getUser } from "@docspace/shared/api/people";
import type { TFrameConfig } from "@docspace/shared/types/Frame";

import type { TResponse, IInitialConfig } from "@/types";
import { REPLACED_URL_PATH } from "@/utils/constants";
import Root from "./Root";

type OAuthEditorProps = {
  fileId: string;
  version?: string;
  doc?: string;
  action?: string;
  editorType?: string;
  baseSdkConfig?: TFrameConfig;
};

const OAuthEditor = ({
  fileId,
  version,
  doc,
  action,
  editorType,
  baseSdkConfig,
}: OAuthEditorProps) => {
  const [data, setData] = React.useState<TResponse | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const params = new URLSearchParams();
        if (action) params.append(action, "true");
        if (version) params.append("version", version);
        if (doc) params.append("doc", doc);
        if (editorType) params.append("editorType", editorType);

        const config = await request<IInitialConfig>({
          method: "get",
          url: `/files/file/${fileId}/openedit?${params.toString()}`,
        });

        if (!config) throw new Error("unauthorized");

        config.editorUrl = config.editorUrl.replace(REPLACED_URL_PATH, "");
        const urlQuery = config.editorUrl.includes("?")
          ? `?${config.editorUrl.split("?")[1]}`
          : "";
        if (urlQuery) config.editorUrl = config.editorUrl.replace(urlQuery, "");

        if (action === "view") config.editorConfig.mode = "view";

        const user = await getUser().catch(() => undefined);

        if (cancelled) return;

        setData({
          config,
          user: user ?? undefined,
          settings: undefined,
          successAuth: !!user,
          isSharingAccess: !!config.file?.canShare,
          doc,
          fileId: config.file?.id ? config.file.id.toString() : fileId,
        });
      } catch (e) {
        if (cancelled) return;
        setData({
          error: { message: (e as Error)?.message || "unauthorized" },
          fileId,
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [fileId, version, doc, action, editorType]);

  if (!data) return null;

  return <Root {...data} baseSdkConfig={baseSdkConfig} />;
};

export default OAuthEditor;
