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
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { toastr } from "@docspace/shared/components/toast";
import { size, isMobileDevice } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { LearnMoreWrapper } from "../StyledSecurity";
import UserFields from "../sub-components/user-fields";
import useSecurity from "../useSecurity";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

import IpSecurityLoader from "../sub-components/loaders/ip-security-loader";

const MainContainer = styled.div`
  width: 100%;

  .ip-security_warning {
    max-width: 700px;
  }

  .page-subtitle {
    margin-bottom: 10px;
  }

  .user-fields {
    margin-bottom: 18px;
  }

  .box {
    margin-bottom: 11px;
  }

  .warning-text {
    margin-bottom: 9px;
    color: ${(props) => props.theme.client.settings.security.ip.errorColor};
  }

  .save-cancel-buttons {
    margin-top: 24px;
  }
`;

const IpSecurity = (props) => {
  const {
    t,
    tReady,
    ipRestrictionEnable,
    ipRestrictions,
    setIpRestrictions,
    ipSettingsUrl,
    currentColorScheme,
    currentDeviceType,

    settingsStore,
    tfaStore,
    setup,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const regexp = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/; // check ip valid

  const [enable, setEnable] = useState(false);
  const [ips, setIps] = useState();
  const [showReminder, setShowReminder] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);

  const defaultProps = createDefaultHookSettingsProps({
    settingsStore,
    tfaStore,
    setup,
  });

  const { getSecurityInitialValue } = useSecurity(defaultProps.security);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("ip") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage("defaultIPSettings");
    if (defaultSettings) {
      setEnable(defaultSettings.enable);
      setIps(defaultSettings.ips);
    }
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentIPSettings");
    const defaultData = {
      enable: ipRestrictionEnable,
      ips: ipRestrictions,
    };
    saveToSessionStorage("defaultIPSettings", defaultData);

    if (currentSettings) {
      setEnable(currentSettings.enable);
      setIps(currentSettings.ips);
    } else {
      setEnable(ipRestrictionEnable);
      setIps(ipRestrictions);
    }
  };

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
    const currentSettings = getFromSessionStorage("currentIPSettings");
    const defaultSettings = getFromSessionStorage("defaultIPSettings");

    if (isEqual(currentSettings, defaultSettings)) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, []);

  useEffect(() => {
    const defaultSettings = getFromSessionStorage("defaultIPSettings");
    const newSettings = {
      enable,
      ips,
    };
    saveToSessionStorage("currentIPSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [enable, ips]);

  const onSelectType = (e) => {
    const value = e.target.value;
    if (value === "enable" && !autoFocus) setAutoFocus(true);
    setEnable(value === "enable");
  };

  const onChangeInput = (e, index) => {
    const newInputs = Array.from(ips);
    newInputs[index] = e.target.value;
    setIps(newInputs);
  };

  const onDeleteInput = (index) => {
    const newInputs = Array.from(ips);
    newInputs.splice(index, 1);
    setIps(newInputs);
  };

  const onClickAdd = () => {
    if (!autoFocus) setAutoFocus(true);
    setIps([...ips, ""]);
  };

  const onSaveClick = async () => {
    const newIps = ips.filter((ip) => ip.trim() !== "");

    setIps(newIps);
    setIsSaving(true);
    const valid = newIps.map((ip) => regexp.test(ip));

    if (valid.includes(false)) {
      setIsSaving(false);
      return;
    }

    const ipsObjectArr = newIps.map((ip) => {
      return { ip };
    });

    try {
      await setIpRestrictions(ipsObjectArr, enable);

      saveToSessionStorage("currentIPSettings", {
        enable,
        ips: newIps,
      });
      saveToSessionStorage("defaultIPSettings", {
        enable,
        ips: newIps,
      });
      setShowReminder(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultIPSettings");
    setEnable(defaultSettings?.enable);
    setIps(defaultSettings?.ips);
    setShowReminder(false);
  };

  if ((currentDeviceType === DeviceType.mobile && !isLoaded) || !tReady) {
    return <IpSecurityLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper withoutExternalLink={!ipSettingsUrl}>
        <Text className="page-subtitle">
          {t("IPSecuritySettingDescription")}
        </Text>
        {ipSettingsUrl ? (
          <Link
            className="link-learn-more"
            dataTestId="ip_security_component_learn_more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={ipSettingsUrl}
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
        dataTestId="ip_security_radio_button_group"
        options={[
          {
            id: "ip-security-disabled",
            label: t("Common:Disabled"),
            value: "disabled",
            dataTestId: "ip_security_disabled",
          },
          {
            id: "ip-security-enable",
            label: t("Common:Enable"),
            value: "enable",
            dataTestId: "ip_security_enabled",
          },
        ]}
        selected={enable ? "enable" : "disabled"}
        onClick={onSelectType}
      />

      {enable ? (
        <UserFields
          className="user-fields"
          inputs={ips}
          buttonLabel={t("AddAllowedIP")}
          onChangeInput={onChangeInput}
          onDeleteInput={onDeleteInput}
          onClickAdd={onClickAdd}
          regexp={regexp}
          classNameAdditional="add-allowed-ip-address"
          isAutoFocussed={autoFocus}
          inputDataTestId="ip_security_ip_input"
          deleteIconDataTestId="ip_security_delete_ip_icon"
          addButtonDataTestId="ip_security_add_ip_button"
        />
      ) : null}

      {enable ? (
        <>
          <Text fontSize="16px" fontWeight="700" className="warning-text">
            {t("Common:Warning")}
          </Text>
          <Text className="ip-security_warning">
            {t("IPSecurityWarningHelper")}
          </Text>
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
        isSaving={isSaving}
        additionalClassSaveButton="ip-security-save"
        additionalClassCancelButton="ip-security-cancel"
        saveButtonDataTestId="ip_security_save_button"
        cancelButtonDataTestId="ip_security_cancel_button"
      />
    </MainContainer>
  );
};

export const IpSecuritySection = inject(
  ({ settingsStore, tfaStore, setup }) => {
    const {
      ipRestrictionEnable,
      ipRestrictions,
      setIpRestrictions,
      ipSettingsUrl,
      currentColorScheme,
      currentDeviceType,
    } = settingsStore;

    return {
      ipRestrictionEnable,
      ipRestrictions,
      setIpRestrictions,

      ipSettingsUrl,
      currentColorScheme,
      currentDeviceType,

      settingsStore,
      tfaStore,
      setup,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(IpSecurity)));
