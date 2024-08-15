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

import React, { useCallback, useEffect, useState } from "react";
import { Trans, withTranslation } from "react-i18next";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import { Box } from "@docspace/shared/components/box";
import withLoader from "../withLoader";
import { toastr } from "@docspace/shared/components/toast";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import { mobile, tablet } from "@docspace/shared/utils";
import { Link } from "@docspace/shared/components/link";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import { StyledPage, StyledContent } from "./StyledConfirm";
import {
  getTfaSecretKeyAndQR,
  validateTfaCode,
} from "@docspace/shared/api/settings";
import { loginWithTfaCode } from "@docspace/shared/api/user";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

const StyledForm = styled(Box)`
  margin: 56px auto;
  display: flex;
  flex: 1fr 1fr;
  gap: 80px;
  flex-direction: row;
  justify-content: center;

  @media ${tablet} {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  @media ${mobile} {
    margin: 0 auto;
    flex-direction: column;
    gap: 0px;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-left: 8px;`
        : `padding-right: 8px;`}
  }

  .app-code-wrapper {
    width: 100%;

    @media ${tablet} {
      flex-direction: column;
    }
  }

  .portal-logo {
    padding-bottom: 40px;

    @media ${tablet} {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .set-app-description {
    width: 100%;
    max-width: 500px;

    .portal-logo {
      margin: 0 auto;
      max-width: 386px;
      height: 44px;
    }
  }

  .set-app-title {
    margin-bottom: 14px;
  }

  .set-app-text {
    margin-top: 14px;
  }

  .qrcode-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px 80px;
    border-radius: 6px;
    margin-bottom: 32px;

    @media ${mobile} {
      display: none;
    }
  }

  .app-code-continue-btn {
    margin-top: 8px;
  }
`;
const PROXY_BASE_URL = combineUrl(window.ClientConfig?.proxy?.url, "/profile");

const TfaActivationForm = withLoader((props) => {
  const {
    t,
    secretKey,
    qrCode,

    location,
    currentColorScheme,
  } = props;
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    try {
      const { user, hash } = (location && location.state) || {};
      const { linkData } = props;

      setIsLoading(true);

      if (user && hash) {
        await loginWithTfaCode(user, hash, code);
      } else {
        await validateTfaCode(code, linkData.confirmHeader);
      }

      // const referenceUrl = sessionStorage.getItem("referenceUrl");

      // if (referenceUrl) {
      //  sessionStorage.removeItem("referenceUrl");
      // }

      // window.location.replace(referenceUrl || defaultPage);
      navigate(PROXY_BASE_URL, {
        state: { openBackupCodesDialog: true },
      });
    } catch (err) {
      let errorMessage = "";
      if (typeof err === "object") {
        errorMessage =
          err?.response?.data?.error?.message ||
          err?.statusText ||
          err?.message ||
          "";
      } else {
        errorMessage = err;
      }
      setError(errorMessage);
      toastr.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyPress = (target) => {
    if (target.code === "Enter" || target.code === "NumpadEnter") onSubmit();
  };

  return (
    <StyledPage>
      <StyledContent>
        <StyledForm className="set-app-container">
          <Box className="set-app-description" marginProp="0 0 32px 0">
            <PortalLogo className="portal-logo" />
            <Text isBold fontSize="14px" className="set-app-title">
              {t("SetAppTitle")}
            </Text>

            <Trans
              t={t}
              i18nKey="SetAppDescription"
              ns="Confirm"
              productName={t("Common:ProductName")}
            >
              The two-factor authentication is enabled to provide additional
              portal security. Configure your authenticator application to
              continue work on the portal. For example you could use Google
              Authenticator for
              <Link
                color={currentColorScheme?.main?.accent}
                href={props.tfaAndroidAppUrl}
                target="_blank"
              >
                Android
              </Link>
              and{" "}
              <Link
                color={currentColorScheme?.main?.accent}
                href={props.tfaIosAppUrl}
                target="_blank"
              >
                iOS
              </Link>{" "}
              or Authenticator for{" "}
              <Link
                color={currentColorScheme?.main?.accent}
                href={props.tfaWinAppUrl}
                target="_blank"
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
                To connect your apllication scan the QR code or manually enter
                your secret key <strong>{{ secretKey }}</strong> then enter
                6-digit code from your application in the field below.
              </Trans>
            </Text>
          </Box>
          <FormWrapper>
            <Box
              displayProp="flex"
              flexDirection="column"
              className="app-code-wrapper"
            >
              <div className="qrcode-wrapper">
                <img
                  src={qrCode}
                  height="180px"
                  width="180px"
                  alt="QR-code"
                ></img>
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
                    type="text"
                    size="large"
                    scale
                    isAutoFocussed
                    tabIndex={1}
                    placeholder={t("EnterCodePlaceholder")}
                    isDisabled={isLoading}
                    maxLength={6}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError("");
                    }}
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
                  size="medium"
                  tabIndex={3}
                  label={
                    isLoading
                      ? t("Common:LoadingProcessing")
                      : t("SetAppButton")
                  }
                  isDisabled={!code.length || isLoading}
                  isLoading={isLoading}
                  onClick={onSubmit}
                />
              </Box>
            </Box>
          </FormWrapper>
        </StyledForm>
      </StyledContent>
    </StyledPage>
  );
});

const TfaActivationWrapper = (props) => {
  const { linkData, setIsLoaded, setIsLoading } = props;

  const [secretKey, setSecretKey] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState(null);

  const getSecretKeyAndQRAction = useCallback(async () => {
    try {
      setIsLoading(true);
      const confirmKey = linkData.confirmHeader;
      const res = await getTfaSecretKeyAndQR(confirmKey);
      const { manualEntryKey, qrCodeSetupImageUrl } = res;

      setSecretKey(manualEntryKey);
      setQrCode(qrCodeSetupImageUrl);
    } catch (e) {
      setError(e.error);
      toastr.error(e);
    }
    setIsLoaded(true);
    setIsLoading(false);
  });

  useEffect(() => {
    getSecretKeyAndQRAction();
  }, []);

  return error ? (
    <ErrorContainer bodyText={error} />
  ) : (
    <TfaActivationForm secretKey={secretKey} qrCode={qrCode} {...props} />
  );
};

export default inject(({ settingsStore, confirm, tfaStore }) => ({
  setIsLoaded: confirm.setIsLoaded,
  setIsLoading: confirm.setIsLoading,
  tfaAndroidAppUrl: tfaStore.tfaAndroidAppUrl,
  tfaIosAppUrl: tfaStore.tfaIosAppUrl,
  tfaWinAppUrl: tfaStore.tfaWinAppUrl,
  currentColorScheme: settingsStore.currentColorScheme,
}))(withTranslation(["Confirm", "Common"])(observer(TfaActivationWrapper)));
