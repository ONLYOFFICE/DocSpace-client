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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  storeOriginal,
  changeDeleteConfirm,
  changeKeepNewFileName,
  enableDisplayFileExtension,
} from "@docspace/shared/api/files";

import { useDocsSettingsStore } from "../../../_store/DocsSettingsStore";

import styles from "./FileManagement.module.scss";

const FileManagement = observer(() => {
  const { t } = useTranslation("Common");
  const docsSettingsStore = useDocsSettingsStore();
  const settings = docsSettingsStore.filesSettings;

  const onChangeKeepNewFileName = useCallback(async () => {
    const newVal = !settings?.keepNewFileName;
    try {
      await changeKeepNewFileName(newVal);
      if (settings) {
        docsSettingsStore.setFilesSettings({
          ...settings,
          keepNewFileName: newVal,
        });
      }
    } catch (error) {
      toastr.error(error as string);
    }
  }, [settings, docsSettingsStore]);

  const onChangeOriginalCopy = useCallback(async () => {
    const newVal = !settings?.storeOriginalFiles;
    try {
      await storeOriginal(newVal);
      if (settings) {
        docsSettingsStore.setFilesSettings({
          ...settings,
          storeOriginalFiles: newVal,
        });
      }
    } catch (error) {
      toastr.error(error as string);
    }
  }, [settings, docsSettingsStore]);

  const onChangeDeleteConfirm = useCallback(async () => {
    const newVal = !settings?.confirmDelete;
    try {
      await changeDeleteConfirm(newVal);
      if (settings) {
        docsSettingsStore.setFilesSettings({
          ...settings,
          confirmDelete: newVal,
        });
      }
    } catch (error) {
      toastr.error(error as string);
    }
  }, [settings, docsSettingsStore]);

  const onChangeDisplayFileExtension = useCallback(async () => {
    const newVal = !settings?.displayFileExtension;
    try {
      await enableDisplayFileExtension(newVal);
      if (settings) {
        docsSettingsStore.setFilesSettings({
          ...settings,
          displayFileExtension: newVal,
        });
      }
    } catch (error) {
      toastr.error(error as string);
    }
  }, [settings, docsSettingsStore]);

  if (!settings) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.settingsSection}>
        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={styles.toggleBtn}
            onChange={onChangeKeepNewFileName}
            isChecked={settings.keepNewFileName}
          />
          <Text>{t("Common:DontAskAgain")}</Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={styles.toggleBtn}
            onChange={onChangeOriginalCopy}
            isChecked={settings.storeOriginalFiles}
          />
          <Text>{t("OriginalCopy")}</Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={styles.toggleBtn}
            onChange={onChangeDeleteConfirm}
            isChecked={settings.confirmDelete}
          />
          <Text>
            {t("TrashMoveConfirmation", {
              sectionName: t("Common:TrashSection"),
            })}
          </Text>
        </div>

        <div className={styles.toggleBtnWrapper}>
          <ToggleButton
            className={styles.toggleBtn}
            onChange={onChangeDisplayFileExtension}
            isChecked={settings.displayFileExtension}
          />
          <Text>{t("DisplayFileExtension")}</Text>
        </div>
      </div>
    </div>
  );
});

export default FileManagement;
