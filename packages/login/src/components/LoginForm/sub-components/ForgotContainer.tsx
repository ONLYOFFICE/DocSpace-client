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

import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { isMobileOnly } from "react-device-detect";

import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { RecaptchaType } from "@docspace/shared/enums";

import { LoginDispatchContext } from "@/components/Login";

import ForgotPasswordModalDialog from "./ForgotPasswordModalDialog";

interface IForgotContainer {
  cookieSettingsEnabled: boolean;
  isChecked: boolean;
  identifier: string;
  onChangeCheckbox: VoidFunction;
  reCaptchaPublicKey?: string;
  reCaptchaType?: RecaptchaType;
}

const ForgotContainer = ({
  cookieSettingsEnabled,
  isChecked,
  identifier,
  onChangeCheckbox,
  reCaptchaPublicKey,
  reCaptchaType,
}: IForgotContainer) => {
  const { setIsModalOpen } = useContext(LoginDispatchContext);
  const { t } = useTranslation(["Login", "Common"]);

  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const onClick = () => {
    setIsDialogVisible(true);
    setIsModalOpen(true);
  };

  const onDialogClose = () => {
    setIsDialogVisible(false);
    setIsModalOpen(false);
  };

  return (
    <div className="login-forgot-wrapper">
      <div className="login-checkbox-wrapper">
        <div className="remember-wrapper">
          {!cookieSettingsEnabled ? (
            <Checkbox
              id="login_remember"
              className="login-checkbox"
              tabIndex={3}
              isChecked={isChecked}
              onChange={onChangeCheckbox}
              label={t("Common:Remember")}
              helpButton={
                <HelpButton
                  id="login_remember-hint"
                  className="help-button"
                  offsetRight={0}
                  tooltipContent={
                    <Text fontSize="12px">{t("RememberHelper")}</Text>
                  }
                  tooltipMaxWidth={isMobileOnly ? "240px" : "340px"}
                  dataTestId="remember_help_button"
                />
              }
              dataTestId="remember_checkbox"
            />
          ) : null}
        </div>

        <Link
          fontSize="13px"
          className="login-link"
          type={LinkType.page}
          isHovered={false}
          onClick={onClick}
          id="login_forgot-password-link"
          dataTestId="forgot_password_link"
        >
          {t("ForgotPassword")}
        </Link>
      </div>

      {isDialogVisible ? (
        <ForgotPasswordModalDialog
          isVisible={isDialogVisible}
          userEmail={identifier}
          onDialogClose={onDialogClose}
          reCaptchaPublicKey={reCaptchaPublicKey}
          reCaptchaType={reCaptchaType}
        />
      ) : null}
    </div>
  );
};

export default ForgotContainer;
