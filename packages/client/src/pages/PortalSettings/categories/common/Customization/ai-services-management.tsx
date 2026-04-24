// (c) Copyright Ascensio System SIA 2009-2026
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

import withLoading from "SRC_DIR/HOCs/withLoading";

import { Text } from "@docspace/ui-kit/components/text";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { toastr } from "@docspace/ui-kit/components/toast";
import { DeviceType, FolderType } from "@docspace/shared/enums";
import { setAiAccessSettings } from "@docspace/shared/api/settings";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import CommonStore from "SRC_DIR/store/CommonStore";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";

import styles from "./customization.module.scss";
import LoaderCustomization from "../sub-components/loaderCustomization";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";
import useCommon from "../useCommon";
import DisableAiServicesDialog from "SRC_DIR/components/dialogs/DisableAiServicesDialog";
import { AI_ENUM } from "@docspace/ui-kit/billing/constants";
import { getBrandName } from "@docspace/shared/constants/brands";

interface AiServicesManagementProps {
  isMobileView: boolean;
  aiServicesEnabled: boolean;
  setAiServicesEnabled: (value: boolean) => void;
  isLoaded: boolean;
  loadBaseInfo: (page: string) => Promise<void>;
  common: CommonStore;
  isLoadedPage: boolean;
  setIsLoadedAiServicesManagement: (value: boolean) => void;
  aiServicesManagementUrl?: string;
  currentColorScheme?: SettingsStore["currentColorScheme"];
  fetchTreeFolders: TreeFoldersStore["fetchTreeFolders"];
  handleServiceQuota: (serviceName?: string) => Promise<unknown>;
  fetchAiServiceBalance: () => Promise<void>;
  defaultFolderType: SettingsStore["defaultFolderType"];
  updateDefaultFolderType: SettingsStore["updateDefaultFolderType"];
}

