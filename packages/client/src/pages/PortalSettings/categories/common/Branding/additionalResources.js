import React, { useState, useEffect, useCallback } from "react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { inject, observer } from "mobx-react";
import isEqual from "lodash/isEqual";

import api from "@docspace/shared/api";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { toastr } from "@docspace/shared/components/toast";
import { mobile, size } from "@docspace/shared/utils";
import { isManagement } from "@docspace/shared/utils/common";

import withLoading from "SRC_DIR/HOCs/withLoading";
import LoaderAdditionalResources from "../sub-components/loaderAdditionalResources";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";

const StyledComponent = styled.div`
  margin-top: 40px;

  @media ${mobile} {
    margin-top: 0px;

    .header {
      display: none;
    }
  }

  .branding-checkbox {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 24px;
  }

  .additional-header {
    padding-bottom: 2px;
  }

  .additional-description {
    padding-bottom: 18px;
  }

  .save-cancel-buttons {
    margin-top: 24px;
  }

  .checkbox {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 9px;
          `
        : css`
            margin-right: 9px;
          `}
  }
`;

const AdditionalResources = (props) => {
  const {
    t,
    tReady,
    isSettingPaid,
    getAdditionalResources,

    additionalResourcesData,
    additionalResourcesIsDefault,
    setIsLoadedAdditionalResources,
    isLoadedAdditionalResources,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [additionalSettings, setAdditionalSettings] = useState({});
  const [hasChange, setHasChange] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { feedbackAndSupportEnabled, videoGuidesEnabled, helpCenterEnabled } =
    additionalSettings;

  const getSettings = () => {
    const additionalSettings = getFromSessionStorage("additionalSettings");

    const defaultData = {
      feedbackAndSupportEnabled:
        additionalResourcesData?.feedbackAndSupportEnabled,
      // videoGuidesEnabled: additionalResourcesData?.videoGuidesEnabled,
      helpCenterEnabled: additionalResourcesData?.helpCenterEnabled,
    };

    saveToSessionStorage("defaultAdditionalSettings", defaultData);

    if (additionalSettings) {
      setAdditionalSettings({
        feedbackAndSupportEnabled:
          additionalSettings?.feedbackAndSupportEnabled,
        // videoGuidesEnabled: additionalSettings?.videoGuidesEnabled,
        helpCenterEnabled: additionalSettings?.helpCenterEnabled,
      });
    } else {
      setAdditionalSettings(defaultData);
    }
  };

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    const url = isManagement()
      ? "/branding"
      : "portal-settings/customization/branding";
    window.innerWidth > size.mobile &&
      location.pathname.includes("additional-resources") &&
      navigate(url);
  };

  useEffect(() => {
    getSettings();
  }, [additionalResourcesData]);

  useEffect(() => {
    const defaultAdditionalSettings = getFromSessionStorage(
      "defaultAdditionalSettings",
    );
    const newSettings = {
      feedbackAndSupportEnabled: additionalSettings.feedbackAndSupportEnabled,
      // videoGuidesEnabled: additionalSettings.videoGuidesEnabled,
      helpCenterEnabled: additionalSettings.helpCenterEnabled,
    };
    saveToSessionStorage("additionalSettings", newSettings);

    if (isEqual(defaultAdditionalSettings, newSettings)) {
      setHasChange(false);
    } else {
      setHasChange(true);
    }
  }, [additionalSettings, additionalResourcesData]);

  useEffect(() => {
    if (!(additionalResourcesData && tReady)) return;

    setIsLoadedAdditionalResources(true);
  }, [additionalResourcesData, tReady]);

  const onSave = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .setAdditionalResources(
        feedbackAndSupportEnabled,
        videoGuidesEnabled,
        helpCenterEnabled,
      )
      .then(() => {
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getAdditionalResources();

    const data = {
      feedbackAndSupportEnabled,
      videoGuidesEnabled,
      helpCenterEnabled,
    };

    saveToSessionStorage("additionalSettings", data);
    saveToSessionStorage("defaultAdditionalSettings", data);
    setIsLoading(false);
  }, [setIsLoading, getAdditionalResources, additionalSettings]);

  const onRestore = useCallback(async () => {
    setIsLoading(true);

    await api.settings
      .restoreAdditionalResources()
      .then((res) => {
        setAdditionalSettings(res);
        saveToSessionStorage("additionalSettings", res);
        toastr.success(t("Settings:SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });

    await getAdditionalResources();

    setIsLoading(false);
  }, [setIsLoading, getAdditionalResources]);

  const onChangeFeedback = () => {
    setAdditionalSettings({
      ...additionalSettings,
      feedbackAndSupportEnabled: !feedbackAndSupportEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      feedbackAndSupportEnabled: !feedbackAndSupportEnabled,
    });
  };

  const onChangeVideoGuides = () => {
    setAdditionalSettings({
      ...additionalSettings,
      videoGuidesEnabled: !videoGuidesEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      videoGuidesEnabled: !videoGuidesEnabled,
    });
  };

  const onChangeHelpCenter = () => {
    setAdditionalSettings({
      ...additionalSettings,
      helpCenterEnabled: !helpCenterEnabled,
    });
    saveToSessionStorage("additionalSettings", {
      ...additionalSettings,
      helpCenterEnabled: !helpCenterEnabled,
    });
  };

  if (!isLoadedAdditionalResources) return <LoaderAdditionalResources />;

  return (
    <>
      <StyledComponent>
        <div className="header">
          <div className="additional-header settings_unavailable">
            {t("Settings:AdditionalResources")}
          </div>
        </div>
        <div className="settings_unavailable additional-description">
          {t("Settings:AdditionalResourcesDescription")}
        </div>
        <div className="branding-checkbox">
          <Checkbox
            tabIndex={12}
            className="show-feedback-support checkbox"
            isDisabled={!isSettingPaid}
            label={t("ShowFeedbackAndSupport")}
            isChecked={feedbackAndSupportEnabled}
            onChange={onChangeFeedback}
          />

          {/*<Checkbox
            tabIndex={13}
            className="show-video-guides checkbox"
            isDisabled={!isSettingPaid}
            label={t("ShowVideoGuides")}
            isChecked={videoGuidesEnabled}
            onChange={onChangeVideoGuides}
  />*/}
          <Checkbox
            tabIndex={14}
            className="show-help-center checkbox"
            isDisabled={!isSettingPaid}
            label={t("ShowHelpCenter")}
            isChecked={helpCenterEnabled}
            onChange={onChangeHelpCenter}
          />
        </div>
        <SaveCancelButtons
          tabIndex={15}
          onSaveClick={onSave}
          onCancelClick={onRestore}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:Restore")}
          displaySettings={true}
          reminderText={t("YouHaveUnsavedChanges")}
          showReminder={(isSettingPaid && hasChange) || isLoading}
          disableRestoreToDefault={additionalResourcesIsDefault || isLoading}
          additionalClassSaveButton="additional-resources-save"
          additionalClassCancelButton="additional-resources-cancel"
        />
      </StyledComponent>
    </>
  );
};

export default inject(({ settingsStore, common, currentQuotaStore }) => {
  const { setIsLoadedAdditionalResources, isLoadedAdditionalResources } =
    common;

  const {
    getAdditionalResources,

    additionalResourcesData,
    additionalResourcesIsDefault,
  } = settingsStore;

  const { isBrandingAndCustomizationAvailable } = currentQuotaStore;

  return {
    getAdditionalResources,

    additionalResourcesData,
    additionalResourcesIsDefault,
    setIsLoadedAdditionalResources,
    isLoadedAdditionalResources,
    isSettingPaid: isBrandingAndCustomizationAvailable,
  };
})(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(AdditionalResources)),
  ),
);
