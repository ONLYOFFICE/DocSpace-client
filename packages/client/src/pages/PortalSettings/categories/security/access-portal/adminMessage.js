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

import { useState, useEffect } from "react";
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
import isEqual from "lodash/isEqual";

import AdmMsgLoader from "../sub-components/loaders/admmsg-loader";
import { DeviceType } from "@docspace/shared/enums";

const MainContainer = styled.div`
  width: 100%;

  .page-subtitle {
    margin-bottom: 10px;
  }

  .box {
    margin-bottom: 24px;
  }
`;

const AdminMessage = (props) => {
  const {
    t,

    enableAdmMess,
    setMessageSettings,
    initSettings,
    isInit,
    currentColorScheme,
    administratorMessageSettingsUrl,
    currentDeviceType,
  } = props;
  const [type, setType] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

    if (!isInit) initSettings("admin-message").then(() => setIsLoading(true));
    else setIsLoading(true);

    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isInit) return;
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
  }, [isLoading, isInit]);

  useEffect(() => {
    if (!isLoading) return;

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

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("admin-message") &&
      navigate("/portal-settings/security/access-portal");
  };

  const onSelectType = (e) => {
    if (type !== e.target.value) {
      setType(e.target.value);
    }
  };

  const onSaveClick = () => {
    const turnOn = type === "enable" ? true : false;
    setMessageSettings(turnOn);
    toastr.success(t("SuccessfullySaveSettingsMessage"));
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

  if (currentDeviceType !== DeviceType.desktop && !isInit && !isLoading) {
    return <AdmMsgLoader />;
  }

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text>
          {t("AdminsMessageSettingDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <Text fontSize="13px" fontWeight="400" className="learn-subtitle">
          <Trans t={t} i18nKey="SaveToApply" />
        </Text>

        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={administratorMessageSettingsUrl}
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
            id: "admin-message-disabled",
            label: t("Common:Disabled"),
            value: "disabled",
          },
          {
            id: "admin-message-enable",
            label: t("Common:Enable"),
            value: "enable",
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
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings={true}
        hasScroll={false}
        additionalClassSaveButton="admin-message-save"
        additionalClassCancelButton="admin-message-cancel"
      />
    </MainContainer>
  );
};

export const AdminMessageSection = inject(({ settingsStore, setup }) => {
  const {
    enableAdmMess,
    setMessageSettings,
    currentColorScheme,
    administratorMessageSettingsUrl,
    currentDeviceType,
  } = settingsStore;
  const { initSettings, isInit } = setup;

  return {
    enableAdmMess,
    setMessageSettings,
    initSettings,
    isInit,
    currentColorScheme,
    administratorMessageSettingsUrl,
    currentDeviceType,
  };
})(withTranslation(["Settings", "Common"])(observer(AdminMessage)));
