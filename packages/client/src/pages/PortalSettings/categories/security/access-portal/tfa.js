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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { size } from "@docspace/shared/utils";
import isEqual from "lodash/isEqual";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType } from "@docspace/shared/enums";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import TfaLoader from "../sub-components/loaders/tfa-loader";
import { LearnMoreWrapper } from "../StyledSecurity";

const MainContainer = styled.div`
  width: 100%;

  .box {
    margin-bottom: 24px;
  }
`;

const TwoFactorAuth = (props) => {
  const {
    t,
    isInit,
    setIsInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    appAvailable,
    tfaSettings,
    getTfaType,
    onSettingsSkeletonNotShown,
  } = props;

  const [type, setType] = useState("none");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
    setIsLoading(true);
  };

  useEffect(() => {
    if (!onSettingsSkeletonNotShown) return;
    if (!(currentDeviceType !== DeviceType.desktop && !isLoading))
      onSettingsSkeletonNotShown("Tfa");
  }, [currentDeviceType, isLoading]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    if (!isInit) getTfaType().then(() => setIsLoading(true));
    else setIsLoading(true);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isLoading || !tfaSettings) return;
    const currentSettings = getFromSessionStorage("currentTfaSettings");
    const defaultSettings = getFromSessionStorage("defaultTfaSettings");

    if (isEqual(currentSettings, defaultSettings)) {
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

  if (currentDeviceType !== DeviceType.desktop && !isLoading) {
    return <TfaLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper withoutExternalLink={!tfaSettingsUrl}>
        <Text fontSize="13px" fontWeight="400">
          {t("TwoFactorAuthEnableDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {tfaSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={tfaSettingsUrl}
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
        options={[
          {
            id: "tfa-disabled",
            label: t("Common:Disabled"),
            value: "none",
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
      />
    </MainContainer>
  );
};

export const TfaSection = inject(({ settingsStore, setup, tfaStore }) => {
  const {
    setTfaSettings,

    tfaSettings,
    smsAvailable,
    appAvailable,
    getTfaType,
  } = tfaStore;

  const { isInit, setIsInit } = setup;
  const { currentColorScheme, tfaSettingsUrl, currentDeviceType } =
    settingsStore;

  return {
    setTfaSettings,

    tfaSettings,
    smsAvailable,
    appAvailable,
    isInit,
    setIsInit,
    currentColorScheme,
    tfaSettingsUrl,
    currentDeviceType,
    getTfaType,
  };
})(withTranslation(["Settings", "Common"])(observer(TwoFactorAuth)));
