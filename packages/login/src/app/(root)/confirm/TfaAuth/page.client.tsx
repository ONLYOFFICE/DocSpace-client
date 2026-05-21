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

import { useTranslation } from "react-i18next";
import { ChangeEvent, useContext, useState } from "react";

import { validateTfaCode } from "@docspace/shared/api/settings";
import { checkConfirmLink } from "@docspace/shared/api/user";

import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ButtonKeys } from "@docspace/shared/enums";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { useSearchParams } from "next/navigation";
import { PUBLIC_STORAGE_KEY } from "@docspace/shared/constants";

const TfaAuthForm = () => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);

  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { confirmHeader = null } = linkData;

  const linkUrlData = searchParams?.get("linkData");
  const isPublicAuth = searchParams?.get("publicAuth");
  const session = searchParams?.get("session") ? true : false;

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

      const referenceUrl = sessionStorage.getItem("referenceUrl");

      if (referenceUrl) {
        sessionStorage.removeItem("referenceUrl");
      }

      if (isPublicAuth) {
        localStorage.setItem(PUBLIC_STORAGE_KEY, "true");
        window.close();
      }

      window.location.replace(referenceUrl || "/");
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
      <div className="app-code-description">
        <Text isBold fontSize="14px" className="app-code-text">
          {t("EnterAppCodeTitle")}
        </Text>
        <Text>{t("EnterAppCodeDescription")}</Text>
      </div>
      <div className="app-code-wrapper">
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
              testId="app_code_input"
            />
          </FieldContainer>
        </div>
        <div className="app-code-continue-btn">
          <Button
            scale
            primary
            size={ButtonSize.medium}
            tabIndex={3}
            label={
              isLoading
                ? t("Common:LoadingProcessing")
                : t("Common:ContinueButton")
            }
            isDisabled={!code.length || isLoading}
            isLoading={isLoading}
            onClick={onSubmit}
            testId="app_code_continue_button"
          />
        </div>
      </div>
    </>
  );
};

export default TfaAuthForm;