const AiServicesManagementComponent = ({
  isMobileView,
  aiServicesEnabled,
  setAiServicesEnabled,
  isLoaded,
  loadBaseInfo,
  common,
  isLoadedPage,
  setIsLoadedAiServicesManagement,
  aiServicesManagementUrl,
  currentColorScheme,
  fetchTreeFolders,
  handleServiceQuota,
  fetchAiServiceBalance,
  defaultFolderType,
  updateDefaultFolderType,
}: AiServicesManagementProps) => {
  const { t, ready } = useTranslation(["Settings", "Common", "AISettings"]);
  const navigate = useNavigate();
  const location = useLocation();

  const [type, setType] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  const isLoadedSetting = isLoaded && ready;

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    common,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

  const getSettings = () => {
    const defaultValue =
      aiServicesEnabled !== null && aiServicesEnabled !== undefined
        ? aiServicesEnabled
        : true;
    setType(defaultValue);
  };

  useEffect(() => {
    if (isMobileView) getCommonInitialValue();
  }, [isMobileView, getCommonInitialValue]);

  useEffect(() => {
    if (isLoadedSetting) setIsLoadedAiServicesManagement(isLoadedSetting);
  }, [isLoadedSetting]);

  useEffect(() => {
    if (aiServicesEnabled === type) {
      setShowReminder(false);
    } else {
      setShowReminder(true);
    }
  }, [type, aiServicesEnabled]);

  useEffect(() => {
    const checkWidth = () => {
      if (
        !isMobileView &&
        location.pathname.includes("ai-services-management")
      ) {
        navigate("/portal-settings/customization/general");
      }
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [isMobileView, location.pathname, navigate]);

  useEffect(() => {
    if (aiServicesEnabled === null || aiServicesEnabled === undefined) return;
    getSettings();
  }, [aiServicesEnabled]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "true";
    if (type !== newValue) {
      setType(newValue);
    }
  };

  const onSave = async () => {
    if (type === false) {
      try {
        await Promise.all([
          handleServiceQuota(AI_ENUM),
          fetchAiServiceBalance(),
        ]);
        setShowDisableDialog(true);
      } catch (e) {
        toastr.error(e as string);
      }
      return;
    }

    try {
      setIsSaving(true);
      await setAiAccessSettings(type);
      setAiServicesEnabled(type);
      await fetchTreeFolders();
      setShowReminder(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e as string);
    } finally {
      setIsSaving(false);
    }
  };

  const onConfirmDisable = async () => {
    try {
      setIsSaving(true);
      await setAiAccessSettings(false);
      setAiServicesEnabled(false);

      if (defaultFolderType === FolderType.AIAgents) {
        await updateDefaultFolderType(FolderType.Rooms);
      }

      await fetchTreeFolders();
      setShowReminder(false);
      setShowDisableDialog(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e as string);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancelDisable = () => {
    setType(aiServicesEnabled);
    setShowDisableDialog(false);
    setShowReminder(false);
  };

  const onCancel = () => {
    setType(aiServicesEnabled);
    setShowReminder(false);
  };

  if (!isLoadedPage) return <LoaderCustomization aiServicesManagement />;

  return (
    <div className={styles.wrapper}>
      {!isMobileView ? (
        <Text fontSize="16px" fontWeight={700}>
          {t("AiServicesManagement", {
            aiServices: t("Common:AIServices"),
          })}
        </Text>
      ) : null}
      <Text className="category-item-description" fontSize="13px">
        {t("AiServicesManagementDescription", {
          productName: getBrandName("ProductName"),
          aiAgents: t("Common:AIAgents"),
          aiSettings: t("AISettings"),
          aiServices: t("Common:AIServices"),
          organizationName: getBrandName("OrganizationName"),
        })}
      </Text>
      {aiServicesManagementUrl ? (
        <Link
          className="link-learn-more"
          color={currentColorScheme?.main?.accent ?? undefined}
          target={LinkTarget.blank}
          isHovered
          href={aiServicesManagementUrl}
          fontWeight={600}
          dataTestId="ai_services_management_learn_more"
        >
          {t("Common:LearnMore")}
        </Link>
      ) : null}
      <RadioButtonGroup
        className={styles.radioButtonGroup}
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        dataTestId="ai_services_management_radio_button_group"
        options={[
          {
            id: "enable",
            label: t("Common:Enable"),
            value: "true",
            dataTestId: "ai_services_management_enable",
          },
          {
            id: "disabled",
            label: t("Common:Disable"),
            value: "false",
            dataTestId: "ai_services_management_disabled",
          },
        ]}
        selected={type.toString()}
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
        saveButtonDataTestId="ai_services_management_save_button"
        cancelButtonDataTestId="ai_services_management_cancel_button"
      />
      <DisableAiServicesDialog
        visible={showDisableDialog}
        onClose={onCancelDisable}
        onContinue={onConfirmDisable}
        isLoading={isSaving}
      />
    </div>
  );
};

export const AiServicesManagement = inject<TStore>(
  ({
    settingsStore,
    common,
    treeFoldersStore,
    paymentStore,
    servicesStore,
  }) => {
    const {
      aiServicesEnabled,
      setAiServicesEnabled,
      deviceType,
      currentColorScheme,
      aiServicesManagementUrl,
      defaultFolderType,
      updateDefaultFolderType,
    } = settingsStore;
    const { isLoaded, initSettings, setIsLoadedAiServicesManagement } = common;
    const { fetchTreeFolders } = treeFoldersStore;
    const { handleServiceQuota } = paymentStore;
    const { fetchAiServiceBalance } = servicesStore;
    const isMobileView = deviceType === DeviceType.mobile;
    return {
      isMobileView,
      aiServicesEnabled,
      setAiServicesEnabled,
      isLoaded,
      setIsLoadedAiServicesManagement,
      aiServicesManagementUrl,
      currentColorScheme,
      loadBaseInfo: async (page: string) => {
        await initSettings(page);
      },
      common,
      fetchTreeFolders,
      handleServiceQuota,
      fetchAiServiceBalance,
      defaultFolderType,
      updateDefaultFolderType,
    };
  },
)(withLoading(observer(AiServicesManagementComponent)));

