import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import isEqual from "lodash/isEqual";
import { DeepLinkType } from "@docspace/shared/enums";
import {
  getFromSessionStorage,
  saveToSessionStorage,
} from "@docspace/shared/utils";
import { toastr } from "@docspace/shared/components/toast";
import { saveDeepLinkSettings } from "@docspace/shared/api/settings";

export const useDeepLinkSettings = ({
  deepLinkSettings = DeepLinkType.Choice,
  isUserProfile = false,
}) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const [type, setType] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getSettings = () => {
    if (isUserProfile) {
      const userSettings = getFromSessionStorage("userConfigureDeepLink");
      const adminSettings = getFromSessionStorage("defaultConfigureDeepLink");

      if (
        adminSettings === DeepLinkType.Web ||
        adminSettings === DeepLinkType.App
      ) {
        setIsVisible(false);
        setType(adminSettings);
      } else {
        setIsVisible(true);
        if (userSettings) {
          setType(userSettings);
        } else {
          setType(adminSettings || DeepLinkType.Choice);
        }
      }
    } else {
      const currentSettings = getFromSessionStorage("currentConfigureDeepLink");
      saveToSessionStorage("defaultConfigureDeepLink", deepLinkSettings);

      if (currentSettings) {
        setType(currentSettings);
      } else {
        setType(deepLinkSettings);
      }
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

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (type !== newValue) {
      if (isUserProfile) {
        saveToSessionStorage("userConfigureDeepLink", newValue);
      } else {
        saveToSessionStorage("currentConfigureDeepLink", newValue);
      }
      setType(newValue);
      setShowReminder(true);
    }
  };

  const onSave = async () => {
    try {
      setIsSaving(true);
      if (isUserProfile) {
        //    await saveUserDeepLinkSettings(type);
        saveToSessionStorage("userConfigureDeepLink", type);
      } else {
        await saveDeepLinkSettings(type);
        saveToSessionStorage("defaultConfigureDeepLink", type);
        saveToSessionStorage("currentConfigureDeepLink", type);
      }
      setShowReminder(false);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e!);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    if (isUserProfile) {
      const userSettings = getFromSessionStorage("userConfigureDeepLink");
      const adminSettings = getFromSessionStorage("defaultConfigureDeepLink");

      if (
        adminSettings === DeepLinkType.Web ||
        adminSettings === DeepLinkType.App
      ) {
        setType(adminSettings);
      } else {
        setType(userSettings || DeepLinkType.Choice);
      }
      saveToSessionStorage("userConfigureDeepLink", type);
    } else {
      const defaultSettings = getFromSessionStorage("defaultConfigureDeepLink");
      const defaultType = defaultSettings || DeepLinkType.Choice;
      setType(Number(defaultType));
      saveToSessionStorage("currentConfigureDeepLink", defaultType);
    }
    setShowReminder(false);
  };

  return {
    type,
    showReminder,
    isSaving,
    isVisible,
    onSelect,
    onSave,
    onCancel,
    getSettings,
  };
};
