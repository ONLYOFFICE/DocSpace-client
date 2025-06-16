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

import React, { useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { DeviceType, DeepLinkType } from "@docspace/shared/enums";
import { useDeepLinkSettings } from "@docspace/shared/hooks/useDeepLinkSettings";

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
  const {
    type,
    showReminder,
    isSaving,
    onSelect,
    onSave,
    onCancel,
    getSettings,
  } = useDeepLinkSettings({ deepLinkSettings });

  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = () => {
    if (!isMobileView && location.pathname.includes("configure-deep-link")) {
      navigate("/portal-settings/customization/general");
    }
  };

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

  return (
    <StyledWrapper>
      {!isMobileView ? (
        <Text fontSize="16px" fontWeight={700}>
          {t("ConfigureDeepLink")}
        </Text>
      ) : null}
      <Text className="category-item-description" fontSize="13px">
        {t("ConfigureDeepLinkDescription")}
      </Text>
      <RadioButtonGroup
        className="radio-button-group"
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "provide-a-choice",
            label: t("AlwaysAsk"),
            value: 0,
          },
          {
            id: "by-web",
            label: t("OpenInWebOnly", {
              productName: t("Common:ProductName"),
            }),
            value: 1,
          },
          {
            id: "by-app",
            label: t("OpenInAppOnly"),
            value: 2,
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
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
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
