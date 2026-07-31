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

import type React from "react";

import styles from "./DualRingSpinner.module.scss";

type DualRingSpinnerProps = {
  size?: string;
};

const DualRingSpinner = ({ size = "40px" }: DualRingSpinnerProps) => {
  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.svg}
        style={{ "--dual-ring-size": size } as React.CSSProperties}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Loading"
        role="status"
      >
        <title>loading</title>
        <circle
          className={styles.outer}
          cx="50"
          cy="50"
          r="40"
          strokeWidth="8"
          strokeDasharray="62.83185307179586 62.83185307179586"
        />
        <circle
          className={styles.inner}
          cx="50"
          cy="50"
          r="20"
          strokeWidth="4"
          strokeDasharray="29.845130209103033 29.845130209103033"
          strokeDashoffset="29.845130209103033"
        />
      </svg>
    </div>
  );
};

export default DualRingSpinner;
