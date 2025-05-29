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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";

import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { size } from "@docspace/shared/utils";
import type { TColorScheme } from "@docspace/shared/themes";

import type { TData } from "@docspace/shared/components/toast/Toast.type";

import { LearnMoreWrapper } from "../StyledSecurity";

const MainContainer = styled.div`
  width: 100%;

  .box {
    margin-bottom: 24px;
  }
`;

const DevToolsAccess = ({
  accessDevToolsForUsers,
  setDevToolsAccessSettings,
  currentColorScheme,
  limitedDevToolsBlockHelpUrl,
}: {
  accessDevToolsForUsers: string;
  setDevToolsAccessSettings: (accessEnabled: string) => Promise<void>;
  currentColorScheme: TColorScheme;
  limitedDevToolsBlockHelpUrl: string;
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const [accessEnabled, setAccessEnabled] = useState("false");
  const [showReminder, setShowReminder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("access-dev-tools") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettingsFromDefault = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultDevToolsAccessSettings",
    );
    if (defaultSettings) setAccessEnabled(defaultSettings);
    setIsLoading(true);
  };

  const getSettings = async () => {
    const currentSettings = getFromSessionStorage(
      "currentDevToolsAccessSettings",
    );

    saveToSessionStorage(
      "defaultDevToolsAccessSettings",
      accessDevToolsForUsers,
    );

    if (currentSettings) {
      setAccessEnabled(currentSettings);
    } else {
      setAccessEnabled(accessDevToolsForUsers);
    }
    setIsLoading(true);
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    const currentSettings = getFromSessionStorage(
      "currentDevToolsAccessSettings",
    );
    const defaultSettings = getFromSessionStorage(
      "defaultDevToolsAccessSettings",
    );

    if (currentSettings === defaultSettings) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const currentSettings = getFromSessionStorage(
      "currentDevToolsAccessSettings",
    );
    const defaultSettings = getFromSessionStorage(
      "defaultDevToolsAccessSettings",
    );

    if (currentSettings === defaultSettings) {
      getSettings();
    } else {
      getSettingsFromDefault();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    const defaultSettings = getFromSessionStorage(
      "defaultDevToolsAccessSettings",
    );
    saveToSessionStorage("currentDevToolsAccessSettings", accessEnabled);

    if (defaultSettings === accessEnabled) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [accessEnabled]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (accessEnabled !== e.target.value) {
      setAccessEnabled(e.target.value);
    }
  };

  const onSaveClick = async () => {
    setIsSaving(true);

    try {
      await setDevToolsAccessSettings(accessEnabled);
      setAccessEnabled(accessEnabled);
      setShowReminder(false);
      saveToSessionStorage("defaultDevToolsAccessSettings", accessEnabled);
      saveToSessionStorage("currentDevToolsAccessSettings", accessEnabled);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
    } catch (error: unknown) {
      const message = (error as { message: string }).message
        ? ((error as { message: string }).message as TData)
        : (error as string);

      toastr.error(message);
    }

    setIsSaving(false);
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultDevToolsAccessSettings",
    );
    saveToSessionStorage("currentDevToolsAccessSettings", defaultSettings);
    setAccessEnabled(defaultSettings || "disabled");
    setShowReminder(false);
  };

  return (
    <MainContainer>
      <LearnMoreWrapper>
        <Text fontSize="13px" fontWeight="400">
          {t("DeveloperToolsAccessDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {limitedDevToolsBlockHelpUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target={LinkTarget.blank}
            isHovered
            href={limitedDevToolsBlockHelpUrl}
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
            id: "dev-tools-access-disabled",
            label: t("Common:Disabled"),
            value: "true",
          },
          {
            id: "dev-tools-access-enable",
            label: t("Common:Enable"),
            value: "false",
          },
        ]}
        selected={accessEnabled}
        onClick={onSelect}
      />

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
        additionalClassSaveButton="dev-tools-access-save"
        additionalClassCancelButton="dev-tools-access-cancel"
      />
    </MainContainer>
  );
};

export const DevToolsAccessSection = inject(({ settingsStore }: TStore) => {
  const {
    accessDevToolsForUsers,
    setDevToolsAccessSettings,
    currentColorScheme,
    limitedDevToolsBlockHelpUrl,
  } = settingsStore;

  return {
    accessDevToolsForUsers,
    setDevToolsAccessSettings,
    currentColorScheme,
    limitedDevToolsBlockHelpUrl,
  };
})(observer(DevToolsAccess));
