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
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { Slider } from "@docspace/ui-kit/components/slider";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { toastr } from "@docspace/ui-kit/components/toast";
import { isMobileDevice, size } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import PasswordLoader from "../sub-components/loaders/password-loader";
import { LearnMoreWrapper } from "../StyledSecurity";
import useSecurity from "../useSecurity";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import styles from "./passwordStrength.module.scss";

const PasswordStrength = (props) => {
  const {
    t,
    tReady,
    setPortalPasswordSettings,
    passwordSettings,
    currentColorScheme,
    passwordStrengthSettingsUrl,
    currentDeviceType,
    onSettingsSkeletonNotShown,
    settingsStore,
    tfaStore,
    setup,
    isInit,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [passwordLen, setPasswordLen] = useState(8);
  const [useUpperCase, setUseUpperCase] = useState(false);
  const [useDigits, setUseDigits] = useState(false);
  const [useSpecialSymbols, setUseSpecialSymbols] = useState(false);

  const [showReminder, setShowReminder] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultProps = createDefaultHookSettingsProps({
    settingsStore,
    tfaStore,
    setup,
  });

  const { getSecurityInitialValue } = useSecurity(defaultProps.security);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("password") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");
    if (defaultSettings) {
      setPasswordLen(defaultSettings.minLength);
      setUseUpperCase(defaultSettings.upperCase);
      setUseDigits(defaultSettings.digits);
      setUseSpecialSymbols(defaultSettings.specSymbols);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentPasswordSettings");

    const defaultData = {
      minLength: passwordSettings.minLength,
      upperCase: passwordSettings.upperCase,
      digits: passwordSettings.digits,
      specSymbols: passwordSettings.specSymbols,
    };
    saveToSessionStorage("defaultPasswordSettings", defaultData);

    if (currentSettings) {
      setPasswordLen(currentSettings.minLength);
      setUseUpperCase(currentSettings.upperCase);
      setUseDigits(currentSettings.digits);
      setUseSpecialSymbols(currentSettings.specSymbols);
    } else {
      setPasswordLen(passwordSettings.minLength);
      setUseUpperCase(passwordSettings.upperCase);
      setUseDigits(passwordSettings.digits);
      setUseSpecialSymbols(passwordSettings.specSymbols);
    }
  };

  useEffect(() => {
    if (!onSettingsSkeletonNotShown) return;
    if (!(currentDeviceType !== DeviceType.desktop))
      onSettingsSkeletonNotShown("PasswordStrength");
  }, [currentDeviceType, onSettingsSkeletonNotShown]);

  useEffect(() => {
    if (isInit) {
      setIsLoaded(true);
    }
  }, [isInit]);

  useEffect(() => {
    if (isMobileDevice()) {
      getSecurityInitialValue();
      setIsLoaded(true);
    }
  }, [isMobileDevice]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isLoaded || !passwordSettings) return;
    const currentSettings = getFromSessionStorage("currentPasswordSettings");
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoaded, passwordSettings]);

  useEffect(() => {
    if (!isLoaded) return;
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");

    const newSettings = {
      minLength: passwordLen,
      upperCase: useUpperCase,
      digits: useDigits,
      specSymbols: useSpecialSymbols,
    };

    saveToSessionStorage("currentPasswordSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [passwordLen, useUpperCase, useDigits, useSpecialSymbols]);

  const onSliderChange = (e) => {
    setPasswordLen(Number(e.target.value));
  };

  const onClickCheckbox = (e) => {
    switch (e.target.value) {
      case "upperCase":
        setUseUpperCase(e.target.checked);
        break;
      case "digits":
        setUseDigits(e.target.checked);
        break;
      case "special":
        setUseSpecialSymbols(e.target.checked);
        break;
      default:
        break;
    }
  };

  const onSaveClick = async () => {
    setIsSaving(true);

    try {
      const data = {
        minLength: passwordLen,
        upperCase: useUpperCase,
        digits: useDigits,
        specSymbols: useSpecialSymbols,
      };
      await setPortalPasswordSettings(
        passwordLen,
        useUpperCase,
        useDigits,
        useSpecialSymbols,
      );
      setShowReminder(false);
      saveToSessionStorage("currentPasswordSettings", data);
      saveToSessionStorage("defaultPasswordSettings", data);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultPasswordSettings");
    saveToSessionStorage("currentPasswordSettings", defaultSettings);
    setPasswordLen(defaultSettings?.minLength || 8);
    setUseUpperCase(defaultSettings?.upperCase);
    setUseDigits(defaultSettings?.digits);
    setUseSpecialSymbols(defaultSettings?.specSymbols);
    setShowReminder(false);
  };

  if ((currentDeviceType === DeviceType.mobile && !isLoaded) || !tReady) {
    return <PasswordLoader />;
  }

  return (
    <div className={styles.container}>
      <LearnMoreWrapper withoutExternalLink={!passwordStrengthSettingsUrl}>
        <Text fontSize="13px" fontWeight="400">
          {t("SettingPasswordDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        {passwordStrengthSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="password_strength_component_learn_more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={passwordStrengthSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </LearnMoreWrapper>
      <Text fontSize="14px" fontWeight="600" className="length-subtitle">
        {t("PasswordMinLenght")}
      </Text>
      <div className={styles.sliderBox}>
        <Slider
          className={styles.passwordSlider}
          dataTestId="password_strength_slider"
          min="8"
          max="30"
          step="1"
          withPouring
          value={passwordLen}
          onChange={onSliderChange}
        />
        <Text>
          {t("Characters", {
            length: passwordLen,
          })}
        </Text>
      </div>
      <div className={styles.checkboxes}>
        <Checkbox
          className="use-upper-case"
          onChange={onClickCheckbox}
          label={t("UseUpperCase")}
          isChecked={useUpperCase}
          value="upperCase"
          dataTestId="password_strength_upper_case"
        />
        <Checkbox
          className={`use-digits ${styles.secondCheckbox}`}
          onChange={onClickCheckbox}
          label={t("UseDigits")}
          isChecked={useDigits}
          value="digits"
          dataTestId="password_strength_digits"
        />
        <Checkbox
          className={`use-special-char ${styles.secondCheckbox}`}
          onChange={onClickCheckbox}
          label={t("UseSpecialChar")}
          isChecked={useSpecialSymbols}
          value="special"
          dataTestId="password_strength_special"
        />
      </div>
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
        isSaving={isSaving}
        additionalClassSaveButton="password-strength-save"
        additionalClassCancelButton="password-strength-cancel"
        saveButtonDataTestId="password_strength_save"
        cancelButtonDataTestId="password_strength_cancel"
      />
    </div>
  );
};

export const PasswordStrengthSection = inject(
  ({ settingsStore, tfaStore, setup }) => {
    const {
      setPortalPasswordSettings,
      passwordSettings,
      currentColorScheme,
      passwordStrengthSettingsUrl,
      currentDeviceType,
    } = settingsStore;

    const { isInit } = setup;

    return {
      setPortalPasswordSettings,
      passwordSettings,
      currentColorScheme,
      passwordStrengthSettingsUrl,
      currentDeviceType,
      settingsStore,
      tfaStore,
      setup,
      isInit,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(PasswordStrength)));
