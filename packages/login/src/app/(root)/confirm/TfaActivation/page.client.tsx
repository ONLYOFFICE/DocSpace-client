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

import DownloadSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import ScanSvgUrl from "PUBLIC_DIR/images/scan.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.toast.react.svg?url";

import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Link, LinkTarget } from "@docspace/shared/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/shared/components/text";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { IconButton } from "@docspace/shared/components/icon-button";

import { checkConfirmLink } from "@docspace/shared/api/user";
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
import { useSearchParams } from "next/navigation";

type TfaActivationFormProps = {
  secretKey: string;
  qrCode: string;
};

const TfaActivationForm = ({ secretKey, qrCode }: TfaActivationFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);

  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { confirmHeader = null } = linkData;

  const linkUrlData = searchParams?.get("linkData");

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

      await validateTfaCode(code, confirmHeader);

      let confirmData = "";
      try {
        if (linkUrlData) confirmData = JSON.parse(atob(linkUrlData));
      } catch (e) {
        console.error("parse error", e);
      }

      try {
        if (confirmData) await checkConfirmLink(confirmData);
      } catch (e) {
        console.error(e);
      }

      sessionStorage.setItem(OPEN_BACKUP_CODES_DIALOG, "true");
      window.location.href = proxyBaseUrl.current;
    } catch (e) {
      const knownError = e as TError;
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
      <div className="set-app-description">
        <Text isBold fontSize="18px" className="set-app-title">
          {t("TfaTitle")}
        </Text>
        <Text className="set-app-subtitle">
          {t("TfaSubTitle", { productName: t("Common:ProductName") })}
        </Text>

        <div className="description">
          <div className="description-item">
            <div className="icon-container">
              <IconButton
                color="accent"
                iconName={DownloadSvgUrl}
                size={16}
                isDisabled
                isFill
              />
            </div>
            <div className="description-text">
              <Text fontWeight={600}>{t("GetSuitableApp")}</Text>
              <Trans
                t={t}
                i18nKey="GetSuitableAppDescription"
                ns="Confirm"
                components={{
                  1: (
                    <Link
                      key="android-link"
                      color="accent"
                      href={TFA_ANDROID_APP_URL}
                      target={LinkTarget.blank}
                    />
                  ),
                  4: (
                    <Link
                      key="ios-link"
                      color="accent"
                      href={TFA_IOS_APP_URL}
                      target={LinkTarget.blank}
                    />
                  ),
                  8: (
                    <Link
                      key="windows-link"
                      color="accent"
                      href={TFA_WIN_APP_URL}
                      target={LinkTarget.blank}
                    />
                  ),
                }}
              />
            </div>
          </div>
          <div className="description-item">
            <div className="icon-container">
              <IconButton
                color="accent"
                iconName={ScanSvgUrl}
                size={16}
                isDisabled
                isFill
              />
            </div>
            <div className="description-text">
              <Text fontWeight={600}>{t("ConnectApp")}</Text>
              <Trans
                t={t}
                i18nKey="ConnectAppDescription"
                ns="Confirm"
                values={{
                  secretKey,
                }}
                components={{
                  1: <strong />,
                }}
              />
            </div>
          </div>
          <div className="description-item">
            <div className="icon-container">
              <IconButton
                color="accent"
                iconName={CheckSvgUrl}
                size={16}
                isDisabled
                isFill
              />
            </div>
            <div className="description-text">
              <Text fontWeight={600}>{t("VerifyConnection")}</Text>
              <Text>{t("VerifyConnectionDescription")}</Text>
            </div>
          </div>
        </div>
      </div>
      <FormWrapper id="tfa-activation-form">
        <div className="app-code-wrapper">
          <div className="qrcode-wrapper">
            <img src={qrCode} height="180px" width="180px" alt="QR-code" />
          </div>
          <div className="app-code-input">
            <FieldContainer
              labelVisible={false}
              hasError={!!error}
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
                hasError={!!error}
                onKeyDown={onKeyPress}
              />
            </FieldContainer>
          </div>
          <div>
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
          </div>
        </div>
      </FormWrapper>
    </>
  );
};

export default TfaActivationForm;
