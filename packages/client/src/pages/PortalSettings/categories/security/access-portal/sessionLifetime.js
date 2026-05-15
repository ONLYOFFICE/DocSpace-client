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

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { toastr } from "@docspace/ui-kit/components/toast";
import { size, isMobileDevice } from "@docspace/shared/utils";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import isEqual from "lodash/isEqual";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import SessionLifetimeLoader from "../sub-components/loaders/session-lifetime-loader";
import { LearnMoreWrapper } from "../StyledSecurity";
import useSecurity from "../useSecurity";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import styles from "./sessionLifetime.module.scss";

const SessionLifetime = (props) => {
  const {
    t,
    tReady,
    lifetime,
    enabled,
    setSessionLifetimeSettings,
    lifetimeSettingsUrl,
    currentColorScheme,
    currentDeviceType,
    isInit,

    settingsStore,
    tfaStore,
    setup,
  } = props;

  const [type, setType] = useState(false);
  const [sessionLifetime, setSessionLifetime] = useState("1440");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const defaultProps = createDefaultHookSettingsProps({
    settingsStore,
    tfaStore,
    setup,
  });

  const { getSecurityInitialValue } = useSecurity(defaultProps.security);

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
    if (isMobileDevice()) {
      getSecurityInitialValue();
      setIsLoading(true);
    }
  }, [isMobileDevice]);

  useEffect(() => {
    if (isInit) {
      setIsLoading(true);
    }
  }, []);

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

  if ((currentDeviceType === DeviceType.mobile && !isLoading) || !tReady) {
    return <SessionLifetimeLoader />;
  }

  return (
    <div className={styles.container}>
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
          <Text className={styles.lifetime} fontSize="15px" fontWeight="600">
            {t("Lifetime")}
          </Text>
          <TextInput
            className={styles.lifetimeInput}
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
        className={styles.saveCancelButtons}
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
    </div>
  );
};

export const SessionLifetimeSection = inject(
  ({ settingsStore, tfaStore, setup }) => {
    const {
      sessionLifetime,
      enabledSessionLifetime,
      setSessionLifetimeSettings,
      lifetimeSettingsUrl,
      currentColorScheme,
      currentDeviceType,
    } = settingsStore;

    const { isInit } = setup;

    return {
      enabled: enabledSessionLifetime,
      lifetime: sessionLifetime,
      setSessionLifetimeSettings,
      lifetimeSettingsUrl,
      currentColorScheme,
      currentDeviceType,
      isInit,

      settingsStore,
      tfaStore,
      setup,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(SessionLifetime)));
