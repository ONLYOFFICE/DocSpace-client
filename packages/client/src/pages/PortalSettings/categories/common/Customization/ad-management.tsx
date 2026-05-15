/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";

import withLoading from "SRC_DIR/HOCs/withLoading";

import { Text } from "@docspace/ui-kit/components/text";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType } from "@docspace/shared/enums";
import { setAdManagement } from "@docspace/shared/api/settings";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import CommonStore from "SRC_DIR/store/CommonStore";

import styles from "./customization.module.scss";
import LoaderCustomization from "../sub-components/loaderCustomization";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import useCommon from "../useCommon";
import { getBrandName } from "@docspace/shared/constants/brands";

const AdManagementComponent = ({
  isMobileView,
  displayBanners,
  setDisplayBanners,
  isLoaded,
  loadBaseInfo,
  common,
  settingsStore,
  isLoadedPage,
  setIsLoadedAdManagement,
}: {
  isMobileView: boolean;
  displayBanners: boolean;
  setDisplayBanners: (value: boolean) => void;
  isLoaded: boolean;
  loadBaseInfo: (page: string) => Promise<void>;
  common: CommonStore;
  settingsStore: SettingsStore;
  isLoadedPage: boolean;
  setIsLoadedAdManagement: (value: boolean) => void;
}) => {
  const { t, ready } = useTranslation(["Settings", "Common"]);
  const navigate = useNavigate();
  const location = useLocation();

  const [type, setType] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isLoadedSetting = isLoaded && ready;

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    common,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

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
    if (isMobileView) getCommonInitialValue();
  }, [isMobileView]);

  useEffect(() => {
    if (isLoadedSetting) setIsLoadedAdManagement(isLoadedSetting);
  }, [isLoadedSetting]);

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

  if (!isLoadedPage) return <LoaderCustomization adManagement />;

  return (
    <div className={styles.wrapper}>
      {!isMobileView ? (
        <Text fontSize="16px" fontWeight={700}>
          {t("AdManagement")}
        </Text>
      ) : null}
      <Text>
        {t("AdManagementDescription", { productName: getBrandName("ProductName") })}
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

export const AdManagement = inject<TStore>(({ settingsStore, common }) => {
  const { displayBanners, setDisplayBanners, deviceType } = settingsStore;
  const { isLoaded, initSettings, setIsLoadedAdManagement } = common;
  const isMobileView = deviceType === DeviceType.mobile;
  return {
    isMobileView,
    displayBanners,
    setDisplayBanners,
    isLoaded,
    setIsLoadedAdManagement,

    loadBaseInfo: async (page: string) => {
      await initSettings(page);
    },
    common,
    settingsStore,
  };
})(withLoading(observer(AdManagementComponent)));
