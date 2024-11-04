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
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { DeviceType } from "@docspace/shared/enums";

interface Props {
  isMobileView: boolean;
}

const StyledWrapper = styled.div`
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .radio-button-group {
    margin-top: 8px;
  }

  .save-cancel-buttons {
    margin-top: 16px;
  }
`;

const ConfigureDeepLinkComponent = (props: Props) => {
  const { isMobileView } = props;

  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const checkWidth = () => {
    if (!isMobileView && location.pathname.includes("configure-deep-link")) {
      navigate("/portal-settings/customization/general");
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const onSelect = () => {};

  const onSave = () => {};

  const onCancel = () => {};

  return (
    <StyledWrapper>
      {!isMobileView && (
        <Text fontSize="16px" fontWeight={700}>
          {t("ConfigureDeepLink")}
        </Text>
      )}
      <Text>{t("ConfigureDeepLinkDescription")}</Text>
      <RadioButtonGroup
        className="radio-button-group"
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "provide-a-choice",
            label: t("ProvideChoice"),
            value: "choice",
          },
          {
            id: "by-web",
            label: t("OpenInWebOnly"),
            value: "web",
          },
          {
            id: "by-app",
            label: t("OpenInAppOnly"),
            value: "app",
          },
        ]}
        selected="choice"
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

export const ConfigureDeepLink = inject(({ settingsStore }) => {
  const isMobileView = settingsStore.currentDeviceType === DeviceType.mobile;
  return {
    isMobileView,
  };
})(observer(ConfigureDeepLinkComponent));
