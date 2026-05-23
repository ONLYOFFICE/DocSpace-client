// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

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
