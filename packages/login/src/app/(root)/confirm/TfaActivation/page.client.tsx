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

import DownloadSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";
import ScanSvgUrl from "PUBLIC_DIR/images/scan.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.toast.react.svg?url";

import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import Image from "next/image";

import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/ui-kit/components/text";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

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
import { getBrandName } from "@docspace/shared/constants/brands";

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
  const session = searchParams?.get("session") ? true : false;

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

      await validateTfaCode(code, confirmHeader, session);

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
          {t("TfaSubTitle", { productName: getBrandName("ProductName") })}
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
                      dataTestId="android_app_link"
                    />
                  ),
                  4: (
                    <Link
                      key="ios-link"
                      color="accent"
                      href={TFA_IOS_APP_URL}
                      target={LinkTarget.blank}
                      dataTestId="ios_app_link"
                    />
                  ),
                  8: (
                    <Link
                      key="windows-link"
                      color="accent"
                      href={TFA_WIN_APP_URL}
                      target={LinkTarget.blank}
                      dataTestId="win_app_link"
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
                  1: <strong key="secret-key-strong" />,
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
            <Image src={qrCode} height={180} width={180} alt="QR-code" />
          </div>
          <div className="app-code-input">
            <FieldContainer
              labelVisible={false}
              hasError={!!error}
              errorMessage={error}
              dataTestId="app_code_field"
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
                testId="app_code_input"
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
              testId="app_connect_button"
            />
          </div>
        </div>
      </FormWrapper>
    </>
  );
};

export default TfaActivationForm;
