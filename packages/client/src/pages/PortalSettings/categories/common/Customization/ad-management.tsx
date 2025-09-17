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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";

import { Text } from "@docspace/shared/components/text";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { toastr } from "@docspace/shared/components/toast";
import { DeviceType } from "@docspace/shared/enums";
import { setAdManagement } from "@docspace/shared/api/settings";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";

import styles from "./customization.module.scss";

const AdManagementComponent = ({
  isMobileView,
  displayBanners,
  setDisplayBanners,
}: {
  isMobileView: boolean;
  displayBanners: boolean;
  setDisplayBanners: (value: boolean) => void;
}) => {
  const { t } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const [type, setType] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getSettings = () => {
    const currentSettings = getFromSessionStorage("currentDisplayBanners");
    saveToSessionStorage("defaultDisplayBanners", Number(displayBanners));

    if (currentSettings) {
      setType(currentSettings);
    } else {
      setType(Number(displayBanners));
    }
  };

  const checkWidth = () => {
    if (!isMobileView && location.pathname.includes("ad-management")) {
      navigate("/portal-settings/customization/general");
    }
  };

  useEffect(() => {
    const defaultSettings = getFromSessionStorage("defaultDisplayBanners");

    if (defaultSettings === type) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!displayBanners) return;
    getSettings();
  }, [displayBanners]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type !== Number(e.target.value)) {
      saveToSessionStorage("currentDisplayBanners", Number(e.target.value));
      setType(Number(e.target.value));
    }
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      await setAdManagement(!type);
      setDisplayBanners(Boolean(type));
      setShowReminder(false);
      saveToSessionStorage("defaultDisplayBanners", type);
      saveToSessionStorage("currentDisplayBanners", type);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e!);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    const defaultSettings = getFromSessionStorage("defaultDisplayBanners");
    const defaultType = defaultSettings || 0;
    setType(Number(defaultType));
    saveToSessionStorage("currentDisplayBanners", defaultType);
    setShowReminder(false);
  };

  return (
    <div className={styles.wrapper}>
      {!isMobileView ? (
        <Text fontSize="16px" fontWeight={700}>
          {t("AdManagement")}
        </Text>
      ) : null}
      <Text>
        {t("AdManagementDescription", { productName: t("Common:ProductName") })}
      </Text>
      <RadioButtonGroup
        className={styles.radioButtonGroup}
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        options={[
          {
            id: "disable",
            label: t("Common:Disable"),
            value: 0,
            dataTestId: "ad_management_disable",
          },
          {
            id: "enable",
            label: t("Common:Enable"),
            value: 1,
            dataTestId: "ad_management_enable",
          },
        ]}
        selected={type}
        onClick={onSelect}
      />
      <SaveCancelButtons
        className={styles.saveCancelButtons}
        onSaveClick={onSave}
        onCancelClick={onCancel}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={false}
        isSaving={isSaving}
        saveButtonDataTestId="ad_management_save_button"
        cancelButtonDataTestId="ad_management_cancel_button"
      />
    </div>
  );
};

export const AdManagement = inject<TStore>(({ settingsStore }) => {
  const { displayBanners, setDisplayBanners, currentDeviceType } =
    settingsStore;
  const isMobileView = currentDeviceType === DeviceType.mobile;
  return {
    isMobileView,
    displayBanners,
    setDisplayBanners,
  };
})(observer(AdManagementComponent));
