// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable @next/next/no-img-element */

"use client";

import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import { Link, LinkTarget } from "@docspace/shared/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { TPasswordHash } from "@docspace/shared/api/settings/types";
import { loginWithTfaCode } from "@docspace/shared/api/user";
import { validateTfaCode } from "@docspace/shared/api/settings";
import { OPEN_BACKUP_CODES_DIALOG } from "@docspace/shared/constants";
import { ButtonKeys } from "@docspace/shared/enums";

import {
  TFA_ANDROID_APP_URL,
  TFA_IOS_APP_URL,
  TFA_WIN_APP_URL,
} from "@/utils/constants";
import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { GreetingContainer } from "@/components/GreetingContainer";

type TfaActivationFormProps = {
  secretKey: string;
  qrCode: string;
  passwordHash: TPasswordHash;
  userName?: string;
};

const TfaActivationForm = ({
  secretKey,
  qrCode,
  passwordHash,
  userName,
}: TfaActivationFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);
  const { currentColorScheme } = useTheme();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { confirmHeader = null } = linkData;

  const proxyBaseUrl = useRef("");
  useEffect(() => {
    proxyBaseUrl.current = combineUrl(
      window.ClientConfig?.proxy?.url,
      "/profile",
    );
  }, []);

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      if (userName && passwordHash) {
        await loginWithTfaCode(userName, passwordHash, code);
      } else {
        await validateTfaCode(code, confirmHeader);
      }

      sessionStorage.setItem(OPEN_BACKUP_CODES_DIALOG, "true");
      window.location.href = proxyBaseUrl.current;
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string;

      if (typeof knownError === "object") {
        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }

      setError(errorMessage);
      toastr.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
    setError("");
  };

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.code === ButtonKeys.enter ||
      event.code === ButtonKeys.numpadEnter
    )
      onSubmit();
  };

  return (
    <>
      <Box className="set-app-description" marginProp="0 0 32px 0">
        <GreetingContainer />

        <Text isBold fontSize="14px" className="set-app-title">
          {t("SetAppTitle")}
        </Text>

        <Trans
          t={t}
          i18nKey="SetAppDescription"
          ns="Confirm"
          productName={t("Common:ProductName")}
        >
          The two-factor authentication is enabled to provide additional portal
          security. Configure your authenticator application to continue work on
          the portal. For example you could use Google Authenticator for
          <Link
            color={currentColorScheme?.main?.accent}
            href={TFA_ANDROID_APP_URL}
            target={LinkTarget.blank}
          >
            Android
          </Link>
          and{" "}
          <Link
            color={currentColorScheme?.main?.accent}
            href={TFA_IOS_APP_URL}
            target={LinkTarget.blank}
          >
            iOS
          </Link>{" "}
          or Authenticator for{" "}
          <Link
            color={currentColorScheme?.main?.accent}
            href={TFA_WIN_APP_URL}
            target={LinkTarget.blank}
          >
            Windows Phone
          </Link>{" "}
          .
        </Trans>

        <Text className="set-app-text">
          <Trans
            t={t}
            i18nKey="SetAppInstallDescription"
            ns="Confirm"
            key={secretKey}
          >
            To connect your apllication scan the QR code or manually enter your
            secret key <strong>{{ secretKey }}</strong> then enter 6-digit code
            from your application in the field below.
          </Trans>
        </Text>
      </Box>
      <FormWrapper id="tfa-activation-form">
        <Box
          displayProp="flex"
          flexDirection="column"
          className="app-code-wrapper"
        >
          <div className="qrcode-wrapper">
            <img src={qrCode} height="180px" width="180px" alt="QR-code" />
          </div>
          <Box className="app-code-input">
            <FieldContainer
              labelVisible={false}
              hasError={error ? true : false}
              errorMessage={error}
            >
              <TextInput
                id="code"
                name="code"
                type={InputType.text}
                size={InputSize.large}
                scale
                isAutoFocussed
                tabIndex={1}
                placeholder={t("EnterCodePlaceholder")}
                isDisabled={isLoading}
                maxLength={6}
                onChange={onChangeInput}
                value={code}
                hasError={error ? true : false}
                onKeyDown={onKeyPress}
              />
            </FieldContainer>
          </Box>
          <Box className="app-code-continue-btn">
            <Button
              scale
              primary
              size={ButtonSize.medium}
              tabIndex={3}
              label={
                isLoading ? t("Common:LoadingProcessing") : t("SetAppButton")
              }
              isDisabled={!code.length || isLoading}
              isLoading={isLoading}
              onClick={onSubmit}
            />
          </Box>
        </Box>
      </FormWrapper>
    </>
  );
};

export default TfaActivationForm;
