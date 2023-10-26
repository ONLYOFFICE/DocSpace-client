import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import RadioButtonGroup from "@docspace/components/radio-button-group";
import Text from "@docspace/components/text";
import Link from "@docspace/components/link";
import toastr from "@docspace/components/toast/toastr";
import { LearnMoreWrapper } from "../StyledSecurity";
import { size } from "@docspace/components/utils/device";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

import TfaLoader from "../sub-components/loaders/tfa-loader";
import { DeviceType } from "@docspace/common/constants";

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
    getTfaType,
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

  const getTfaTypeFn = async () => {
    await getTfaType();
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (smsAvailable === null || appAvailable === null) getTfaTypeFn();
  }, [smsAvailable, appAvailable]);

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
    const { t, setTfaSettings, getTfaConfirmLink } = props;

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
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="TwoFactorAuthNote" />
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main.accent}
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

export default inject(({ auth, setup }) => {
  const {
    setTfaSettings,
    getTfaConfirmLink,
    tfaSettings,
    smsAvailable,
    appAvailable,
    getTfaType,
  } = auth.tfaStore;

  const { isInit, initSettings, setIsInit } = setup;
  const { currentColorScheme, tfaSettingsUrl, currentDeviceType } =
    auth.settingsStore;

  return {
    setTfaSettings,
    getTfaConfirmLink,
    tfaSettings,
    smsAvailable,
    appAvailable,
    isInit,
    initSettings,
    setIsInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    getTfaType,
  };
})(withTranslation(["Settings", "Common"])(observer(TwoFactorAuth)));
