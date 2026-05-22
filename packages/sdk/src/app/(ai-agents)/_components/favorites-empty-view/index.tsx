// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import EmptyFavoritesLightIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.svg";
import EmptyFavoritesDarkIcon from "PUBLIC_DIR/images/emptyview/empty.favorites.dark.svg";

// Mirrors the FolderType.Favorites branch of client EmptyViewContainer.utils
// (title NoFavoritesHereYet + description EmptyFavoritesDescription + the
// EmptyFavorites icon set) — used by the /ai-agents/favorites body when the
// folder is empty and no filter is active.
const FavoritesEmptyView = () => {
  const { t } = useTranslation(["Common", "EmptyView"]);
  const { isBase } = useTheme();

  // Deferred theme swap — see agents-empty-view for the rationale.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const useLightIcon = !mounted || isBase;

  const icon = useLightIcon ? (
    <EmptyFavoritesLightIcon />
  ) : (
    <EmptyFavoritesDarkIcon />
  );

  return (
    <EmptyView
      icon={icon}
      title={t("EmptyView:EmptyFavoritesTitle", {
        defaultValue: "No favorites yet",
      })}
      description={t("EmptyView:EmptyFavoritesDescription", {
        defaultValue:
          "Star files to keep them easily accessible and within reach.",
      })}
      options={null}
    />
  );
};

export default FavoritesEmptyView;
