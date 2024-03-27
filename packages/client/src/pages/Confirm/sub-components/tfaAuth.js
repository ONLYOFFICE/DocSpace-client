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

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import styled from "styled-components";
import { Button } from "@docspace/shared/components/button";
import { TextInput } from "@docspace/shared/components/text-input";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import { Box } from "@docspace/shared/components/box";
import { toastr } from "@docspace/shared/components/toast";
import withLoader from "../withLoader";
import { mobile } from "@docspace/shared/utils";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import DocspaceLogo from "../../../components/DocspaceLogoWrapper";
import { StyledPage, StyledContent } from "./StyledConfirm";
import { validateTfaCode } from "@docspace/shared/api/settings";
import { loginWithTfaCode } from "@docspace/shared/api/user";

const StyledForm = styled(Box)`
  margin: 56px auto;
  display: flex;
  flex-direction: column;
  flex: 1fr;

  @media ${mobile} {
    margin: 0 auto;
    width: 100%;
  }

  .docspace-logo {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 40px;
  }

  .app-code-wrapper {
    width: 100%;
  }

  .app-code-text {
    margin-bottom: 8px;
  }

  .app-code-continue-btn {
    margin-top: 8px;
  }
`;

const TfaAuthForm = withLoader((props) => {
  const { t } = props;

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();

  const onSubmit = async () => {
    try {
      const { user, hash } = (location && location.state) || {};
      const { linkData, defaultPage } = props;

      setIsLoading(true);

      if (user && hash) {
        await loginWithTfaCode(user, hash, code);
      } else {
        await validateTfaCode(code, linkData.confirmHeader);
      }

      const referenceUrl = sessionStorage.getItem("referenceUrl");

      if (referenceUrl) {
        sessionStorage.removeItem("referenceUrl");
      }

      window.location.replace(referenceUrl || defaultPage);
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
        <StyledForm className="app-code-container">
          <DocspaceLogo className="docspace-logo" />
          <FormWrapper>
            <Box className="app-code-description" marginProp="0 0 32px 0">
              <Text isBold fontSize="14px" className="app-code-text">
                {t("EnterAppCodeTitle")}
              </Text>
              <Text>{t("EnterAppCodeDescription")}</Text>
            </Box>
            <Box
              displayProp="flex"
              flexDirection="column"
              className="app-code-wrapper"
            >
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
                      : t("Common:ContinueButton")
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

const TfaAuthFormWrapper = (props) => {
  const { setIsLoaded, setIsLoading } = props;

  useEffect(() => {
    setIsLoaded(true);
    setIsLoading(false);
  }, []);

  return <TfaAuthForm {...props} />;
};

export default inject(({ settingsStore, confirm }) => ({
  setIsLoaded: confirm.setIsLoaded,
  setIsLoading: confirm.setIsLoading,

  defaultPage: settingsStore.defaultPage,
}))(withTranslation(["Confirm", "Common"])(observer(TfaAuthFormWrapper)));
