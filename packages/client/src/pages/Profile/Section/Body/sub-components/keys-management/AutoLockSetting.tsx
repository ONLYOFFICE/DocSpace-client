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
        <option value="off">{t("Common:AutoLockOff")}</option>
        <option value="5m">{t("Common:AutoLock5m")}</option>
        <option value="15m">{t("Common:AutoLock15m")}</option>
        <option value="30m">{t("Common:AutoLock30m")}</option>
        <option value="1h">{t("Common:AutoLock1h")}</option>
      </select>
    </div>
  );
};
