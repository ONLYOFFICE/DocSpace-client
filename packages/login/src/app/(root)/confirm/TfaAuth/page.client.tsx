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

import { useTranslation } from "react-i18next";
import { ChangeEvent, useContext, useState } from "react";

import { validateTfaCode } from "@docspace/shared/api/settings";
import { checkConfirmLink } from "@docspace/shared/api/user";

import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { FieldContainer } from "@docspace/shared/components/field-container";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ButtonKeys } from "@docspace/shared/enums";

import { TError } from "@/types";
import { ConfirmRouteContext } from "@/components/ConfirmRoute";
import { useSearchParams } from "next/navigation";
import { PUBLIC_STORAGE_KEY } from "@docspace/shared/constants";

type TfaAuthFormProps = {
  defaultPage?: string;
};

const TfaAuthForm = ({ defaultPage = "/" }: TfaAuthFormProps) => {
  const { linkData } = useContext(ConfirmRouteContext);
  const { t } = useTranslation(["Confirm", "Common"]);

  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { confirmHeader = null } = linkData;

  const linkUrlData = searchParams?.get("linkData");
  const isPublicAuth = searchParams?.get("publicAuth");

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

      const referenceUrl = sessionStorage.getItem("referenceUrl");

      if (referenceUrl) {
        sessionStorage.removeItem("referenceUrl");
      }

      if (isPublicAuth) {
        localStorage.setItem(PUBLIC_STORAGE_KEY, "true");
        window.close();
      }

      window.location.replace(referenceUrl || defaultPage);
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
