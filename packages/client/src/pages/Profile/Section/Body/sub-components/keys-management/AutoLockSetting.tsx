// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the
// Free Software Foundation. In accordance with Section 7(a) of the GNU AGPL its
// Section 15 shall be amended to the effect that Ascensio System SIA expressly
// excludes the warranty of non-infringement of any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied
// warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE.
// For details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html

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
