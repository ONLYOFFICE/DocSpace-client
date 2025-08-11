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

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
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

    if (
      authInvalid ||
      settings[HOST]?.trim() === "" ||
      settings[PORT]?.toString()?.trim() === "" ||
      settings[SENDER_EMAIL_ADDRESS]?.trim() === ""
    )
      return false;

    return true;
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
      />
      <Button
        label={t("Settings:DefaultSettings")}
        size={buttonSize}
        onClick={onClickDefaultSettings}
        isLoading={buttonOperation.reset}
        isDisabled={isLoading || isDefaultSettings}
        scale={currentDeviceType === DeviceType.mobile}
      />
      <Button
        label={t("SendTestMail")}
        size={buttonSize}
        onClick={onClickSendTestMail}
        isDisabled={isLoading || !isSMTPInitialSettings}
        isLoading={buttonOperation.send}
        scale={currentDeviceType === DeviceType.mobile}
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
