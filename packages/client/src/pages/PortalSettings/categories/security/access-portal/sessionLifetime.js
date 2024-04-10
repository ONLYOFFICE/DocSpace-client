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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { TextInput } from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { LearnMoreWrapper } from "../StyledSecurity";
import { size } from "@docspace/shared/utils";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import isEqual from "lodash/isEqual";

import SessionLifetimeLoader from "../sub-components/loaders/session-lifetime-loader";
import { DeviceType } from "@docspace/shared/enums";

const MainContainer = styled.div`
  width: 100%;

  .lifetime {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  .lifetime-input {
    width: 100%;
    max-width: 350px;
  }

  .save-cancel-buttons {
    margin-top: 24px;
  }
`;

const SessionLifetime = (props) => {
  const {
    t,

    lifetime,
    enabled,
    setSessionLifetimeSettings,
    initSettings,
    isInit,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  } = props;
  const [type, setType] = useState(false);
  const [sessionLifetime, setSessionLifetime] = useState("1440");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getSettings = () => {
    const currentSettings = getFromSessionStorage(
      "currentSessionLifetimeSettings",
    );

    const defaultData = {
      lifetime: lifetime?.toString(),
      type: enabled,
    };
    saveToSessionStorage("defaultSessionLifetimeSettings", defaultData);

    if (currentSettings) {
      setSessionLifetime(currentSettings.lifetime);
      setType(currentSettings.type);
    } else {
      setSessionLifetime(lifetime?.toString());
      setType(enabled);
    }

    if (currentSettings) {
      setType(currentSettings.type);
      setSessionLifetime(currentSettings.lifetime);
    } else {
      setType(enabled);
      setSessionLifetime(lifetime?.toString());
    }
    setIsLoading(true);
  };

  useEffect(() => {
    checkWidth();

    if (!isInit) initSettings("lifetime").then(() => setIsLoading(true));
    else setIsLoading(true);

    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isInit) return;
    getSettings();
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );
    const newSettings = {
      lifetime: sessionLifetime?.toString(),
      type: type,
    };

    saveToSessionStorage("currentSessionLifetimeSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type, sessionLifetime]);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("lifetime") &&
      navigate("/portal-settings/security/access-portal");
  };

  const onSelectType = (e) => {
    setType(e.target.value === "enable" ? true : false);
  };

  const onChangeInput = (e) => {
    const inputValue = e.target.value.trim();

    if (
      (Math.sign(inputValue) !== 1 && inputValue !== "") ||
      inputValue.indexOf(".") !== -1
    )
      return;

    setSessionLifetime(inputValue);
  };

  const onBlurInput = () => {
    const hasErrorInput = Math.sign(sessionLifetime) !== 1;

    setError(hasErrorInput);
  };

  const onFocusInput = () => {
    setError(false);
  };

  const onSaveClick = async () => {
    if (error && type) return;
    let sessionValue = sessionLifetime;

    if (!type) {
      sessionValue = lifetime;

      saveToSessionStorage("currentSessionLifetimeSettings", {
        lifetime: sessionValue?.toString(),
        type: type,
      });
    }

    setSessionLifetimeSettings(sessionValue, type)
      .then(() => {
        toastr.success(t("SuccessfullySaveSettingsMessage"));
        saveToSessionStorage("defaultSessionLifetimeSettings", {
          lifetime: sessionValue?.toString(),
          type: type,
        });
        setShowReminder(false);
      })
      .catch((error) => toastr.error(error));
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );
    setType(defaultSettings.type);
    setSessionLifetime(defaultSettings.lifetime);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isInit && !isLoading) {
    return <SessionLifetimeLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text className="learn-subtitle">
          {t("SessionLifetimeSettingDescription")}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={lifetimeSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </LearnMoreWrapper>

      <RadioButtonGroup
        className="box"
        fontSize="13px"
        fontWeight="400"
        name="group"
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "session-lifetime-disabled",
            label: t("Common:Disabled"),
            value: "disabled",
          },
          {
            id: "session-lifetime-enable",
            label: t("Common:Enable"),
            value: "enable",
          },
        ]}
        selected={type ? "enable" : "disabled"}
        onClick={onSelectType}
      />

      {type && (
        <>
          <Text className="lifetime" fontSize="15px" fontWeight="600">
            {t("Lifetime")}
          </Text>
          <TextInput
            className="lifetime-input"
            maxLength={4}
            isAutoFocussed={false}
            value={sessionLifetime}
            onChange={onChangeInput}
            onBlur={onBlurInput}
            onFocus={onFocusInput}
            hasError={error}
          />
        </>
      )}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings={true}
        hasScroll={false}
        additionalClassSaveButton="session-lifetime-save"
        additionalClassCancelButton="session-lifetime-cancel"
      />
    </MainContainer>
  );
};

export default inject(({ settingsStore, setup }) => {
  const {
    sessionLifetime,
    enabledSessionLifetime,
    setSessionLifetimeSettings,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  } = settingsStore;
  const { initSettings, isInit } = setup;

  return {
    enabled: enabledSessionLifetime,
    lifetime: sessionLifetime,
    setSessionLifetimeSettings,
    initSettings,
    isInit,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(SessionLifetime)));
