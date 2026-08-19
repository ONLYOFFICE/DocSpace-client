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

import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TFolder } from "@docspace/shared/api/files/types";

import WorldMapUrl from "PUBLIC_DIR/images/world-map.react.svg?url";

import { getFlagUrlForFolder } from "../../_utils/flagsMap";
import styles from "./LibraryCountryList.module.scss";

type LibraryCountryListProps = {
  folders: TFolder[];
  onOpenFolder: (folder: TFolder) => void;
};

const LibraryCountryList = ({
  folders,
  onOpenFolder,
}: LibraryCountryListProps) => {
  const { t } = useTranslation("Common");

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.title.localeCompare(b.title)),
    [folders],
  );

  const handleClick = useCallback(
    (folder: TFolder) => (e: React.MouseEvent) => {
      e.preventDefault();
      onOpenFolder(folder);
    },
    [onOpenFolder],
  );

  const handleKeyDown = useCallback(
    (folder: TFolder) => (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpenFolder(folder);
      }
    },
    [onOpenFolder],
  );

  return (
    <div className={styles.root}>
      {/* biome-ignore lint/performance/noImgElement: static SVG via ?url import */}
      <img
        className={styles.mapImage}
        src={WorldMapUrl}
        alt=""
        draggable={false}
      />
      <h2 className={styles.title}>{t("Common:ChooseYourCountry")}</h2>
      <p className={styles.description}>
        {t("Common:ChooseYourCountryDescription")}
      </p>
      <div className={styles.grid}>
        {sortedFolders.map((folder) => {
          const flagUrl = getFlagUrlForFolder(folder) ?? WorldMapUrl;
          return (
            <div
              key={folder.id}
              className={styles.countryItem}
              onClick={handleClick(folder)}
              onKeyDown={handleKeyDown(folder)}
              role="button"
              tabIndex={0}
            >
              {/* biome-ignore lint/performance/noImgElement: static SVG flag icon */}
              <img
                className={styles.flagIcon}
                src={flagUrl}
                alt=""
                draggable={false}
              />
              <span className={styles.countryName}>{folder.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryCountryList;
