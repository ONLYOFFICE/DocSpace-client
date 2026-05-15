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

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import {
  AUTO_LOCK_PRESETS,
  type AutoLockPresetId,
  getCurrentAutoLockPresetId,
  setAutoLockPreset,
} from "@docspace/shared/services/encryption/auto-lock-preference";

import styles from "./AutoLockSetting.module.scss";

const PRESET_LABEL_KEY: Record<AutoLockPresetId, string> = {
  off: "Common:AutoLockOff",
  "5m": "Common:AutoLock5m",
  "15m": "Common:AutoLock15m",
  "30m": "Common:AutoLock30m",
  "1h": "Common:AutoLock1h",
};

export const AutoLockSetting = () => {
  const { t } = useTranslation(["Common"]);
  const [presetId, setPresetId] = useState<AutoLockPresetId>(() =>
    getCurrentAutoLockPresetId(),
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = e.target.value as AutoLockPresetId;
      setAutoLockPreset(next);
      setPresetId(next);
    },
    [],
  );

  return (
    <div className={styles.container}>
      <label htmlFor="autoLockTimeout" className={styles.label}>
        <Text fontSize="13px" fontWeight={600}>
          {t("Common:AutoLockLabel")}
        </Text>
        <Text fontSize="12px" color="var(--text-secondary)">
          {t("Common:AutoLockHint")}
        </Text>
      </label>
      <select
        id="autoLockTimeout"
        className={styles.select}
        value={presetId}
        onChange={handleChange}
      >
        {AUTO_LOCK_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {t(PRESET_LABEL_KEY[p.id])}
          </option>
        ))}
      </select>
    </div>
  );
};
