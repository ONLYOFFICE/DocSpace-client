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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { TextInput } from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import { size } from "@docspace/shared/utils";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import isEqual from "lodash/isEqual";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import SessionLifetimeLoader from "../sub-components/loaders/session-lifetime-loader";
import { LearnMoreWrapper } from "../StyledSecurity";

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

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("lifetime") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );
    if (defaultSettings) {
      setType(defaultSettings.type);
      setSessionLifetime(defaultSettings.lifetime);
    }
  };

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
      setType(currentSettings.type);
      setSessionLifetime(currentSettings.lifetime);
    } else {
      setSessionLifetime(lifetime?.toString());
      setType(enabled);
    }
    setIsLoading(true);
  };

  useEffect(() => {
    checkWidth();

    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const currentSettings = getFromSessionStorage(
      "currentSessionLifetimeSettings",
    );
    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );
    const newSettings = {
      lifetime: sessionLifetime?.toString(),
      type,
    };

    saveToSessionStorage("currentSessionLifetimeSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type, sessionLifetime]);

  const onSelectType = (e) => {
    setType(e.target.value === "enable");
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
        type,
      });
    }

    setSessionLifetimeSettings(sessionValue, type)
      .then(() => {
        toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
        saveToSessionStorage("defaultSessionLifetimeSettings", {
          lifetime: sessionValue?.toString(),
          type,
        });
        setShowReminder(false);
      })
      .catch((err) => toastr.error(err));
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultSessionLifetimeSettings",
    );
    setType(defaultSettings?.type);
    setSessionLifetime(defaultSettings?.lifetime || "1440");
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isLoading) {
    return <SessionLifetimeLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper withoutExternalLink={!lifetimeSettingsUrl}>
        <Text className="learn-subtitle">
          {t("SessionLifetimeSettingDescription")}
        </Text>
        {lifetimeSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="session_lifetime_component_learn_more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={lifetimeSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </LearnMoreWrapper>

      <RadioButtonGroup
        className="box"
        fontSize="13px"
        fontWeight="400"
        name="group"
        orientation="vertical"
        spacing="8px"
        dataTestId="session_lifetime_radio_button_group"
        options={[
          {
            id: "session-lifetime-disabled",
            label: t("Common:Disabled"),
            value: "disabled",
            dataTestId: "session_lifetime_disabled",
          },
          {
            id: "session-lifetime-enable",
            label: t("Common:Enable"),
            value: "enable",
            dataTestId: "session_lifetime_enabled",
          },
        ]}
        selected={type ? "enable" : "disabled"}
        onClick={onSelectType}
      />

      {type ? (
        <>
          <Text className="lifetime" fontSize="15px" fontWeight="600">
            {t("Lifetime")}
          </Text>
          <TextInput
            className="lifetime-input"
            testId="session_lifetime_input"
            maxLength={4}
            isAutoFocussed={false}
            value={sessionLifetime}
            onChange={onChangeInput}
            onBlur={onBlurInput}
            onFocus={onFocusInput}
            hasError={error}
          />
        </>
      ) : null}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        additionalClassSaveButton="session-lifetime-save"
        additionalClassCancelButton="session-lifetime-cancel"
        saveButtonDataTestId="session_lifetime_save_button"
        cancelButtonDataTestId="session_lifetime_cancel_button"
      />
    </MainContainer>
  );
};

export const SessionLifetimeSection = inject(({ settingsStore }) => {
  const {
    sessionLifetime,
    enabledSessionLifetime,
    setSessionLifetimeSettings,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  } = settingsStore;

  return {
    enabled: enabledSessionLifetime,
    lifetime: sessionLifetime,
    setSessionLifetimeSettings,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(SessionLifetime)));
