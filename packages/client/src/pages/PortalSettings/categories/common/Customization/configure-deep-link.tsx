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
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import { Text } from "@docspace/shared/components/text";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { toastr } from "@docspace/shared/components/toast";

import { DeviceType, DeepLinkType } from "@docspace/shared/enums";
import { saveDeepLinkSettings } from "@docspace/shared/api/settings";

import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";

interface Props {
  isMobileView: boolean;
  deepLinkSettings: DeepLinkType;
  initSettings: (path: string) => Promise<void>;
}

const StyledWrapper = styled.div`
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .radio-button-group {
    width: fit-content;
    margin-top: 8px;
  }

  .save-cancel-buttons {
    margin-top: 16px;
  }
`;

const ConfigureDeepLinkComponent = (props: Props) => {
  const { isMobileView, deepLinkSettings, initSettings } = props;

  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const [type, setType] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentConfigureDeepLink");
    saveToSessionStorage("defaultConfigureDeepLink", deepLinkSettings);

    if (currentSettings) {
      setType(currentSettings);
    } else {
      setType(deepLinkSettings);
    }
  };

  const checkWidth = () => {
    if (!isMobileView && location.pathname.includes("configure-deep-link")) {
      navigate("/portal-settings/customization/general");
    }
  };

  useEffect(() => {
    const defaultSettings = getFromSessionStorage("defaultConfigureDeepLink");

    if (isEqual(Number(defaultSettings), type)) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type]);

  useEffect(() => {
    initSettings(isMobileView ? "configure-deep-link" : "general");
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!deepLinkSettings) return;
    getSettings();
  }, [deepLinkSettings]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type !== Number(e.target.value)) {
      saveToSessionStorage("currentConfigureDeepLink", Number(e.target.value));
      setType(Number(e.target.value));
    }
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      await saveDeepLinkSettings(type);
      setShowReminder(false);
      saveToSessionStorage("defaultConfigureDeepLink", type);
      saveToSessionStorage("currentConfigureDeepLink", type);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e!);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    const defaultSettings = getFromSessionStorage("defaultConfigureDeepLink");
    const defaultType = defaultSettings || DeepLinkType.Choice;
    setType(Number(defaultType));
    saveToSessionStorage("currentConfigureDeepLink", defaultType);
    setShowReminder(false);
  };

  return (
    <StyledWrapper>
      {!isMobileView ? (
        <Text fontSize="16px" fontWeight={700}>
          {t("ConfigureDeepLink")}
        </Text>
      ) : null}
      <Text>{t("ConfigureDeepLinkDescription")}</Text>
      <RadioButtonGroup
        className="radio-button-group"
        fontSize="13px"
        fontWeight={400}
        dataTestId="configure_deep_link_radio-button"
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "provide-a-choice",
            label: t("ProvideChoice"),
            value: 0,
            dataTestId: "deep_link_provide-a-choice",
          },
          {
            id: "by-web",
            label: t("OpenInWebOnly"),
            value: 1,
            dataTestId: "deep_link_by-web",
          },
          {
            id: "by-app",
            label: t("OpenInAppOnly"),
            value: 2,
            dataTestId: "deep_link_by-app",
          },
        ]}
        selected={type}
        onClick={onSelect}
      />
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSave}
        onCancelClick={onCancel}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
        saveButtonDataTestId="configure_deep_link_save_button"
        cancelButtonDataTestId="configure_deep_link_cancel_button"
      />
    </StyledWrapper>
  );
};

export const ConfigureDeepLink = inject<TStore>(({ settingsStore, common }) => {
  const isMobileView = settingsStore.currentDeviceType === DeviceType.mobile;
  const { deepLinkSettings, initSettings } = common;
  return {
    isMobileView,
    deepLinkSettings,
    initSettings,
  };
})(observer(ConfigureDeepLinkComponent));
