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

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { inject, observer } from "mobx-react";
import api from "@docspace/shared/api";
import { Text } from "@docspace/shared/components/text";
import { FormWrapper } from "@docspace/shared/components/form-wrapper";
import { EmailInput } from "@docspace/shared/components/email-input";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { IconButton } from "@docspace/shared/components/icon-button";
import { ComboBox } from "@docspace/shared/components/combobox";
import { Link } from "@docspace/shared/components/link";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import ErrorContainer from "@docspace/shared/components/error-container/ErrorContainer";
import { FileInput } from "@docspace/shared/components/file-input";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import { Loader } from "@docspace/shared/components/loader";

import withCultureNames from "SRC_DIR/HOCs/withCultureNames";

import {
  createPasswordHash,
  convertLanguage,
} from "@docspace/shared/utils/common";
import { setCookie } from "@docspace/shared/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { COOKIE_EXPIRATION_YEAR } from "@docspace/shared/constants";
import { LANGUAGE } from "@docspace/shared/constants";
import { EmailSettings } from "@docspace/shared/utils";
import BetaBadge from "../../components/BetaBadgeWrapper";

import {
  Wrapper,
  WizardContainer,
  StyledLink,
  StyledInfo,
  StyledAcceptTerms,
  StyledContent,
} from "./StyledWizard";
import { getUserTimezone, getSelectZone } from "./timezonesHelper";
import PortalLogo from "@docspace/shared/components/portal-logo/PortalLogo";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";
import {
  DEFAULT_SELECT_TIMEZONE,
  DEFAULT_SELECT_LANGUAGE,
} from "SRC_DIR/helpers/constants";
import { isMobile } from "@docspace/shared/utils";

const emailSettings = new EmailSettings();
emailSettings.allowDomainPunycode = true;

