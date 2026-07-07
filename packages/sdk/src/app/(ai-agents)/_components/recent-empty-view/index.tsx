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
import { useTranslation } from "react-i18next";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyRecentLightIcon from "PUBLIC_DIR/images/emptyview/empty.recent.light.svg";
import EmptyRecentDarkIcon from "PUBLIC_DIR/images/emptyview/empty.recent.dark.svg";

// Mirrors the FolderType.Recent branch of client EmptyViewContainer.utils
// (title NoRecentFilesHereYet + description EmptyRecentDescription + the
// EmptyRecent icon set) — used by the /ai-agents/recent body when the
// folder is empty and no filter is active.
const RecentEmptyView = () => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  // Deferred theme swap — see agents-empty-view for the rationale (SSR
  // doesn't know the theme; mount-gate keeps hydration consistent).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const useLightIcon = !mounted || isBase;

  const icon = useLightIcon ? (
    <EmptyRecentLightIcon />
  ) : (
    <EmptyRecentDarkIcon />
  );

  return (
    <EmptyView
      icon={icon}
      title={t("Common:NoRecentFilesHereYet", {
        defaultValue: "No recent files here yet",
      })}
      description={t("Common:EmptyRecentDescription", {
        defaultValue: "Files you've recently opened will appear here.",
      })}
      options={null}
    />
  );
};

export default RecentEmptyView;
