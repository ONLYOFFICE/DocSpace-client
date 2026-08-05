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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { unlinkTfaApp } from "@docspace/shared/api/settings";
import { TUser } from "@docspace/shared/api/people/types";
import { OPEN_BACKUP_CODES_DIALOG } from "@docspace/shared/constants";

import {
  ResetApplicationDialog,
  BackupCodesDialog,
} from "SRC_DIR/components/dialogs";

import styles from "../login.module.scss";

type LoginSettingsProps = {
  profile?: TUser;

  backupCodes?: unknown[];
  setBackupCodes?: unknown;
};

const LoginSettings = (props: LoginSettingsProps) => {
  const { t } = useTranslation(["Profile", "Settings", "Common"]);

  const {
    profile,

    backupCodes,
    setBackupCodes,
  } = props;

  const [resetAppDialogVisible, setResetAppDialogVisible] = useState(false);
  const [backupCodesDialogVisible, setBackupCodesDialogVisible] =
    useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(OPEN_BACKUP_CODES_DIALOG)) {
      setBackupCodesDialogVisible(true);
      sessionStorage.removeItem(OPEN_BACKUP_CODES_DIALOG);
    }
  }, []);

  return (
    <div className={styles.loginSettingsWrapper} data-testid="profile-tfa">
      <div className={styles.header}>
        <Text fontSize="16px" fontWeight={700} lineHeight="22px">
          {t("Settings:TwoFactorAuth")}
        </Text>
        <Text className={styles.description}>{t("TwoFactorDescription")}</Text>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.button}
          label={t("ShowBackupCodes")}
          onClick={() => setBackupCodesDialogVisible(true)}
          size={ButtonSize.small}
          testId="show_backup_codes_button"
        />
        <Link
          fontWeight="600"
          isHovered
          type={LinkType.action}
          onClick={() => setResetAppDialogVisible(true)}
          dataTestId="reset_app_link"
        >
          {t("Common:ResetApplication")}
        </Link>
      </div>

      {resetAppDialogVisible ? (
        <ResetApplicationDialog
          visible={resetAppDialogVisible}
          onClose={() => setResetAppDialogVisible(false)}
          resetTfaApp={unlinkTfaApp}
          id={(profile as TUser | null)?.id}
        />
      ) : null}
      {backupCodesDialogVisible ? (
        <BackupCodesDialog
          visible={backupCodesDialogVisible}
          onClose={() => setBackupCodesDialogVisible(false)}
          backupCodes={backupCodes}
          backupCodesCount={(backupCodes as { isUsed: boolean }[])?.reduce(
            (acc: number, code: { isUsed: boolean }) => {
              if (!code.isUsed) {
                acc++;
              }
              return acc;
            },
            0,
          )}
          setBackupCodes={setBackupCodes}
        />
      ) : null}
    </div>
  );
};

export default inject(({ tfaStore, userStore }: TStore) => {
  const { user: profile } = userStore!;

  const { backupCodes, setBackupCodes } = tfaStore;

  return {
    profile,

    backupCodes,
    setBackupCodes,
  };
})(observer(LoginSettings));
