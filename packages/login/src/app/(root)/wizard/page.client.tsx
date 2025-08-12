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

import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { ChangeEvent, MouseEvent, useRef, useState, useMemo } from "react";

import {
  createPasswordHash,
  getSelectZone,
  mapCulturesToArray,
  mapTimezonesToArray,
  setLanguageForUnauthorized,
  setTimezoneForUnauthorized,
} from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { EmailInput, TValidate } from "@docspace/shared/components/email-input";
import {
  COOKIE_EXPIRATION_YEAR,
  LANGUAGE,
  TIMEZONE,
} from "@docspace/shared/constants";
import { EmailSettings } from "@docspace/shared/utils";
import {
  PasswordInput,
  PasswordInputHandle,
} from "@docspace/shared/components/password-input";
import { FileInput } from "@docspace/shared/components/file-input";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link, LinkTarget, LinkType } from "@docspace/shared/components/link";
import { setLicense } from "@docspace/shared/api/settings";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { BetaBadge } from "@docspace/shared/components/beta-badge";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import api from "@docspace/shared/api";
import { setCookie, deleteCookie } from "@docspace/shared/utils/cookie";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import useDeviceType from "@/hooks/useDeviceType";
import { DeviceType } from "@docspace/shared/enums";
import { Nullable } from "@docspace/shared/types";
import {
  TPasswordHash,
  TPasswordSettings,
  TPortalCultures,
  TTimeZone,
} from "@docspace/shared/api/settings/types";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg";

import { TError, TTimeZoneOption } from "@/types";
import { toastr } from "@docspace/shared/components/toast";
import {
  StyledAcceptTerms,
  StyledInfo,
  StyledLink,
  WizardContainer,
} from "./page.styled";

type WizardFormProps = {
  passwordSettings?: TPasswordSettings;
  machineName?: string;
  isRequiredLicense?: boolean;
  portalTimeZones?: TTimeZone[];
  portalCultures?: TPortalCultures;

  forumLinkUrl?: string;
  documentationEmail?: string;
  wizardToken?: string;
  passwordHash?: TPasswordHash;
  licenseUrl?: string;
  isAmi?: boolean;
  userTimeZone: string;
};

const emailSettings = new EmailSettings();
emailSettings.allowDomainPunycode = true;

