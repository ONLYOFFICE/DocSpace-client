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
import { useLocation, useNavigate } from "react-router";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { toastr } from "@docspace/ui-kit/components/toast";

import { size } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { isValidDomainName } from "@docspace/shared/utils/email";
import TrustedMailLoader from "../sub-components/loaders/trusted-mail-loader";
import UserFields from "../sub-components/user-fields";
import { LearnMoreWrapper } from "../StyledSecurity";
import styles from "./trustedMail.module.scss";

const TrustedMail = (props) => {
  const {
    t,
    tReady,
    trustedDomainsType,
    trustedDomains,
    setMailDomainSettings,
    currentColorScheme,
    trustedMailDomainSettingsUrl,
    currentDeviceType,
    onSettingsSkeletonNotShown,
    isInit,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [type, setType] = useState("0");
  const [domains, setDomains] = useState([]);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("trusted-mail") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultTrustedMailSettings");
    if (defaultSettings) {
      setType(defaultSettings.type);
      setDomains(defaultSettings.domains);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentTrustedMailSettings");

    const defaultData = {
      type: String(trustedDomainsType),
      domains: trustedDomains,
    };
    saveToSessionStorage("defaultTrustedMailSettings", defaultData);

    if (currentSettings) {
      setType(currentSettings.type);
      setDomains(currentSettings.domains);
    } else {
      setType(String(trustedDomainsType));
      setDomains(trustedDomains);
    }
    setIsLoading(true);
  };

  useEffect(() => {
    if (!onSettingsSkeletonNotShown) return;
    if (!(currentDeviceType !== DeviceType.desktop && !isLoading))
      onSettingsSkeletonNotShown("TrustedMail");
  }, [currentDeviceType, isLoading]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const currentSettings = getFromSessionStorage("currentTrustedMailSettings");
    const defaultSettings = getFromSessionStorage("defaultTrustedMailSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isInit) {
      setIsLoading(true);
    }
  }, [isInit]);

  useEffect(() => {
    if (!isLoading) return;
    const defaultSettings = getFromSessionStorage("defaultTrustedMailSettings");
    const newSettings = {
      type,
      domains,
    };
    saveToSessionStorage("currentTrustedMailSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type, domains]);

  const onSelectDomainType = (e) => {
    if (type === e.target.value) return;
    setType(e.target.value);
    if (e.target.value === "1" && domains.length === 0) {
      setDomains([...domains]);
      setShowReminder(true);
    }
  };

  const onClickAdd = () => {
    setDomains([...domains, ""]);
    setErrorMessages((prev) => [...prev, null]);
  };

  const checkDuplicate = (domains, input, index) => {
    const firstIndex = domains.findIndex((d) => d === input && d !== "");
    return firstIndex !== -1 && firstIndex !== index;
  };

  const onChangeInput = (e, index) => {
    const newInputs = Array.from(domains);
    newInputs[index] = e.target.value;
    setDomains(newInputs);
  };

  const getErrorMessage = (domain, index, domainsArray = domains) => {
    const isDuplicate = checkDuplicate(domainsArray, domain, index);
    const isValidFormat = isValidDomainName(domain) && domain !== "";

    if (isDuplicate) return t("Common:DomainAlreadyAdded");
    if (!isValidFormat) return t("Common:IncorrectDomain");
    return null;
  };

  const validateAllDomains = (domainsArray) => {
    return domainsArray.map((domain, index) =>
      getErrorMessage(domain, index, domainsArray),
    );
  };

  const onDeleteInput = (index) => {
    const newInputs = Array.from(domains);
    newInputs.splice(index, 1);
    setDomains(newInputs);

    setErrorMessages(validateAllDomains(newInputs));
  };

  const onCheckValid = (domain, index) => {
    const errorMessage = getErrorMessage(domain, index);

    setErrorMessages((prev) => {
      const newErrors = [...prev];
      newErrors[index] = errorMessage;
      return newErrors;
    });

    return !errorMessage;
  };

  const onSaveClick = async () => {
    setIsSaving(true);

    const valid = domains.map((domain, index) => {
      return onCheckValid(domain, index);
    });

    if (type === "1" && valid.includes(false)) {
      setIsSaving(false);
      return;
    }

    try {
      const data = {
        type: Number(type),
        domains,
        inviteUsersAsVisitors: true,
      };
      await setMailDomainSettings(data);
      saveToSessionStorage("currentTrustedMailSettings", {
        type,
        domains,
      });
      saveToSessionStorage("defaultTrustedMailSettings", {
        type,
        domains,
      });
      setShowReminder(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultTrustedMailSettings");
    saveToSessionStorage("currentTrustedMailSettings", defaultSettings);
    setType(defaultSettings?.type || "0");
    setDomains(defaultSettings?.domains || []);
    setShowReminder(false);
    setErrorMessages([]);
  };

  if ((currentDeviceType !== DeviceType.desktop && !isLoading) || !tReady) {
    return <TrustedMailLoader />;
  }

  return (
    <div className={styles.container}>
      <LearnMoreWrapper withoutExternalLink={!trustedMailDomainSettingsUrl}>
        <Text fontSize="13px" fontWeight="400">
          {t("TrustedMailSettingDescription")}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>
        {trustedMailDomainSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="trusted_mail_component_learn_more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={trustedMailDomainSettingsUrl}
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
        options={[
          {
            id: "trusted-mail-disabled",
            label: t("Common:Disabled"),
            value: "0",
            dataTestId: "trusted_mail_disabled",
          },
          {
            id: "any-domains",
            label: t("AllDomains"),
            value: "2",
            dataTestId: "trusted_mail_any_domains",
          },
          {
            id: "custom-domains",
            label: t("CustomDomains"),
            value: "1",
            dataTestId: "trusted_mail_custom_domains",
          },
        ]}
        selected={type}
        onClick={onSelectDomainType}
      />

      {type === "1" ? (
        <UserFields
          inputs={domains}
          buttonLabel={t("AddTrustedDomain")}
          onChangeInput={onChangeInput}
          onDeleteInput={onDeleteInput}
          onBlurAction={(index) => onCheckValid(domains[index], index)}
          onClickAdd={onClickAdd}
          validateFunc={isValidDomainName}
          classNameAdditional="add-trusted-domain"
          inputDataTestId="trusted_mail_domain_input"
          deleteIconDataTestId="trusted_mail_delete_domain_icon"
          addButtonDataTestId="trusted_mail_add_domain_button"
          hideDeleteIcon={domains.length === 1}
          errorMessages={errorMessages}
        />
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
        isSaving={isSaving}
        additionalClassSaveButton="trusted-mail-save"
        additionalClassCancelButton="trusted-mail-cancel"
        cancelButtonDataTestId="trusted_mail_cancel_button"
        saveButtonDataTestId="trusted_mail_save_button"
      />
    </div>
  );
};

export const TrustedMailSection = inject(({ settingsStore, setup }) => {
  const {
    trustedDomainsType,
    trustedDomains,
    setMailDomainSettings,
    currentColorScheme,
    trustedMailDomainSettingsUrl,
    currentDeviceType,
  } = settingsStore;

  const { isInit } = setup;

  return {
    trustedDomainsType,
    trustedDomains,
    setMailDomainSettings,
    currentColorScheme,
    trustedMailDomainSettingsUrl,
    currentDeviceType,
    isInit,
  };
})(withTranslation(["Settings", "Common"])(observer(TrustedMail)));
