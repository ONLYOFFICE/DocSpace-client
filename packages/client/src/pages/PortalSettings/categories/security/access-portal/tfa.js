// (c) Copyright Ascensio System SIA 2009-2024
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
            label: t("Common:Disabled"),
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
