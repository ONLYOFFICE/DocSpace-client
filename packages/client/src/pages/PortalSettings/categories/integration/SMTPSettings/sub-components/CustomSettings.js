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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import { TextInput } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { FieldContainer } from "@docspace/shared/components/field-container";

import { EmailInput } from "@docspace/shared/components/email-input";
import { StyledComponent } from "../StyledComponent";
import { SMTPSettingsFields } from "../constants";
import ButtonContainer from "./ButtonContainer";

const {
  HOST,
  PORT,
  SENDER_EMAIL_ADDRESS,
  SENDER_DISPLAY_NAME,
  HOST_LOGIN,
  ENABLE_SSL,
  HOST_PASSWORD,
  AUTHENTICATION,
  USE_NTLM,
} = SMTPSettingsFields;

const CustomSettings = (props) => {
  const { t, settings, setSMTPSettings, isLoading, theme, errors } = props;
  const [emailError, setEmailError] = useState({
    hasError: false,
    isValid: true,
    errors: [],
  });

  const onChange = (e) => {
    const { name, value } = e.target;

    setSMTPSettings({
      ...settings,
      [name]: value,
    });
  };

  const onChangeToggle = (e) => {
    const { checked } = e.currentTarget;

    setSMTPSettings({
      ...settings,
      [AUTHENTICATION]: checked,
    });
  };

  const onChangeCheckbox = (e) => {
    const { checked, name } = e.target;

    setSMTPSettings({
      ...settings,
      [name]: checked,
    });
  };

  const onValidateEmailInput = (result) => {
    const { isValid, errors: newErrors } = result;

    setEmailError({
      ...emailError,
      isValid,
      errors: newErrors,
    });
  };

  const commonTextProps = {
    fontWeight: 600,
  };

  const requirementColor = {
    color: theme.client.settings.integration.smtp.requirementColor,
  };

  const isPortValid =
    Number(settings[PORT]) > 0 && Number(settings[PORT]) < 65536;

  const enableAuthComponent = (
    <div className="smtp-settings_auth">
      <ToggleButton
        className="smtp-settings_toggle"
        isChecked={settings[AUTHENTICATION]}
        onChange={onChangeToggle}
        label={t("Common:Authentication")}
        isDisabled={isLoading}
        dataTestId="smtp_auth_toggle_button"
      />

      <div className="smtp-settings_title smtp-settings_login">
        <Text {...commonTextProps}>{t("HostLogin")}</Text>
        <Text as="span" {...requirementColor}>
          *
        </Text>
      </div>
      <TextInput
        className="smtp-settings_input"
        name={HOST_LOGIN}
        placeholder={t("EnterLogin")}
        onChange={onChange}
        value={settings[HOST_LOGIN]}
        isDisabled={isLoading || !settings[AUTHENTICATION]}
        scale
        testId="smtp_host_login_imput"
      />

      <div className="smtp-settings_title">
        <Text {...commonTextProps}>{t("HostPassword")}</Text>
        <Text as="span" {...requirementColor}>
          *
        </Text>
      </div>
      <TextInput
        className="smtp-settings_input"
        name={HOST_PASSWORD}
        placeholder={t("Common:EnterPassword")}
        onChange={onChange}
        value={settings[HOST_PASSWORD]}
        isDisabled={isLoading || !settings[AUTHENTICATION]}
        scale
        testId="smtp_host_password_input"
      />

      <Checkbox
        className="smtp_settings_checkbox"
        name={USE_NTLM}
        label={t("AuthViaNTLM")}
        isChecked={settings[USE_NTLM]}
        onChange={onChangeCheckbox}
        isDisabled={isLoading || !settings[AUTHENTICATION]}
        dataTestId="smtp_auth_ntlm_checkbox"
      />
    </div>
  );

  return (
    <StyledComponent>
      <div className="smtp-settings_title">
        <Text {...commonTextProps}>{t("Host")}</Text>
        <Text as="span" {...requirementColor}>
          *
        </Text>
      </div>
      <TextInput
        isDisabled={isLoading}
        className="smtp-settings_input"
        name={HOST}
        placeholder={t("EnterDomain")}
        onChange={onChange}
        value={settings[HOST]}
        scale
        testId="smtp_host_domain_input"
      />

      <div className="smtp-settings_title">
        <Text {...commonTextProps}>{t("Port")}</Text>{" "}
        <Text as="span" {...requirementColor}>
          *
        </Text>
      </div>
      <TextInput
        isDisabled={isLoading}
        className="smtp-settings_input"
        name={PORT}
        placeholder={t("EnterPort")}
        onChange={onChange}
        value={settings[PORT].toString()}
        scale
        hasError={errors[PORT]}
        testId="smtp_port_input"
      />
      {enableAuthComponent}

      <Text {...commonTextProps}>{t("SenderDisplayName")}</Text>
      <TextInput
        isDisabled={isLoading}
        className="smtp-settings_input"
        name={SENDER_DISPLAY_NAME}
        placeholder={t("Common:EnterName")}
        onChange={onChange}
        value={settings[SENDER_DISPLAY_NAME]}
        scale
        testId="smtp_sender_display_name_input"
      />

      <div className="smtp-settings_title">
        <Text {...commonTextProps}>{t("SenderEmailAddress")}</Text>
        <Text as="span" {...requirementColor}>
          *
        </Text>
      </div>
      <FieldContainer
        className="smtp-settings_input"
        isVertical
        place="top"
        hasError={errors[SENDER_EMAIL_ADDRESS]}
        errorMessage={t("Common:IncorrectEmail")}
        dataTestId="smtp_sender_email_container"
      >
        <EmailInput
          name={SENDER_EMAIL_ADDRESS}
          isDisabled={isLoading}
          value={settings[SENDER_EMAIL_ADDRESS]}
          onChange={onChange}
          onValidateInput={onValidateEmailInput}
          hasError={errors[SENDER_EMAIL_ADDRESS] ?? false}
          placeholder={t("EnterEmail")}
          scale
          dataTestId="smtp_sender_email_input"
        />
      </FieldContainer>

      <Checkbox
        className="smtp_settings_checkbox"
        isDisabled={isLoading}
        name={ENABLE_SSL}
        label={t("EnableSSL")}
        isChecked={settings[ENABLE_SSL]}
        onChange={onChangeCheckbox}
        dataTestId="enable_ssl_checkbox"
      />
      <ButtonContainer
        t={t}
        isEmailValid={emailError.isValid}
        isPortValid={isPortValid}
      />
    </StyledComponent>
  );
};

export default inject(({ settingsStore, setup }) => {
  const { theme } = settingsStore;
  const { integration, setSMTPSettings, setSMTPErrors } = setup;
  const { smtpSettings } = integration;
  const { settings, isLoading, errors } = smtpSettings;

  return { theme, settings, setSMTPSettings, isLoading, setSMTPErrors, errors };
})(observer(CustomSettings));