const Wizard = (props) => {
  const {
    passwordSettings,
    isWizardLoaded,
    setIsWizardLoaded,
    wizardToken,

    getPortalPasswordSettings,
    getMachineName,
    getIsRequiredLicense,
    getPortalTimezones,
    machineName,
    licenseUrl,
    theme,
    cultureNames,
    culture,
    hashSettings,

    setWizardComplete,
    isLicenseRequired,
    setLicense,
    licenseUpload,
    resetLicenseUploaded,
  } = props;

  const navigate = useNavigate();
  const { t } = useTranslation(["Wizard", "Common"]);

  const [email, setEmail] = useState("");
  const [hasErrorEmail, setHasErrorEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [hasErrorPass, setHasErrorPass] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasErrorAgree, setHasErrorAgree] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [timezones, setTimezones] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(null);
  const [isCreated, setIsCreated] = useState(false);
  const [errorInitWizard, setErrorInitWizard] = useState(false);
  const [hasErrorLicense, setHasErrorLicense] = useState(false);
  const [invalidLicense, setInvalidLicense] = useState(false);

  const refPassInput = useRef(null);

  const userCulture = window.navigator
    ? window.navigator.language ||
      window.navigator.systemLanguage ||
      window.navigator.userLanguage
    : culture;

  const convertedCulture = convertLanguage(userCulture);

  const mapTimezonesToArray = (timezones) => {
    return timezones.map((timezone) => {
      return { key: timezone.id, label: timezone.displayName };
    });
  };

  const fetchData = async () => {
    await axios
      .all([
        getPortalPasswordSettings(wizardToken),
        getMachineName(wizardToken),
        getIsRequiredLicense(),
        getPortalTimezones(wizardToken).then((data) => {
          const userTimezone = getUserTimezone();
          const zones = mapTimezonesToArray(data);
          const select = getSelectZone(zones, userTimezone);

          setTimezones(zones);

          if (select.length === 0) {
            setSelectedTimezone(DEFAULT_SELECT_TIMEZONE);
          } else {
            setSelectedTimezone(select[0]);
          }
        }),
      ])
      .then(() => {
        const select = cultureNames.filter(
          (lang) => lang.key === convertedCulture,
        );

        if (select.length === 0) {
          setSelectedLanguage(DEFAULT_SELECT_LANGUAGE);
        } else {
          setSelectedLanguage(select[0]);
        }
        setIsWizardLoaded(true);
      })
      .catch((error) => {
        let errorMessage = "";
        if (typeof err === "object") {
          errorMessage =
            error?.response?.data?.error?.message ||
            error?.statusText ||
            error?.message ||
            "";
        } else {
          errorMessage = error;
        }
        console.error(errorMessage);
        setErrorInitWizard(true);
      });
  };

  useEffect(() => {
    if (!wizardToken)
      navigate(combineUrl(window.ClientConfig?.proxy?.url, "/"));
    else fetchData();
  }, [wizardToken]);

  const onEmailChangeHandler = (result) => {
    console.log(result);
    setEmail(result.value);
    setHasErrorEmail(!result.isValid);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const isValidPassHandler = (value) => {
    setHasErrorPass(!value);
  };

  const generatePassword = () => {
    if (isCreated) return;

    refPassInput.current.onGeneratePassword();
  };

  const onLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
  };

  const onTimezoneSelect = (timezone) => {
    setSelectedTimezone(timezone);
  };

  const onLicenseFileHandler = (file) => {
    if (licenseUpload) resetLicenseUploaded();
    setHasErrorLicense(false);
    setInvalidLicense(false);

    let fd = new FormData();
    fd.append("files", file);

    setLicense(wizardToken, fd).catch((e) => {
      console.error(e);
      setHasErrorLicense(true);
      setInvalidLicense(true);
    });
  };

  const onAgreeTermsChange = () => {
    if (hasErrorAgree && !agreeTerms) setHasErrorAgree(false);
    setAgreeTerms(!agreeTerms);
  };

  const validateFields = () => {
    let anyError = false;
    const emptyEmail = email.trim() === "";
    const emptyPassword = password.trim() === "";

    if (emptyEmail || emptyPassword) {
      emptyEmail && setHasErrorEmail(true);
      emptyPassword && setHasErrorPass(true);
      anyError = true;
    }

    if (!agreeTerms) {
      setHasErrorAgree(true);
      anyError = true;
    }

    if (isLicenseRequired && licenseUpload === null) {
      setHasErrorLicense(true);
      anyError = true;
    }

    if (anyError || hasErrorEmail || hasErrorPass) return false;

    return true;
  };

  const onContinueClick = async () => {
    if (!validateFields()) return;

    setIsCreated(true);

    const emailTrim = email.trim();
    const analytics = true;
    const hash = createPasswordHash(password, hashSettings);

    try {
      await api.settings.setPortalOwner(
        emailTrim,
        hash,
        selectedLanguage.key,
        selectedTimezone.key,
        wizardToken,
        analytics,
      );

      setCookie(LANGUAGE, selectedLanguage.key, {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

      setWizardComplete();
    } catch (error) {
      console.error(error);
      setIsCreated(false);
    }
  };

  const onClickRetry = () => {
    window.location.href = "/";
  };

  if (!isWizardLoaded)
    return <Loader className="pageLoader" type="rombs" size="40px" />;

  if (errorInitWizard)
    return (
      <ErrorContainer
        headerText={t("Common:SomethingWentWrong")}
        bodyText={t("ErrorInitWizard")}
        buttonText={t("ErrorInitWizardButton")}
        onClickButton={onClickRetry}
      />
    );

  return (
    <Wrapper>
      <div className="bg-cover"></div>
      <Scrollbar id="customScrollBar">
        <StyledContent>
          <WizardContainer>
            <PortalLogo className="portal-logo" />
            <Text
              as="div"
              fontWeight={700}
              fontSize="23px"
              className="welcome-text"
            >
              {t("WelcomeTitle", { productName: t("Common:ProductName") })}
            </Text>
            <FormWrapper>
              <Text fontWeight={600} fontSize="16px" className="form-header">
                {t("Desc", { productName: t("Common:ProductName") })}
              </Text>
              <FieldContainer
                className="wizard-field"
                isVertical={true}
                labelVisible={false}
                hasError={hasErrorEmail}
                errorMessage={t("ErrorEmail")}
              >
                <EmailInput
                  name="wizard-email"
                  tabIndex={1}
                  size="large"
                  scale={true}
                  placeholder={t("Common:Email")}
                  emailSettings={emailSettings}
                  hasError={hasErrorEmail}
                  onValidateInput={onEmailChangeHandler}
                  isDisabled={isCreated}
                />
              </FieldContainer>

              <FieldContainer
                className="wizard-field password-field"
                isVertical={true}
                labelVisible={false}
                hasError={hasErrorPass}
                errorMessage={t("ErrorPassword")}
              >
                <PasswordInput
                  ref={refPassInput}
                  tabIndex={2}
                  size="large"
                  scale={true}
                  inputValue={password}
                  passwordSettings={passwordSettings}
                  isDisabled={isCreated}
                  placeholder={t("Common:Password")}
                  hideNewPasswordButton={true}
                  isDisableTooltip={true}
                  isTextTooltipVisible={false}
                  hasError={hasErrorPass}
                  onChange={onChangePassword}
                  autoComplete="current-password"
                  onValidateInput={isValidPassHandler}
                />
              </FieldContainer>
              <StyledLink>
                <IconButton
                  size="12"
                  iconName={RefreshReactSvgUrl}
                  onClick={generatePassword}
                />
                <Link
                  className="generate-password-link"
                  type="action"
                  fontWeight={600}
                  isHovered={true}
                  onClick={generatePassword}
                >
                  {t("GeneratePassword")}
                </Link>
              </StyledLink>

              {isLicenseRequired && (
                <FieldContainer
                  className="license-filed"
                  isVertical={true}
                  labelVisible={false}
                  hasError={hasErrorLicense}
                  errorMessage={
                    invalidLicense
                      ? t("ErrorLicenseBody")
                      : t("ErrorUploadLicenseFile")
                  }
                >
                  <FileInput
                    scale
                    size="large"
                    accept={[".lic"]}
                    placeholder={t("PlaceholderLicense")}
                    onInput={onLicenseFileHandler}
                    hasError={hasErrorLicense}
                  />
                </FieldContainer>
              )}
              <StyledInfo>
                <Text color="#A3A9AE" fontWeight={400}>
                  {t("Common:Domain")}
                </Text>
                <Text fontWeight={600} className="machine-name">
                  {machineName}
                </Text>
              </StyledInfo>
              <StyledInfo>
                <Text color="#A3A9AE" fontWeight={400}>
                  {t("Common:Language")}
                </Text>
                <div className="wrapper__language-selector">
                  <ComboBox
                    withoutPadding
                    directionY="both"
                    options={cultureNames || []}
                    selectedOption={selectedLanguage || {}}
                    onSelect={onLanguageSelect}
                    isDisabled={isCreated}
                    scaled={isMobile()}
                    scaledOptions={false}
                    size="content"
                    showDisabledItems={true}
                    dropDownMaxHeight={364}
                    manualWidth="250px"
                    isDefaultMode={!isMobile()}
                    withBlur={isMobile()}
                    fillIcon={false}
                    modernView={true}
                  />
                  {selectedLanguage?.isBeta && (
                    <BetaBadge withOutFeedbackLink place="bottom" />
                  )}
                </div>
              </StyledInfo>
              <StyledInfo>
                <Text color="#A3A9AE" fontWeight={400}>
                  {t("Timezone")}
                </Text>
                <ComboBox
                  textOverflow
                  withoutPadding
                  directionY="both"
                  options={timezones || []}
                  selectedOption={selectedTimezone || {}}
                  onSelect={onTimezoneSelect}
                  isDisabled={isCreated}
                  scaled={isMobile()}
                  scaledOptions={false}
                  size="content"
                  showDisabledItems={true}
                  dropDownMaxHeight={364}
                  manualWidth="350px"
                  isDefaultMode={!isMobile()}
                  withBlur={isMobile()}
                  fillIcon={false}
                  modernView={true}
                />
              </StyledInfo>

              <StyledAcceptTerms>
                <Checkbox
                  className="wizard-checkbox"
                  id="license"
                  name="confirm"
                  label={t("License")}
                  isChecked={agreeTerms}
                  onChange={onAgreeTermsChange}
                  isDisabled={isCreated}
                  hasError={hasErrorAgree}
                />
                <Link
                  type="page"
                  color={
                    hasErrorAgree
                      ? theme.checkbox.errorColor
                      : theme.client.wizard.linkColor
                  }
                  fontSize="13px"
                  target="_blank"
                  href={licenseUrl}
                >
                  {t("LicenseLink")}
                </Link>
              </StyledAcceptTerms>

              <Button
                size="medium"
                scale={true}
                primary
                label={t("Common:ContinueButton")}
                isLoading={isCreated}
                onClick={onContinueClick}
              />
            </FormWrapper>
          </WizardContainer>
        </StyledContent>
      </Scrollbar>
    </Wrapper>
  );
};

export default inject(({ authStore, settingsStore, wizardStore }) => {
  const {
    passwordSettings,
    wizardToken,
    timezone,
    licenseUrl,
    hashSettings,
    setWizardComplete,
    getPortalTimezones,
    getPortalPasswordSettings,
    theme,
  } = settingsStore;

  const { language } = authStore;
  const {
    isWizardLoaded,
    machineName,
    isLicenseRequired,
    licenseUpload,
    setIsWizardLoaded,
    getMachineName,
    getIsRequiredLicense,

    setLicense,
    resetLicenseUploaded,
  } = wizardStore;

  return {
    theme,
    isLoaded: authStore.isLoaded,
    culture: language,
    wizardToken,
    passwordSettings,
    timezone,
    licenseUrl,
    hashSettings,
    isWizardLoaded,
    machineName,
    isLicenseRequired,
    licenseUpload,
    setWizardComplete,
    getPortalPasswordSettings,
    getPortalTimezones,
    setIsWizardLoaded,
    getMachineName,
    getIsRequiredLicense,

    setLicense,
    resetLicenseUploaded,
  };
})(withCultureNames(observer(Wizard)));