function WizardForm(props: WizardFormProps) {
  const {
    licenseUrl,
    passwordSettings,
    machineName,
    isRequiredLicense,
    portalTimeZones,
    portalCultures,
    wizardToken,
    passwordHash,
    forumLinkUrl,
    documentationEmail,
    isAmi,
    userTimeZone,
  } = props;

  const [selectedTimezone, setSelectedTimezone] = useState<TTimeZoneOption>();

  const [email, setEmail] = useState("");
  const [hasErrorEmail, setHasErrorEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [hasErrorPass, setHasErrorPass] = useState(false);

  const [instanceId, setInstanceId] = useState("");
  const [hasErrorInstanceId, setHasErrorInstanceId] = useState(false);

  const [hasErrorLicense, setHasErrorLicense] = useState(false);
  const [invalidLicense, setInvalidLicense] = useState(false);
  const [licenseUpload, setLicenseUpload] = useState<Nullable<string>>(null);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasErrorAgree, setHasErrorAgree] = useState(false);

  const [isCreated, setIsCreated] = useState(false);

  const { t, i18n } = useTranslation(["Wizard", "Common"]);

  const theme = useTheme();
  const { currentDeviceType } = useDeviceType();

  const refPassInput = useRef<Nullable<PasswordInputHandle>>(null);

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const currCulture = i18n.language;

  const cultureNames = useMemo(() => {
    if (portalCultures) return mapCulturesToArray(portalCultures, true, i18n);
    return [];
  }, [portalCultures, i18n]);
  const currentCulture = cultureNames?.find((item) => item.key === currCulture);

  const zones = useMemo(() => {
    if (portalTimeZones) return mapTimezonesToArray(portalTimeZones);
    return [];
  }, [portalTimeZones]);
  const currentZone = getSelectZone(zones ?? [], userTimeZone)[0];

  const onEmailChangeHandler = (result: TValidate): undefined => {
    setHasErrorEmail(!result.isValid);
  };

  const onChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const isValidPassHandler = (progressScore: boolean) => {
    setHasErrorPass(!progressScore);
  };

  const generatePassword = (e: MouseEvent) => {
    if (isCreated) return;
    if (refPassInput.current === null) return;

    refPassInput.current.onGeneratePassword(e);
  };

  const onChangeInstanceId = (e: ChangeEvent<HTMLInputElement>) => {
    setInstanceId(e.target.value);
    setHasErrorInstanceId(e.target.value.trim() === "");
  };

  const onLanguageSelect = (lang: TOption) => {
    setLanguageForUnauthorized(lang.key.toString(), false);
    i18n.changeLanguage(lang.key.toString());
  };

  const onTimezoneSelect = (timezone: TOption) => {
    setSelectedTimezone({
      key: timezone.key,
      label: timezone.label ?? "",
    });
    setTimezoneForUnauthorized(timezone.key.toString());
  };

  const onLicenseFileHandler = async (file: File | File[]) => {
    if (licenseUpload) setLicenseUpload(null);
    setHasErrorLicense(false);
    setInvalidLicense(false);

    const fd = new FormData();
    fd.append("files", file as Blob);

    if (!wizardToken) return;

    try {
      const res = await setLicense(wizardToken, fd);
      setLicenseUpload(res);
    } catch (error) {
      const knownError = error as TError;
      let errorMessage: string = "";

      if (typeof knownError === "object") {
        errorMessage =
          knownError?.response?.data?.error?.message ||
          knownError?.statusText ||
          knownError?.message ||
          "";
      } else {
        errorMessage = knownError;
      }

      toastr.error(errorMessage);
      setHasErrorLicense(true);
      setInvalidLicense(true);
    }
  };

  const onAgreeTermsChange = () => {
    if (hasErrorAgree && !agreeTerms) setHasErrorAgree(false);
    setAgreeTerms(!agreeTerms);
  };

  const validateFields = () => {
    let anyError = false;
    const emptyEmail = email.trim() === "";
    const emptyPassword = password.trim() === "";
    const emptyInstanceId = instanceId.trim() === "";

    if (emptyEmail || emptyPassword) {
      emptyEmail && setHasErrorEmail(true);
      emptyPassword && setHasErrorPass(true);
      anyError = true;
    }

    if (isAmi && emptyInstanceId) {
      emptyInstanceId && setHasErrorInstanceId(true);
      anyError = true;
    }

    if (!agreeTerms) {
      setHasErrorAgree(true);
      anyError = true;
    }

    if (isRequiredLicense && licenseUpload === null) {
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
    const hash = createPasswordHash(password, passwordHash);
    const amiId = instanceId.trim();

    try {
      await api.settings.setPortalOwner(
        emailTrim,
        hash,
        currentCulture?.key || "en",
        selectedTimezone?.key || currentZone?.key,
        wizardToken,
        analytics,
        isAmi && amiId ? amiId : null,
      );

      setCookie(LANGUAGE, currentCulture?.key || "en", {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });
      deleteCookie(TIMEZONE);

      window.location.replace("/");
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

      toastr.error(errorMessage);
      console.error(errorMessage);
      setIsCreated(false);
    }
  };

  return (
    <WizardContainer>
      <Text fontWeight={600} fontSize="16px" className="form-header">
        {t("Wizard:Desc", { productName: t("Common:ProductName") })}
      </Text>
      <FieldContainer
        className="wizard-field"
        isVertical
        labelVisible={false}
        hasError={hasErrorEmail}
        errorMessage={t("ErrorEmail")}
        dataTestId="email_field_container"
      >
        <EmailInput
          name="wizard-email"
          tabIndex={1}
          size={InputSize.large}
          scale
          value={email}
          placeholder={t("Common:Email")}
          emailSettings={emailSettings}
          hasError={hasErrorEmail}
          onValidateInput={onEmailChangeHandler}
          isAutoFocussed
          onChange={onChangeEmail}
          isDisabled={isCreated}
          testId="email_input"
        />
      </FieldContainer>

      <FieldContainer
        className="wizard-field password-field"
        isVertical
        labelVisible={false}
        hasError={hasErrorPass}
        errorMessage={t("ErrorPassword")}
        dataTestId="password_field_container"
      >
        <PasswordInput
          ref={refPassInput}
          tabIndex={2}
          size={InputSize.large}
          scale
          inputValue={password}
          inputType={InputType.password}
          passwordSettings={passwordSettings}
          isDisabled={isCreated}
          placeholder={t("Common:Password")}
          isDisableTooltip
          hasError={hasErrorPass}
          onChange={onChangePassword}
          autoComplete="current-password"
          onValidateInput={isValidPassHandler}
        />
      </FieldContainer>

      <StyledLink>
        <IconButton
          size={12}
          iconNode={<RefreshReactSvgUrl />}
          onClick={generatePassword}
          dataTestId="generate_password_icon_button"
        />
        <Link
          className="generate-password-link"
          type={LinkType.action}
          fontWeight={600}
          isHovered
          onClick={generatePassword}
          dataTestId="generate_password_link"
        >
          {t("Common:GeneratePassword")}
        </Link>
      </StyledLink>

      {isAmi ? (
        <FieldContainer
          className="wizard-field instance-id-field"
          isVertical
          labelVisible={false}
          hasError={hasErrorInstanceId}
          errorMessage={t("ErrorInstanceId")}
          dataTestId="instance_id_field_container"
        >
          <TextInput
            id="instance-id"
            name="instance-id"
            type={InputType.text}
            size={InputSize.large}
            hasError={hasErrorInstanceId}
            value={instanceId}
            placeholder={t("Common:InstanceId")}
            scale
            tabIndex={3}
            isDisabled={isCreated}
            onChange={onChangeInstanceId}
            testId="instance_id_input"
          />
        </FieldContainer>
      ) : null}

      {isRequiredLicense ? (
        <FieldContainer
          className="license-filed"
          isVertical
          labelVisible={false}
          hasError={hasErrorLicense}
          errorMessage={
            invalidLicense ? t("ErrorLicenseBody") : t("ErrorUploadLicenseFile")
          }
          dataTestId="license_field_container"
        >
          <FileInput
            scale
            size={InputSize.large}
            accept={[".lic"]}
            placeholder={t("PlaceholderLicense")}
            onInput={onLicenseFileHandler}
            hasError={hasErrorLicense}
            isDisabled={isCreated}
            data-test-id="license_file_input"
          />
        </FieldContainer>
      ) : null}

      <StyledInfo>
        <Text className="text" fontWeight={400}>
          {t("Common:Domain")}
        </Text>
        <Text fontWeight={600} className="machine-name">
          {machineName}
        </Text>
      </StyledInfo>

      <StyledInfo>
        <Text className="text" fontWeight={400}>
          {t("Common:Language")}
        </Text>
        <div className="wrapper__language-selector">
          <ComboBox
            withoutPadding
            directionY="both"
            options={cultureNames ?? []}
            selectedOption={currentCulture as TOption}
            onSelect={onLanguageSelect}
            isDisabled={isCreated}
            scaled={isMobileView}
            scaledOptions={false}
            size={ComboBoxSize.content}
            showDisabledItems
            dropDownMaxHeight={364}
            manualWidth="250px"
            isDefaultMode={!isMobileView}
            withBlur={isMobileView}
            fillIcon={false}
            modernView
            dataTestId="wizard_language_combobox"
            dropDownTestId="wizard_language_dropdown"
          />
          {currentCulture &&
          "isBeta" in currentCulture &&
          currentCulture.isBeta ? (
            <BetaBadge
              withOutFeedbackLink
              place="bottom"
              forumLinkUrl={forumLinkUrl}
              currentDeviceType={currentDeviceType}
              documentationEmail={documentationEmail}
            />
          ) : null}
        </div>
      </StyledInfo>

      <StyledInfo>
        <Text className="text" fontWeight={400}>
          {t("Timezone")}
        </Text>
        <ComboBox
          textOverflow
          withoutPadding
          directionY="both"
          options={zones ?? []}
          selectedOption={selectedTimezone ?? currentZone}
          onSelect={onTimezoneSelect}
          isDisabled={isCreated}
          scaled={isMobileView}
          scaledOptions={false}
          size={ComboBoxSize.content}
          showDisabledItems
          dropDownMaxHeight={364}
          manualWidth="350px"
          isDefaultMode={!isMobileView}
          withBlur={isMobileView}
          fillIcon={false}
          modernView
          dataTestId="timezone_combobox"
          dropDownTestId="timezone_dropdown"
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
          truncate={false}
          dataTestId="agree_terms_checkbox"
        />
        <Link
          type={LinkType.page}
          color={
            hasErrorAgree
              ? theme.checkbox.errorColor
              : theme.currentColorScheme?.main.accent
          }
          fontSize="13px"
          target={LinkTarget.blank}
          href={licenseUrl}
          dataTestId="license_agreements_link"
        >
          {t("LicenseLink")}
        </Link>
      </StyledAcceptTerms>

      <Button
        size={ButtonSize.medium}
        scale
        primary
        label={t("Common:ContinueButton")}
        isLoading={isCreated}
        onClick={onContinueClick}
        testId="continue_button"
      />
    </WizardContainer>
  );
}

export default WizardForm;
