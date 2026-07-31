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

import React from "react";
import { withTranslation } from "react-i18next";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { toastr } from "@docspace/ui-kit/components/toast";
import { TextInput } from "@docspace/ui-kit/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { isMobileDevice } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { DeviceType } from "@docspace/shared/enums";
import checkScrollSettingsBlock from "../utils";
import { StyledSettingsComponent } from "./StyledSettings";
import LoaderCustomization from "../sub-components/loaderCustomization";
import useCommon from "../useCommon";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

let greetingTitleFromSessionStorage = "";
let greetingTitleDefaultFromSessionStorage = "";
const settingNames = ["greetingTitle"];

const WelcomePageSettingsComponent = (props) => {
  const {
    t,
    greetingSettings,
    isLoaded,
    setIsLoadedWelcomePageSettings,
    tReady,
    setIsLoaded,
    setGreetingTitle,
    restoreGreetingTitle,
    isLoadedPage,
    greetingSettingsIsDefault,
    getGreetingSettingsIsDefault,
    currentColorScheme,
    welcomePageSettingsUrl,
    loadBaseInfo,
    common,
    settingsStore,
    deviceType,
  } = props;

  const navigate = useNavigate();

  const isMobileView = deviceType === DeviceType.mobile;

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    common,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);

  const [state, setState] = React.useState({
    isLoading: false,
    greetingTitle: "",
    greetingTitleDefault: "",
    isLoadingGreetingSave: false,
    isLoadingGreetingRestore: false,
    hasChanged: false,
    showReminder: false,
    hasScroll: false,
    isCustomizationView: false,
    isValidTitle: true,
    saveButtonDisabled: false,
  });

  const prevState = React.useRef({
    isLoadingGreetingSave: false,
    isLoadingGreetingRestore: false,
  });
  const prevProps = React.useRef({
    isLoaded: "",
    tReady: "",
    greetingSettings: "",
  });

  const settingIsEqualInitialValue = (stateName, value) => {
    const defaultValue = JSON.stringify(state[`${stateName}Default`]);
    const currentValue = JSON.stringify(value);
    return defaultValue === currentValue;
  };

  const checkChanges = () => {
    let hasChanged = false;

    settingNames.forEach((settingName) => {
      const valueFromSessionStorage = getFromSessionStorage(settingName);
      if (
        valueFromSessionStorage !== "none" &&
        valueFromSessionStorage !== null &&
        !settingIsEqualInitialValue(settingName, valueFromSessionStorage)
      )
        hasChanged = true;
    });

    if (hasChanged !== state.hasChanged) {
      setState((val) => ({
        ...val,
        hasChanged,
        showReminder: hasChanged,
      }));
    }
  };

  const checkInnerWidth = () => {
    if (!isMobileDevice()) {
      setState((val) => ({ ...val, isCustomizationView: true }));

      if (location.pathname.includes("welcome-page-settings")) {
        navigate("/portal-settings/customization/general");
      }
    } else {
      setState((val) => ({ ...val, isCustomizationView: false }));
    }
  };

  React.useEffect(() => {
    if (isMobileView) getCommonInitialValue();
  }, [isMobileView]);

  React.useEffect(() => {
    greetingTitleFromSessionStorage = getFromSessionStorage("greetingTitle");

    greetingTitleDefaultFromSessionStorage = getFromSessionStorage(
      "greetingTitleDefault",
    );

    setDocumentTitle(t("CustomTitlesWelcome"));

    const greetingTitle =
      greetingTitleFromSessionStorage === null ||
      greetingTitleFromSessionStorage === "none"
        ? greetingSettings
        : greetingTitleFromSessionStorage;

    const greetingTitleDefault =
      greetingTitleDefaultFromSessionStorage === null ||
      greetingTitleDefaultFromSessionStorage === "none"
        ? greetingSettings
        : greetingTitleDefaultFromSessionStorage;

    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    const isLoadedSetting = isLoaded && tReady;

    if (isLoadedSetting) setIsLoadedWelcomePageSettings(isLoadedSetting);

    if (greetingTitleDefault || greetingTitle) {
      checkChanges();
    }

    setState((val) => ({
      ...val,
      greetingTitle,
      greetingTitleDefault,
    }));

    return () => {
      window.removeEventListener("resize", checkInnerWidth);
    };
  }, [
    isLoaded,
    isMobileView,
    t,
    tReady,
    greetingSettings,
    navigate,
    setIsLoaded,
    setIsLoadedWelcomePageSettings,
  ]);

  React.useEffect(() => {
    if (
      isLoaded !== prevProps.current.isLoaded ||
      tReady !== prevProps.current.tReady
    ) {
      const isLoadedSetting = isLoaded && tReady;

      if (isLoadedSetting) {
        setIsLoadedWelcomePageSettings(isLoadedSetting);
      }
    }

    const checkScroll = checkScrollSettingsBlock();

    window.addEventListener("resize", checkScroll);
    const scrollLngTZSettings = checkScroll();

    if (scrollLngTZSettings !== state.hasScroll) {
      setState((val) => ({ ...val, hasScroll: scrollLngTZSettings }));
    }

    if (state.greetingTitleDefault || state.greetingTitle) {
      checkChanges();
    }

    return () => {
      window.removeEventListener("resize", checkScroll);
    };
  }, [
    isLoaded,
    setIsLoadedWelcomePageSettings,
    tReady,
    state.hasScroll,
    state.greetingTitle,
    state.greetingTitleDefault,
    state.isLoadingGreetingSave,
    state.isLoadingGreetingRestore,
  ]);

  React.useEffect(() => {
    greetingTitleFromSessionStorage = getFromSessionStorage("greetingTitle");
    const emptyGreetingTitleFromSessionStorage =
      greetingTitleFromSessionStorage === null ||
      greetingTitleFromSessionStorage === "none";

    if (!emptyGreetingTitleFromSessionStorage) return;

    if (greetingSettings !== state.greetingTitle) {
      setState((val) => ({ ...val, greetingTitle: greetingSettings }));
    }
  }, [greetingSettings]);

  React.useEffect(() => {
    prevProps.current = { isLoaded, tReady, greetingSettings };
  }, [isLoaded, tReady, greetingSettings]);

  React.useEffect(() => {
    prevState.current = {
      isLoadingGreetingSave: state.isLoadingGreetingSave,
      isLoadingGreetingRestore: state.isLoadingGreetingRestore,
    };
  }, [state.isLoadingGreetingSave, state.isLoadingGreetingRestore]);

  const onChangeGreetingTitle = (e) => {
    if (e.target.value.trim() === "") {
      setState((val) => ({
        ...val,
        greetingTitle: e.target.value,
        showReminder: true,
        saveButtonDisabled: true,
        isValidTitle: false,
      }));

      return;
    } else if (!state.isValidTitle) {
      setState((val) => ({
        ...val,
        isValidTitle: true,
        saveButtonDisabled: false,
      }));
    }

    setState((val) => ({ ...val, greetingTitle: e.target.value }));
    getGreetingSettingsIsDefault();

    if (settingIsEqualInitialValue("greetingTitle", e.target.value)) {
      saveToSessionStorage("greetingTitle", "none");
      saveToSessionStorage("greetingTitleDefault", "none");
    } else {
      saveToSessionStorage("greetingTitle", e.target.value);
      setState((val) => ({
        ...val,
        showReminder: true,
      }));
    }

    checkChanges();
  };

  const onSaveGreetingSettings = () => {
    const { greetingTitle } = state;
    setState((val) => ({ ...val, isLoadingGreetingSave: true }));
    setGreetingTitle(greetingTitle)
      .then(() => {
        toastr.success(t("SuccessfullySaveGreetingSettingsMessage"));
        setState((val) => ({ ...val, greetingTitleDefault: greetingTitle }));
      })
      .catch((error) => toastr.error(error))
      .finally(() => {
        getGreetingSettingsIsDefault();
        setState((val) => ({ ...val, isLoadingGreetingSave: false }));
      });

    setState((val) => ({ ...val, showReminder: false }));

    saveToSessionStorage("greetingTitle", greetingTitle);
    saveToSessionStorage("greetingTitleDefault", greetingTitle);
  };

  const onRestoreGreetingSettings = () => {
    setState((val) => ({ ...val, isLoadingGreetingRestore: true }));
    restoreGreetingTitle()
      .then((defaultTitle) => {
        setState((val) => ({
          ...val,
          greetingTitle: defaultTitle,
          showReminder: false,
          isValidTitle: true,
        }));

        saveToSessionStorage("greetingTitle", "none");
        saveToSessionStorage("greetingTitleDefault", "none");

        toastr.success(t("SuccessfullySaveGreetingSettingsMessage"));
      })
      .catch((error) => toastr.error(error))
      .finally(() => {
        getGreetingSettingsIsDefault();
        setState((val) => ({ ...val, isLoadingGreetingRestore: false }));
      });
  };

  const settingsBlock = (
    <div className="settings-block">
      <FieldContainer
        id="fieldContainerWelcomePage"
        className="field-container-width"
        labelText={`${t("Common:Title")}`}
        isVertical
        hasError={!state.isValidTitle}
      >
        <TextInput
          tabIndex={5}
          id="textInputContainerWelcomePage"
          name="greeting_title"
          scale
          value={state.greetingTitle}
          testId="customization_welcome_page_text_input"
          onChange={onChangeGreetingTitle}
          isDisabled={
            state.isLoadingGreetingSave || state.isLoadingGreetingRestore
          }
          placeholder={t("EnterTitle")}
          hasError={!state.isValidTitle}
        />
      </FieldContainer>
    </div>
  );

  return !isLoadedPage ? (
    <LoaderCustomization welcomePage />
  ) : (
    <StyledSettingsComponent
      hasScroll={state.hasScroll}
      className="category-item-wrapper"
      withoutExternalLink={!welcomePageSettingsUrl}
    >
      {state.isCustomizationView && !isMobileView ? (
        <div className="category-item-heading">
          <div className="category-item-title">{t("CustomTitlesWelcome")}</div>
        </div>
      ) : null}
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("CustomTitlesDescription")}
        </Text>
        {welcomePageSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            href={welcomePageSettingsUrl}
            dataTestId="customization_welcome_page_learn_more"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>
      {settingsBlock}
      <SaveCancelButtons
        tabIndex={6}
        id="buttonsWelcomePage"
        className="save-cancel-buttons"
        onSaveClick={onSaveGreetingSettings}
        onCancelClick={onRestoreGreetingSettings}
        showReminder={state.showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings
        hasScroll={state.hasScroll}
        disableRestoreToDefault={greetingSettingsIsDefault}
        saveButtonDisabled={state.saveButtonDisabled}
        additionalClassSaveButton="welcome-page-save"
        additionalClassCancelButton="welcome-page-cancel"
        saveButtonDataTestId="customization_welcome_page_save_buttons"
        cancelButtonDataTestId="customization_welcome_page_cancel_buttons"
      />
    </StyledSettingsComponent>
  );
};

export const WelcomePageSettings = inject(
  ({ settingsStore, setup, common }) => {
    const {
      greetingSettings,

      theme,
      currentColorScheme,
      welcomePageSettingsUrl,
      deviceType,
    } = settingsStore;
    const { setGreetingTitle, restoreGreetingTitle } = setup;
    const {
      isLoaded,
      setIsLoadedWelcomePageSettings,
      setIsLoaded,
      greetingSettingsIsDefault,
      getGreetingSettingsIsDefault,
      initSettings,
    } = common;

    return {
      theme,
      greetingSettings,
      setGreetingTitle,
      restoreGreetingTitle,
      isLoaded,
      setIsLoadedWelcomePageSettings,
      greetingSettingsIsDefault,
      getGreetingSettingsIsDefault,
      setIsLoaded,
      currentColorScheme,
      welcomePageSettingsUrl,
      common,
      settingsStore,
      loadBaseInfo: async (page) => {
        await initSettings(page);
      },
      deviceType,
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(WelcomePageSettingsComponent),
    ),
  ),
);
