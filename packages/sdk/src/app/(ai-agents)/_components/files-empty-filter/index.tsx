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
