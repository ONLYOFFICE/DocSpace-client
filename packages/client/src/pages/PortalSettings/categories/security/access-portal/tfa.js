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

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { size, isMobileDevice } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import TfaLoader from "../sub-components/loaders/tfa-loader";
import { LearnMoreWrapper } from "../StyledSecurity";
import useSecurity from "../useSecurity";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import styles from "./tfa.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const TFA_HASH = "#tfa-section";
const SCROLL_MARGIN_TOP =
  window.innerWidth > size.mobile && window.innerWidth < size.desktop
    ? "190px"
    : "230px";

const TwoFactorAuth = (props) => {
  const {
    t,
    tReady,
    setIsInit,
    isInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    appAvailable,
    tfaSettings,
    onSettingsSkeletonNotShown,

    settingsStore,
    tfaStore,
    setup,
  } = props;

  const [type, setType] = useState("none");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const targetRef = useRef(null);

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
      location.pathname.includes("tfa") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultTfaSettings");
    if (defaultSettings) setType(defaultSettings);
  };

  const getSettings = async () => {
    const currentSettings = getFromSessionStorage("currentTfaSettings");

    saveToSessionStorage("defaultTfaSettings", tfaSettings);

    if (currentSettings) {
      setType(currentSettings);
    } else {
      setType(tfaSettings);
    }
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
  }, [isInit]);

  useEffect(() => {
    if (!onSettingsSkeletonNotShown) return;
    if (!(currentDeviceType !== DeviceType.desktop && !isLoading))
      onSettingsSkeletonNotShown("Tfa");
  }, [currentDeviceType, isLoading]);

  const scrollToTarget = () => {
    targetRef.current.style.scrollMarginTop = SCROLL_MARGIN_TOP;
    targetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.history.replaceState(
      null,
      null,
      window.location.pathname + window.location.search,
    );
    setType("app");
  };

  useEffect(() => {
    if (!isInit && !isMobileDevice()) {
      getSecurityInitialValue();
    }

    if (window.location.hash !== TFA_HASH) return;
    if (!targetRef?.current) {
      // If element is not available yet, try again after a small delay
      const timer = setTimeout(scrollToTarget, 50);
      return () => clearTimeout(timer);
    }

    if (targetRef.current) {
      const timer = setTimeout(scrollToTarget, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isLoading || !tfaSettings || isSaving) return;
    const currentSettings = getFromSessionStorage("currentTfaSettings");
    const defaultSettings = getFromSessionStorage("defaultTfaSettings");

    if (currentSettings === defaultSettings) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading, tfaSettings]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage("defaultTfaSettings");
    saveToSessionStorage("currentTfaSettings", type);

    if (isEqual(defaultSettings, type)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type]);

  const onSelectTfaType = (e) => {
    if (type !== e.target.value) {
      setType(e.target.value);
    }
  };

  const onSaveClick = async () => {
    const { setTfaSettings } = props;
    setIsSaving(true);

    try {
      const res = await setTfaSettings(type);
      setType(type);
      setShowReminder(false);
      saveToSessionStorage("defaultTfaSettings", type);
      saveToSessionStorage("currentTfaSettings", type);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));

      if (res) {
        setIsInit(false);
        window.location.replace(res);
      }
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultTfaSettings");
    saveToSessionStorage("currentTfaSettings", defaultSettings);
    setType(defaultSettings || "none");
    setShowReminder(false);
  };

  if ((currentDeviceType === DeviceType.mobile && !isLoading) || !tReady) {
    return <TfaLoader />;
  }

  return (
    <div id="tfa-section" ref={targetRef} className={styles.container}>
      <LearnMoreWrapper withoutExternalLink={!tfaSettingsUrl}>
        <Text fontSize="13px" fontWeight="400">
          {t("TwoFactorAuthEnableDescription", {
            productName: getBrandName("ProductName"),
          })}
        </Text>
        {tfaSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={tfaSettingsUrl}
            dataTestId="tfa_component_learn_more"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </LearnMoreWrapper>

      <RadioButtonGroup
        className={styles.box}
        fontSize="13px"
        fontWeight="400"
        name="group"
        orientation="vertical"
        spacing="8px"
        dataTestId="tfa_radio_button_group"
        options={[
          {
            id: "tfa-disabled",
            label: t("Common:Disabled"),
            value: "none",
            dataTestId: "tfa_radio_button_disabled",
          },
          // TODO: hide while 2fa by sms is not working
          /* {
            id: "by-sms",
            label: t("BySms"),
            value: "sms",
            disabled: !smsAvailable,
          }, */
          {
            id: "by-app",
            label: t("ByApp"),
            value: "app",
            disabled: !appAvailable,
            dataTestId: "tfa_radio_button_app",
          },
        ]}
        selected={type}
        onClick={onSelectTfaType}
      />

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
        additionalClassSaveButton="two-factor-auth-save"
        additionalClassCancelButton="two-factor-auth-cancel"
        saveButtonDataTestId="tfa_save_button"
        cancelButtonDataTestId="tfa_cancel_button"
      />
    </div>
  );
};

export const TfaSection = inject(({ settingsStore, setup, tfaStore }) => {
  const {
    setTfaSettings,

    tfaSettings,
    smsAvailable,
    appAvailable,
  } = tfaStore;

  const { setIsInit, isInit } = setup;
  const { currentColorScheme, tfaSettingsUrl, currentDeviceType } =
    settingsStore;

  return {
    setTfaSettings,
    tfaSettings,
    smsAvailable,
    appAvailable,
    setIsInit,
    isInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    settingsStore,
    tfaStore,
    setup,
  };
})(withTranslation(["Settings", "Common"])(observer(TwoFactorAuth)));
