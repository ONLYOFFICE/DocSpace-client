import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { toastr } from "@docspace/shared/components/toast";
import { LearnMoreWrapper } from "../StyledSecurity";
import UserFields from "../sub-components/user-fields";
import { size } from "@docspace/shared/utils";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import IpSecurityLoader from "../sub-components/loaders/ip-security-loader";
import { DeviceType } from "@docspace/shared/enums";

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
  }

  .save-cancel-buttons {
    margin-top: 24px;
  }
`;

const IpSecurity = (props) => {
  const {
    t,
    ipRestrictionEnable,
    setIpRestrictionsEnable,
    ipRestrictions,
    setIpRestrictions,
    initSettings,
    isInit,
    ipSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const regexp = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/; //check ip valid

  const [enable, setEnable] = useState(false);
  const [ips, setIps] = useState();
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    checkWidth();
    window.addEventListener("resize", checkWidth);

    if (!isInit) initSettings("ip").then(() => setIsLoading(true));
    else setIsLoading(true);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isInit) return;
    getSettings();
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage("defaultIPSettings");
    const newSettings = {
      enable: enable,
      ips: ips,
    };
    saveToSessionStorage("currentIPSettings", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [enable, ips]);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("ip") &&
      navigate("/portal-settings/security/access-portal");
  };

  const onSelectType = (e) => {
    setEnable(e.target.value === "enable" ? true : false);
  };

  const onChangeInput = (e, index) => {
    let newInputs = Array.from(ips);
    newInputs[index] = e.target.value;
    setIps(newInputs);
  };

  const onDeleteInput = (index) => {
    let newInputs = Array.from(ips);
    newInputs.splice(index, 1);
    setIps(newInputs);
  };

  const onClickAdd = () => {
    setIps([...ips, ""]);
  };

  const onSaveClick = async () => {
    const newIps = ips.filter((ips) => ips.trim() !== "");
    setIps(newIps);
    setIsSaving(true);
    const valid = ips.map((ip) => regexp.test(ip));
    if (valid.includes(false)) {
      setIsSaving(false);
      return;
    }

    const ipsObjectArr = ips.map((ip) => {
      return { ip: ip };
    });

    try {
      await setIpRestrictions(ipsObjectArr);
      await setIpRestrictionsEnable(enable);

      saveToSessionStorage("defaultIPSettings", {
        enable: enable,
        ips: ips,
      });
      setShowReminder(false);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
    } catch (error) {
      toastr.error(error);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultIPSettings");
    setEnable(defaultSettings.enable);
    setIps(defaultSettings.ips);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isInit && !isLoading) {
    return <IpSecurityLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text className="page-subtitle">
          {t("IPSecuritySettingDescription")}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={ipSettingsUrl}
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
            id: "ip-security-disabled",
            label: t("Disabled"),
            value: "disabled",
          },
          {
            id: "ip-security-enable",
            label: t("Common:Enable"),
            value: "enable",
          },
        ]}
        selected={enable ? "enable" : "disabled"}
        onClick={onSelectType}
      />

      {enable && (
        <UserFields
          className="user-fields"
          inputs={ips}
          buttonLabel={t("AddAllowedIP")}
          onChangeInput={onChangeInput}
          onDeleteInput={onDeleteInput}
          onClickAdd={onClickAdd}
          regexp={regexp}
          classNameAdditional="add-allowed-ip-address"
        />
      )}

      {enable && (
        <>
          <Text
            color="#F21C0E"
            fontSize="16px"
            fontWeight="700"
            className="warning-text"
          >
            {t("Common:Warning")}!
          </Text>
          <Text className="ip-security_warning">
            {t("IPSecurityWarningHelper")}
          </Text>
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
        isSaving={isSaving}
        additionalClassSaveButton="ip-security-save"
        additionalClassCancelButton="ip-security-cancel"
      />
    </MainContainer>
  );
};

export default inject(({ settingsStore, setup }) => {
  const {
    ipRestrictionEnable,
    setIpRestrictionsEnable,
    ipRestrictions,
    setIpRestrictions,
    ipSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  } = settingsStore;

  const { initSettings, isInit } = setup;

  return {
    ipRestrictionEnable,
    setIpRestrictionsEnable,
    ipRestrictions,
    setIpRestrictions,
    initSettings,
    isInit,
    ipSettingsUrl,
    currentColorScheme,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(IpSecurity)));
