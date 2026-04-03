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

"use client";

import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TFolder } from "@docspace/shared/api/files/types";

import WorldMapUrl from "PUBLIC_DIR/images/world-map.react.svg?url";

import { getFlagUrl } from "../../_utils/flagsMap";
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
          const flagUrl = getFlagUrl(folder.title);
          return (
            <div
              key={folder.id}
              className={styles.countryItem}
              onClick={handleClick(folder)}
              onKeyDown={handleKeyDown(folder)}
              role="button"
              tabIndex={0}
            >
              {flagUrl
                ? // biome-ignore lint/performance/noImgElement: static SVG flag icon
                  (<img
                    className={styles.flagIcon}
                    src={flagUrl}
                    alt=""
                    draggable={false}
                  />)
                : (<div className={styles.flagIcon} />)
              }
              <span className={styles.countryName}>{folder.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryCountryList;
