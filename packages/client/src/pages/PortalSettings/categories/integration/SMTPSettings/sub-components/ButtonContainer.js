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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import { Button } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  getSendingTestMailStatus,
  sendingTestMail,
} from "@docspace/shared/api/settings";

import { DeviceType } from "@docspace/shared/enums";
import { ButtonStyledComponent } from "../StyledComponent";
import { SMTPSettingsFields } from "../constants";

const {
  HOST,
  PORT,
  SENDER_EMAIL_ADDRESS,
  HOST_LOGIN,
  HOST_PASSWORD,
  AUTHENTICATION,
} = SMTPSettingsFields;

let timerId = null;
let intervalId = null;
const ButtonContainer = (props) => {
  const {
    t,
    isEmailValid,
    isPortValid,
    settings,
    setSMTPSettingsLoading,
    updateSMTPSettings,
    resetSMTPSettings,
    isLoading,
    isDefaultSettings,
    isSMTPInitialSettings,
    setSMTPErrors,
    currentDeviceType,
  } = props;

  const [buttonOperation, setButtonOperation] = useState({
    save: false,
    reset: false,
    send: false,
  });

  const isValidForm = () => {
    const authInvalid =
      settings[AUTHENTICATION] &&
      (settings[HOST_PASSWORD]?.trim() === "" ||
        settings[HOST_LOGIN]?.trim() === "");

    let valid = true;

    if (
      authInvalid ||
      settings[HOST]?.trim() === "" ||
      settings[PORT]?.toString()?.trim() === "" ||
      settings[SENDER_EMAIL_ADDRESS]?.trim() === ""
    ) {
      valid = false;
    }

    return valid;
  };

  const setErrors = () => {
    const array = [
      { name: SENDER_EMAIL_ADDRESS, hasError: !isEmailValid },
      { name: PORT, hasError: !isPortValid },
    ];

    setSMTPErrors(array);
  };
  const onClick = async () => {
    if (!isEmailValid || !isPortValid) {
      setErrors();

      return;
    }

    timerId = setTimeout(() => {
      setSMTPSettingsLoading(true);
      setButtonOperation({ ...buttonOperation, save: true });
    }, [200]);

    try {
      await updateSMTPSettings();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e);
    }

    clearTimeout(timerId);
    timerId = null;
    setSMTPSettingsLoading(false);
    setButtonOperation({ ...buttonOperation, save: false });
  };

  const checkStatus = () => {
    let isWaitRequest = false;
    intervalId = setInterval(async () => {
      if (isWaitRequest) {
        return;
      }

      isWaitRequest = true;

      const result = await getSendingTestMailStatus();

      if (!result) {
        intervalId && toastr.error(t("Common:UnexpectedError"));
        clearInterval(intervalId);
        intervalId = null;
        isWaitRequest = false;

        setSMTPSettingsLoading(false);
        setButtonOperation({ ...buttonOperation, send: false });

        return;
      }

      const { completed, error } = result;

      if (completed) {
        error?.length > 0
          ? toastr.error(error)
          : toastr.success(t("Common:SuccessfullyCompletedOperation"));

        clearInterval(intervalId);
        intervalId = null;

        setSMTPSettingsLoading(false);
        setButtonOperation({ ...buttonOperation, send: false });
      }

      isWaitRequest = false;
    }, 1000);
  };
  const onClickSendTestMail = async () => {
    try {
      setSMTPSettingsLoading(true);
      setButtonOperation({ ...buttonOperation, send: true });

      const result = await sendingTestMail();
      if (!result) return;

      const { completed, error } = result;

      if (completed) {
        toastr.error(error);
        setSMTPSettingsLoading(false);
        setButtonOperation({ ...buttonOperation, send: false });

        return;
      }

      checkStatus();
    } catch (e) {
      toastr.error(e);

      setSMTPSettingsLoading(false);
      setButtonOperation({ ...buttonOperation, send: false });
    }
  };

  const onClickDefaultSettings = async () => {
    timerId = setTimeout(() => {
      setSMTPSettingsLoading(true);
      setButtonOperation({ ...buttonOperation, reset: true });
    }, [200]);

    try {
      await resetSMTPSettings();
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e);
    }

    clearTimeout(timerId);
    timerId = null;
    setSMTPSettingsLoading(false);
    setButtonOperation({ ...buttonOperation, reset: false });
  };

  const buttonSize =
    currentDeviceType === DeviceType.desktop ? "small" : "normal";

  return (
    <ButtonStyledComponent>
      <Button
        label={t("Common:SaveButton")}
        size={buttonSize}
        primary
        onClick={onClick}
        isDisabled={isLoading || !isValidForm() || isSMTPInitialSettings}
        isLoading={buttonOperation.save}
        scale={currentDeviceType === DeviceType.mobile}
        testId="smtp_settings_save_button"
      />
      <Button
        label={t("Settings:DefaultSettings")}
        size={buttonSize}
        onClick={onClickDefaultSettings}
        isLoading={buttonOperation.reset}
        isDisabled={isLoading || isDefaultSettings}
        scale={currentDeviceType === DeviceType.mobile}
        testId="smtp_default_settings_button"
      />
      <Button
        label={t("SendTestMail")}
        size={buttonSize}
        onClick={onClickSendTestMail}
        isDisabled={isLoading || !isSMTPInitialSettings}
        isLoading={buttonOperation.send}
        scale={currentDeviceType === DeviceType.mobile}
        testId="send_test_mail_button"
      />
    </ButtonStyledComponent>
  );
};

export default inject(({ settingsStore, setup }) => {
  const {
    integration,
    setSMTPSettingsLoading,
    updateSMTPSettings,
    resetSMTPSettings,
    isSMTPInitialSettings,
    setSMTPErrors,
  } = setup;
  const { smtpSettings } = integration;
  const { settings, isLoading, isDefaultSettings } = smtpSettings;

  const { currentDeviceType } = settingsStore;

  return {
    isSMTPInitialSettings,
    isDefaultSettings,
    settings,
    setSMTPSettingsLoading,
    updateSMTPSettings,
    resetSMTPSettings,
    isLoading,
    setSMTPErrors,
    currentDeviceType,
  };
})(observer(ButtonContainer));
