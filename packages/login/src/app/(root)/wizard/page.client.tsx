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

"use client";

import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";

import {
  convertLanguage,
  createPasswordHash,
  getSelectZone,
  getUserTimezone,
  mapCulturesToArray,
  mapTimezonesToArray,
} from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { EmailInput, TValidate } from "@docspace/shared/components/email-input";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
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
import { setCookie } from "@docspace/shared/utils/cookie";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import useDeviceType from "@/hooks/useDeviceType";
import { DeviceType } from "@docspace/shared/enums";
import { Nullable } from "@docspace/shared/types";
import {
  TPasswordHash,
  TPasswordSettings,
  TPortalCultures,
  TTimeZone,
} from "@docspace/shared/api/settings/types";

import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";

import { TCulturesOption, TError, TTimeZoneOption } from "@/types";
import {
  DEFAULT_SELECT_LANGUAGE,
  DEFAULT_SELECT_TIMEZONE,
} from "@/utils/constants";

import {
  StyledAcceptTerms,
  StyledInfo,
  StyledLink,
  WizardContainer,
} from "./page.styled";
import { toastr } from "@docspace/shared/components/toast";

type WizardFormProps = {
  passwordSettings?: TPasswordSettings;
  machineName?: string;
  isRequiredLicense?: boolean;
  portalTimeZones?: TTimeZone[];
  portalCultures?: TPortalCultures;

  forumLink?: string;
  documentationEmail?: string;
  culture?: string;
  wizardToken?: string;
  passwordHash?: TPasswordHash;
  licenseUrl?: string;
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
    culture,
    wizardToken,
    passwordHash,
    forumLink,
    documentationEmail,
  } = props;

  const [selectedTimezone, setSelectedTimezone] = useState<TTimeZoneOption>(
    DEFAULT_SELECT_TIMEZONE,
  );
  const [selectedLanguage, setSelectedLanguage] = useState<TCulturesOption>(
    DEFAULT_SELECT_LANGUAGE,
  );
  const [cultures, setCultures] = useState<TOption[]>();
  const [timezones, setTimezones] = useState<TOption[]>();

  const [email, setEmail] = useState("");
  const [hasErrorEmail, setHasErrorEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [hasErrorPass, setHasErrorPass] = useState(false);
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

  const [userCulture, setUserCulture] = useState("en");

  const convertedCulture = convertLanguage(userCulture);

  useEffect(() => {
    setUserCulture(
      window.navigator ? window.navigator.language : culture ?? "en",
    );
  }, [culture]);

  useEffect(() => {
    if (portalTimeZones) {
      const userTimezone = getUserTimezone();
      const zones = mapTimezonesToArray(portalTimeZones);
      const select = getSelectZone(zones, userTimezone);
      setTimezones(zones);

      if (select.length === 0) {
        setSelectedTimezone(DEFAULT_SELECT_TIMEZONE);
      } else {
        setSelectedTimezone(select[0]);
      }
    }
  }, [portalTimeZones]);

  useEffect(() => {
    if (portalCultures) {
      const cultures = mapCulturesToArray(portalCultures, true, i18n);
      const select = cultures.filter((lang) => lang.key === convertedCulture);
      setCultures(
        cultures.map((culture) => ({
          key: culture.key,
          label: "label" in culture ? culture.label : "",
          icon: culture.icon,
        })),
      );

      if (select.length === 0) {
        setSelectedLanguage(DEFAULT_SELECT_LANGUAGE);
      } else {
        const culture = select[0];
        setSelectedLanguage({
          key: culture.key,
          label: "label" in culture ? culture.label : "",
          icon: culture.icon,
        });
      }
    }
  }, [convertedCulture, i18n, portalCultures]);

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

  const onLanguageSelect = (lang: TOption) => {
    const cultures = mapCulturesToArray(portalCultures!, true, i18n);
    const select = cultures.filter((culture) => culture.key === lang.key);
    if (select.length === 0) {
      setSelectedLanguage(DEFAULT_SELECT_LANGUAGE);
    } else {
      const culture = select[0];
      setSelectedLanguage({
        key: culture.key,
        label: "label" in culture ? culture.label : "",
        icon: culture.icon,
      });
    }
  };

  const onTimezoneSelect = (timezone: TOption) => {
    setSelectedTimezone({
      key: timezone.key,
      label: timezone.label ?? "",
    });
  };

  const onLicenseFileHandler = async (file: File | File[]) => {
    if (licenseUpload) setLicenseUpload(null);
    setHasErrorLicense(false);
    setInvalidLicense(false);

    let fd = new FormData();
    fd.append("files", file as Blob);

    if (!wizardToken) return;

    try {
      const res = await setLicense(wizardToken, fd);
      setLicenseUpload(res);
    } catch (e) {
      console.error(e);
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

    if (emptyEmail || emptyPassword) {
      emptyEmail && setHasErrorEmail(true);
      emptyPassword && setHasErrorPass(true);
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

    try {
      await api.settings.setPortalOwner(
        emailTrim,
        hash,
        selectedLanguage.key,
        selectedTimezone.key,
        wizardToken,
        analytics,
      );

      setCookie(LANGUAGE, selectedLanguage.key.toString(), {
        "max-age": COOKIE_EXPIRATION_YEAR,
      });

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
        isVertical={true}
        labelVisible={false}
        hasError={hasErrorEmail}
        errorMessage={t("ErrorEmail")}
      >
        <EmailInput
          name="wizard-email"
          tabIndex={1}
          type={InputType.email}
          size={InputSize.large}
          scale={true}
          value={email}
          placeholder={t("Common:Email")}
          emailSettings={emailSettings}
          hasError={hasErrorEmail}
          onValidateInput={onEmailChangeHandler}
          isAutoFocussed={true}
          onChange={onChangeEmail}
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
          size={InputSize.large}
          scale={true}
          inputValue={password}
          inputType={InputType.password}
          passwordSettings={passwordSettings}
          isDisabled={isCreated}
          placeholder={t("Common:Password")}
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
          size={12}
          iconName={RefreshReactSvgUrl}
          onClick={generatePassword}
        />
        <Link
          className="generate-password-link"
          type={LinkType.action}
          fontWeight={600}
          isHovered={true}
          onClick={generatePassword}
        >
          {t("GeneratePassword")}
        </Link>
      </StyledLink>

      {isRequiredLicense && (
        <FieldContainer
          className="license-filed"
          isVertical={true}
          labelVisible={false}
          hasError={hasErrorLicense}
          errorMessage={
            invalidLicense ? t("ErrorLicenseBody") : t("ErrorUploadLicenseFile")
          }
        >
          <FileInput
            scale
            size={InputSize.large}
            accept={[".lic"]}
            placeholder={t("PlaceholderLicense")}
            onInput={onLicenseFileHandler}
            hasError={hasErrorLicense}
          />
        </FieldContainer>
      )}

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
            options={cultures || []}
            selectedOption={selectedLanguage as TOption}
            onSelect={onLanguageSelect}
            isDisabled={isCreated}
            scaled={isMobileView}
            scaledOptions={false}
            size={ComboBoxSize.content}
            showDisabledItems={true}
            dropDownMaxHeight={364}
            manualWidth="250px"
            isDefaultMode={!isMobileView}
            withBlur={isMobileView}
            fillIcon={false}
            modernView={true}
          />
          {selectedLanguage?.isBeta && (
            <BetaBadge
              withOutFeedbackLink
              place="bottom"
              forumLink={forumLink}
              currentDeviceType={currentDeviceType}
              documentationEmail={documentationEmail}
            />
          )}
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
          options={timezones || []}
          selectedOption={selectedTimezone}
          onSelect={onTimezoneSelect}
          isDisabled={isCreated}
          scaled={isMobileView}
          scaledOptions={false}
          size={ComboBoxSize.content}
          showDisabledItems={true}
          dropDownMaxHeight={364}
          manualWidth="350px"
          isDefaultMode={!isMobileView}
          withBlur={isMobileView}
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
          type={LinkType.page}
          color={
            hasErrorAgree
              ? theme.checkbox.errorColor
              : theme.client.wizard.linkColor
          }
          fontSize="13px"
          target={LinkTarget.blank}
          href={licenseUrl}
        >
          {t("LicenseLink")}
        </Link>
      </StyledAcceptTerms>

      <Button
        size={ButtonSize.medium}
        scale={true}
        primary
        label={t("Common:ContinueButton")}
        isLoading={isCreated}
        onClick={onContinueClick}
      />
    </WizardContainer>
  );
}

export default WizardForm;
