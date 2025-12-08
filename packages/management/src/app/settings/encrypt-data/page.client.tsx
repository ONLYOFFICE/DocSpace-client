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

"use client";

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useTheme } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Link } from "@docspace/shared/components/link";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { EncryptionStatus } from "@docspace/shared/enums";
import type { TPortals } from "@docspace/shared/api/management/types";

import { EncryptWarningDialog } from "./EncryptWarningDialog";
import { StyledWrapper } from "./EncryptData.styles";

type EncryptDataPageProps = {
  portals: TPortals[];
  encryptionBlockHelpUrl: string;
  isNotify: boolean;
  status: number;
};

const EncryptDataPage = ({
  portals,
  encryptionBlockHelpUrl,
  isNotify,
  status,
}: EncryptDataPageProps) => {
  const { t } = useTranslation(["Management", "Common"]);
  const { currentColorScheme } = useTheme();
  const [encryptWarningDialogVisible, setEncryptWarningDialogVisible] =
    useState(false);
  const [isNotifyChecked, setIsNotifyChecked] = useState(isNotify);

  const isDisabled = portals.length <= 1;

  return (
    <>
      {encryptWarningDialogVisible ? (
        <EncryptWarningDialog
          encryptWarningDialogVisible={encryptWarningDialogVisible}
          setEncryptWarningDialogVisible={setEncryptWarningDialogVisible}
          isNotifyChecked={isNotifyChecked}
          status={status}
        />
      ) : null}
      <StyledWrapper isDisabled={isDisabled}>
        <div className="header">
          <Text fontSize="16px" fontWeight={700}>
            {t("EncryptData")}
          </Text>
          {status === EncryptionStatus.Encrypted ? (
            <div className="badge">
              <Text fontSize="14px" fontWeight={600}>
                {t("StorageEncrypted")}
              </Text>
            </div>
          ) : null}
        </div>
        <Text>
          {t("EncryptDataDescription", {
            organizationName: t("Common:OrganizationName"),
          })}
        </Text>
        <div className="wrapper-block">
          <Text fontSize="16px" fontWeight={700}>
            {t("Common:Warning")}!
          </Text>
          <Text className="description">
            {t("EncryptDataWarningDescription")}
          </Text>
          {encryptionBlockHelpUrl ? (
            <Text>
              <Trans
                t={t}
                i18nKey="MoreDetails"
                ns="Management"
                values={{ link: t("Common:HelpCenter") }}
                components={{
                  1: (
                    <Link
                      key="more-details-link"
                      className="link"
                      color={currentColorScheme?.main?.accent}
                      href={encryptionBlockHelpUrl}
                    />
                  ),
                }}
              />
            </Text>
          ) : null}
          <Checkbox
            className="checkbox"
            label={t("NotifyUsers")}
            onChange={() => setIsNotifyChecked(!isNotifyChecked)}
            isChecked={isNotifyChecked}
            isDisabled={isDisabled}
          />
          <Button
            primary
            label={
              status === EncryptionStatus.Encrypted
                ? t("DecryptStorage")
                : t("EncryptStorage")
            }
            size={ButtonSize.normal}
            onClick={() => setEncryptWarningDialogVisible(true)}
            isDisabled={isDisabled}
          />
        </div>
      </StyledWrapper>
    </>
  );
};

export default EncryptDataPage;
