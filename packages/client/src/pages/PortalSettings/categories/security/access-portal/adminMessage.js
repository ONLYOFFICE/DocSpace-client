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

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { size } from "@docspace/shared/utils";

import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";

import { LearnMoreWrapper } from "../StyledSecurity";
import styles from "./adminMessage.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const AdminMessage = (props) => {
  const {
    t,
    tReady,

    enableAdmMess,
    setMessageSettings,
    currentColorScheme,
    administratorMessageSettingsUrl,
  } = props;
  const [type, setType] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("admin-message") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultAdminMessageSettings",
    );
    if (defaultSettings) {
      setType(defaultSettings);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage(
      "currentAdminMessageSettings",
    );

    const enable = enableAdmMess ? "enable" : "disabled";

    saveToSessionStorage("defaultAdminMessageSettings", enable);

    if (currentSettings) {
      setType(currentSettings);
    } else {
      setType(enable);
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const currentSettings = getFromSessionStorage(
      "currentAdminMessageSettings",
    );
    const defaultSettings = getFromSessionStorage(
      "defaultAdminMessageSettings",
    );

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, []);

  useEffect(() => {
    const defaultSettings = getFromSessionStorage(
      "defaultAdminMessageSettings",
    );
    saveToSessionStorage("currentAdminMessageSettings", type);

    if (isEqual(defaultSettings, type)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type]);

  const onSelectType = (e) => {
    if (type !== e.target.value) {
      setType(e.target.value);
    }
  };

  const onSaveClick = () => {
    const turnOn = type === "enable";
    setMessageSettings(turnOn);
    toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    saveToSessionStorage("currentAdminMessageSettings", type);
    saveToSessionStorage("defaultAdminMessageSettings", type);
    setShowReminder(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultAdminMessageSettings",
    );
    setType(defaultSettings || "disabled");
    setShowReminder(false);
  };

  if (!tReady) return null;

  return (
    <div className={styles.container}>
      <LearnMoreWrapper withoutExternalLink={!administratorMessageSettingsUrl}>
        <Text>
          {t("AdminsMessageSettingDescription", {
            productName: getBrandName("ProductName"),
          })}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>

        {administratorMessageSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="administrator_message_component_learn_more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={administratorMessageSettingsUrl}
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
        dataTestId="administrator_message_radio_button_group"
        options={[
          {
            id: "admin-message-disabled",
            label: t("Common:Disabled"),
            value: "disabled",
            dataTestId: "administrator_message_disabled",
          },
          {
            id: "admin-message-enable",
            label: t("Common:Enable"),
            value: "enable",
            dataTestId: "administrator_message_enabled",
          },
        ]}
        selected={type}
        onClick={onSelectType}
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
        additionalClassSaveButton="admin-message-save"
        additionalClassCancelButton="admin-message-cancel"
        saveButtonDataTestId="administrator_message_save_button"
        cancelButtonDataTestId="administrator_message_cancel_button"
      />
    </div>
  );
};

export const AdminMessageSection = inject(({ settingsStore }) => {
  const {
    enableAdmMess,
    setMessageSettings,
    currentColorScheme,
    administratorMessageSettingsUrl,
  } = settingsStore;

  return {
    enableAdmMess,
    setMessageSettings,
    currentColorScheme,
    administratorMessageSettingsUrl,
  };
})(withTranslation(["Settings", "Common"])(observer(AdminMessage)));
