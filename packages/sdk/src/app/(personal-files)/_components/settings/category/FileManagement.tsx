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
