import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { LearnMoreWrapper } from "../StyledSecurity";
import { size } from "@docspace/shared/utils";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import TfaLoader from "../sub-components/loaders/tfa-loader";
import { DeviceType } from "@docspace/shared/enums";

const MainContainer = styled.div`
  width: 100%;

  .box {
    margin-bottom: 24px;
  }
`;

const TwoFactorAuth = (props) => {
  const {
    t,
    initSettings,
    isInit,
    setIsInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    smsAvailable,
    appAvailable,
    tfaSettings,
  } = props;
  const [type, setType] = useState("none");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getSettings = async () => {
    const currentSettings = getFromSessionStorage("currentTfaSettings");

    saveToSessionStorage("defaultTfaSettings", tfaSettings);

    if (currentSettings) {
      setType(currentSettings);
    } else {
      setType(tfaSettings);
    }
    setIsLoading(true);
  };

  useEffect(() => {
    checkWidth();

    if (!isInit) initSettings("tfa").then(() => setIsLoading(true));
    else setIsLoading(true);

    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    tfaSettings && getSettings();
  }, [tfaSettings]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage("defaultTfaSettings");
    saveToSessionStorage("currentTfaSettings", type);

    if (defaultSettings === type) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type]);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("tfa") &&
      navigate("/portal-settings/security/access-portal");
  };

  const onSelectTfaType = (e) => {
    if (type !== e.target.value) {
      setType(e.target.value);
    }
  };

  const onSaveClick = async () => {
    const { t, setTfaSettings } = props;

    setIsSaving(true);

    try {
      const res = await setTfaSettings(type);

      toastr.success(t("SuccessfullySaveSettingsMessage"));
      saveToSessionStorage("defaultTfaSettings", type);
      setIsSaving(false);
      setShowReminder(false);

      if (res) {
        setIsInit(false);
        navigate(res.replace(window.location.origin, ""));
      }
    } catch (error) {
      toastr.error(error);
    }
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage("defaultTfaSettings");
    setType(defaultSettings);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isInit && !isLoading) {
    return <TfaLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400">
          {t("TwoFactorAuthEnableDescription")}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={tfaSettingsUrl}
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
            id: "tfa-disabled",
            label: t("Disabled"),
            value: "none",
          },
          //TODO: hide while 2fa by sms is not working
          /*{
            id: "by-sms",
            label: t("BySms"),
            value: "sms",
            disabled: !smsAvailable,
          },*/
          {
            id: "by-app",
            label: t("ByApp"),
            value: "app",
            disabled: !appAvailable,
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
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings={true}
        hasScroll={false}
        isSaving={isSaving}
        additionalClassSaveButton="two-factor-auth-save"
        additionalClassCancelButton="two-factor-auth-cancel"
      />
    </MainContainer>
  );
};

export default inject(({ settingsStore, setup, tfaStore }) => {
  const {
    setTfaSettings,

    tfaSettings,
    smsAvailable,
    appAvailable,
  } = tfaStore;

  const { isInit, initSettings, setIsInit } = setup;
  const { currentColorScheme, tfaSettingsUrl, currentDeviceType } =
    settingsStore;

  return {
    setTfaSettings,

    tfaSettings,
    smsAvailable,
    appAvailable,
    isInit,
    initSettings,
    setIsInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(TwoFactorAuth)));
