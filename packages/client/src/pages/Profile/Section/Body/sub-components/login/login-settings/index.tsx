// (c) Copyright Ascensio System SIA 2009-2025
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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { unlinkTfaApp } from "@docspace/shared/api/settings";
import { TUser } from "@docspace/shared/api/people/types";
import { OPEN_BACKUP_CODES_DIALOG } from "@docspace/shared/constants";

import {
  ResetApplicationDialog,
  BackupCodesDialog,
} from "SRC_DIR/components/dialogs";

import { StyledWrapper } from "./LoginSettings.styled";

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
    <StyledWrapper>
      <div className="header">
        <Text fontSize="16px" fontWeight={700} lineHeight="22px">
          {t("Settings:TwoFactorAuth")}
        </Text>
        <Text className="description">{t("TwoFactorDescription")}</Text>
      </div>
      <div className="actions">
        <Button
          className="button"
          label={t("ShowBackupCodes")}
          onClick={() => setBackupCodesDialogVisible(true)}
          size={ButtonSize.small}
        />
        <Link
          fontWeight="600"
          isHovered
          type={LinkType.action}
          onClick={() => setResetAppDialogVisible(true)}
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
    </StyledWrapper>
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
