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
import DocspaceLogo from "../../../DocspaceLogo";
import { StyledPage, StyledContent } from "./StyledConfirm";

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
  const { t, loginWithCode, loginWithCodeAndCookie } = props;

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
        await loginWithCode(user, hash, code);
      } else {
        await loginWithCodeAndCookie(code, linkData.confirmHeader);
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

export default inject(({ auth, confirm }) => ({
  setIsLoaded: confirm.setIsLoaded,
  setIsLoading: confirm.setIsLoading,
  loginWithCode: auth.loginWithCode,
  loginWithCodeAndCookie: auth.tfaStore.loginWithCodeAndCookie,
  defaultPage: auth.settingsStore.defaultPage,
}))(withTranslation(["Confirm", "Common"])(observer(TfaAuthFormWrapper)));
