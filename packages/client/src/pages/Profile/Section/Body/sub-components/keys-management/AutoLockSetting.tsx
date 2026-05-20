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

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/ui-kit/components/combobox";
import { isMobile } from "@docspace/shared/utils";
import {
  type AutoLockPresetId,
  getCurrentAutoLockPresetId,
  setAutoLockPreset,
} from "@docspace/shared/services/encryption/auto-lock-preference";

import styles from "./AutoLockSetting.module.scss";

export const AutoLockSetting = () => {
  const { t } = useTranslation(["Common"]);
  const [presetId, setPresetId] = useState<AutoLockPresetId>(() =>
    getCurrentAutoLockPresetId(),
  );

  const options = useMemo<TOption[]>(
    () => [
      { key: "off", label: t("Common:AutoLockOff") },
      { key: "5m", label: t("Common:AutoLock5m") },
      { key: "15m", label: t("Common:AutoLock15m") },
      { key: "30m", label: t("Common:AutoLock30m") },
      { key: "1h", label: t("Common:AutoLock1h") },
    ],
    [t],
  );

  const selectedOption = useMemo(
    () => options.find((o) => o.key === presetId) ?? options[0],
    [options, presetId],
  );

  const handleSelect = useCallback((option: TOption) => {
    const next = option.key as AutoLockPresetId;
    setAutoLockPreset(next);
    setPresetId(next);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:AutoLockLabel")}
        </Text>
        <Text fontSize="12px" color="var(--text-secondary)">
          {t("Common:AutoLockHint")}
        </Text>
      </div>
      <ComboBox
        className={styles.select}
        options={options}
        selectedOption={selectedOption}
        onSelect={handleSelect}
        size={ComboBoxSize.content}
        scaled={false}
        scaledOptions
        displaySelectedOption
        isDefaultMode={!isMobile()}
        dataTestId="auto_lock_timeout_combobox"
        dropDownTestId="auto_lock_timeout_combobox_dropdown"
      />
    </div>
  );
};
