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

import React, { useCallback } from "react";

import type { TFolder } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import type { CategoryItem } from "../../_hooks/useLibraryLandingData";
import styles from "./LibraryLanding.module.scss";

type CategoryColumnProps = {
  folder: TFolder;
  items: CategoryItem[];
  isLoading: boolean;
  onClickItem: (item: CategoryItem, category: TFolder) => void;
};

const CategoryColumn = ({
  folder,
  items,
  isLoading,
  onClickItem,
}: CategoryColumnProps) => {
  const handleClick = useCallback(
    (item: CategoryItem) => (e: React.MouseEvent) => {
      e.preventDefault();
      onClickItem(item, folder);
    },
    [onClickItem, folder],
  );

  return (
    <div className={styles.categoryColumn}>
      <h3 className={styles.categoryTitle}>{folder.title}</h3>

      {isLoading ? (
        <div className={styles.categorySkeletons}>
          {Array.from({ length: 5 }, (_, i) => (
            <RectangleSkeleton
              key={`skel_${i}`}
              width="80%"
              height="20px"
              borderRadius="4px"
              animate
            />
          ))}
        </div>
      ) : (
        <ul className={styles.categoryList}>
          {items.map((item) => (
            <li key={`${item.type}_${item.id}`} className={styles.categoryItem}>
              <a
                href="#"
                className={styles.categoryLink}
                onClick={handleClick(item)}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryColumn;
