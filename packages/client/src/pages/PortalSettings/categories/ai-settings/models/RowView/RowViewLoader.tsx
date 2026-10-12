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

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./RowViewLoader.module.scss";

// Mobile skeleton: intro line, then a few stacked cards matching a row —
// model icon · (title + price) · on/off toggle.
export const RowViewLoader = () => {
  return (
    <div className={styles.wrapper}>
      <RectangleSkeleton width="100%" height="36px" />

      <div className={styles.list}>
        {["row-1", "row-2", "row-3", "row-4", "row-5"].map((key) => (
          <div className={styles.row} key={key}>
            <RectangleSkeleton width="32px" height="32px" borderRadius="6px" />
            <div className={styles.content}>
              <RectangleSkeleton width="160px" height="16px" />
              <RectangleSkeleton width="220px" height="14px" />
            </div>
            <RectangleSkeleton
              className={styles.toggle}
              width="32px"
              height="18px"
              borderRadius="10px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
