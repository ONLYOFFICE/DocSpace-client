// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  EmptyView,
  type EmptyViewOptionsType,
} from "@docspace/shared/components/empty-view";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import ClearEmptyFilterSvg from "PUBLIC_DIR/images/clear.empty.filter.svg";
import EmptyFilterFilesLightIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.light.svg";
import EmptyFilterFilesDarkIcon from "PUBLIC_DIR/images/emptyFilter/empty.filter.files.dark.svg";

// Files variant of client's EmptyFilterContainer — used when a search
// filter is active over a files list (e.g. /ai-agents/recent) and nothing
// matches. Identical copy/icon to client's `!isRooms && !isAIAgentsFolder`
// branch.
type Props = {
  onClear: () => void;
};

const FilesEmptyFilter = ({ onClear }: Props) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClear();
  };

  // `isNext: true` keeps EmptyViewOption on the ui-kit Link branch instead
  // of LinkRouter — SDK runs under Next.js, not react-router. Same fix as
  // in agents-empty-filter.
  const options: EmptyViewOptionsType = [
    {
      key: "empty-view-filter",
      to: "",
      isNext: true,
      description: t("Common:ClearFilter", { defaultValue: "Clear filter" }),
      icon: <ClearEmptyFilterSvg />,
      onClick: handleClick,
    },
  ];

  const icon = isBase ? (
    <EmptyFilterFilesLightIcon />
  ) : (
    <EmptyFilterFilesDarkIcon />
  );

  return (
    <EmptyView
      icon={icon}
      title={t("Common:NoFindingsFound", { defaultValue: "No findings" })}
      description={t("Common:EmptyFilterFilesDescription", {
        defaultValue:
          "No files or folders match this filter. Try another or remove the filter to view all files.",
      })}
      options={options}
    />
  );
};

export default FilesEmptyFilter;
