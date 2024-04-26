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

import CombinedShapeSvgUrl from "PUBLIC_DIR/images/combined.shape.svg?url";
import React from "react";
import { withTranslation } from "react-i18next";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { TextInput } from "@docspace/shared/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { isMobile } from "@docspace/shared/utils";
import checkScrollSettingsBlock from "../utils";
import { StyledSettingsComponent } from "./StyledSettings";
import LoaderCustomization from "../sub-components/loaderCustomization";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";

let greetingTitleFromSessionStorage = "";
let greetingTitleDefaultFromSessionStorage = "";
const settingNames = ["greetingTitle"];

const WelcomePageSettings = (props) => {
  const {
    t,
    greetingSettings,
    isLoaded,
    setIsLoadedWelcomePageSettings,
    tReady,
    initSettings,
    setIsLoaded,
    setGreetingTitle,
    restoreGreetingTitle,
    isMobileView,
    isLoadedPage,
    greetingSettingsIsDefault,
    getGreetingSettingsIsDefault,
    currentColorScheme,
    welcomePageSettingsUrl,
  } = props;

  const navigate = useNavigate();

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

  React.useEffect(() => {
    greetingTitleFromSessionStorage = getFromSessionStorage("greetingTitle");

    greetingTitleDefaultFromSessionStorage = getFromSessionStorage(
      "greetingTitleDefault",
    );
    getGreetingSettingsIsDefault();

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

    const page = isMobileView ? "language-and-time-zone" : "general";
    if (!isLoaded) initSettings(page).then(() => setIsLoaded(true));

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
  }, []);

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
  }, [
    isLoaded,
    setIsLoadedWelcomePageSettings,
    tReady,
    state.hasScroll,
    state.greetingTitle,
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

  const settingIsEqualInitialValue = (stateName, value) => {
    const defaultValue = JSON.stringify(state[stateName + "Default"]);
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
        hasChanged: hasChanged,
        showReminder: hasChanged,
      }));
    }
  };

  const checkInnerWidth = () => {
    if (!isMobile()) {
      setState((val) => ({ ...val, isCustomizationView: true }));

      const currentUrl = window.location.href.replace(
        window.location.origin,
        "",
      );

      const newUrl = "/portal-settings/customization/general";

      if (newUrl === currentUrl) return;

      navigate(newUrl);
    } else {
      setState((val) => ({ ...val, isCustomizationView: false }));
    }
  };

  const onClickLink = (e) => {
    e.preventDefault();
    navigate(e.target.pathname);
  };

  const settingsBlock = (
    <div className="settings-block">
      <FieldContainer
        id="fieldContainerWelcomePage"
        className="field-container-width"
        labelText={`${t("Common:Title")}`}
        isVertical={true}
      >
        <TextInput
          tabIndex={5}
          id="textInputContainerWelcomePage"
          scale={true}
          value={state.greetingTitle}
          onChange={onChangeGreetingTitle}
          isDisabled={
            state.isLoadingGreetingSave || state.isLoadingGreetingRestore
          }
          placeholder={t("EnterTitle")}
        />
      </FieldContainer>
    </div>
  );

  return !isLoadedPage ? (
    <LoaderCustomization welcomePage={true} />
  ) : (
    <StyledSettingsComponent
      hasScroll={state.hasScroll}
      className="category-item-wrapper"
    >
      {state.isCustomizationView && !isMobileView && (
        <div className="category-item-heading">
          <div className="category-item-title">{t("CustomTitlesWelcome")}</div>
        </div>
      )}
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("CustomTitlesDescription")}
        </Text>
        <Link
          className="link-learn-more"
          color={currentColorScheme.main?.accent}
          target="_blank"
          isHovered
          href={welcomePageSettingsUrl}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>
      {settingsBlock}
      <SaveCancelButtons
        tabIndex={6}
        id="buttonsWelcomePage"
        className="save-cancel-buttons"
        onSaveClick={onSaveGreetingSettings}
        onCancelClick={onRestoreGreetingSettings}
        showReminder={state.showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:Restore")}
        displaySettings={true}
        hasScroll={state.hasScroll}
        disableRestoreToDefault={greetingSettingsIsDefault}
        additionalClassSaveButton="welcome-page-save"
        additionalClassCancelButton="welcome-page-cancel"
      />
    </StyledSettingsComponent>
  );
};

export default inject(({ settingsStore, setup, common }) => {
  const {
    greetingSettings,
    organizationName,
    theme,
    currentColorScheme,
    welcomePageSettingsUrl,
  } = settingsStore;
  const { setGreetingTitle, restoreGreetingTitle } = setup;
  const {
    isLoaded,
    setIsLoadedWelcomePageSettings,
    initSettings,
    setIsLoaded,
    greetingSettingsIsDefault,
    getGreetingSettingsIsDefault,
  } = common;

  return {
    theme,
    greetingSettings,
    organizationName,
    setGreetingTitle,
    restoreGreetingTitle,
    isLoaded,
    setIsLoadedWelcomePageSettings,
    greetingSettingsIsDefault,
    getGreetingSettingsIsDefault,
    initSettings,
    setIsLoaded,
    currentColorScheme,
    welcomePageSettingsUrl,
  };
})(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(WelcomePageSettings)),
  ),
);
