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

import { useTranslation } from "react-i18next";

import { Slider } from "@docspace/ui-kit/components/slider";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "./UserCountSelector.module.scss";

type UserCountSelectorProps = {
  count: number;
  onCountChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function UserCountSelector({
  count,
  onCountChange,
  min = 1,
  max = 999,
  disabled = false,
}: UserCountSelectorProps) {
  const { t } = useTranslation(["DocsCloud"]);

  return (
    <div className={styles.wrapper}>
      <Text className={styles.label} fontSize="14px">
        {t("DocsCloud:NumberOfUsers")}
      </Text>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onCountChange(Math.max(min, count - 1))}
          disabled={disabled || count <= min}
        >
          -
        </button>
        <span className={styles.count}>{count}</span>
        <button
          className={styles.btn}
          onClick={() => onCountChange(Math.min(max, count + 1))}
          disabled={disabled || count >= max}
        >
          +
        </button>
      </div>
      <Slider
        value={count}
        min={min}
        max={max}
        step={1}
        isDisabled={disabled}
        onChange={(e) => onCountChange(parseInt(e.target.value, 10))}
        withPouring
      />
    </div>
  );
}
