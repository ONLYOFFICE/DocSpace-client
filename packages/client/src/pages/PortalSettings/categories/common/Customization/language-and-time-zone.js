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

import React from "react";
import { withTranslation, Trans } from "react-i18next";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { ComboBox } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject, observer } from "mobx-react";
import { DeviceType } from "@docspace/shared/enums";
import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
import { setCookie } from "@docspace/shared/utils/cookie";
import { useNavigate } from "react-router";
import { isMobileDevice, isBetaLanguage } from "@docspace/shared/utils";
import withLoading from "SRC_DIR/HOCs/withLoading";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import LoaderCustomization from "../sub-components/loaderCustomization";
import { StyledSettingsComponent } from "./StyledSettings";
import checkScrollSettingsBlock from "../utils";
import useCommon from "../useCommon";
import { createDefaultHookSettingsProps } from "../../../utils/createDefaultHookSettingsProps";

import BetaBadge from "../../../../../components/BetaBadgeWrapper";

const mapTimezonesToArray = (timezones) => {
  return timezones.map((timezone) => {
    return { key: timezone.id, label: timezone.displayName };
  });
};

const mapCulturesToArray = (cultures, i18n) => {
  const t = i18n.getFixedT(null, "Common");
  return cultures.map((culture) => {
    return {
      key: culture,
      label: t(`Culture_${culture}`),
      isBeta: isBetaLanguage(culture),
    };
  });
};

const findSelectedItemByKey = (items, selectedItemKey) => {
  return items.find((item) => item.key === selectedItemKey);
};

let languageFromSessionStorage = "";
let languageDefaultFromSessionStorage = "";
let timezoneFromSessionStorage = "";
let timezoneDefaultFromSessionStorage = "";

const settingNames = ["language", "timezone"];

const LanguageAndTimeZoneComponent = (props) => {
  const {
    i18n,
    language,
    rawTimezones,
    portalTimeZoneId,
    isLoaded,
    cultures,
    portalLanguage,
    tReady,
    setIsLoadedLngTZSettings,
    t,
    timezone,
    languageAndTimeZoneSettingsUrl,
    isLoadedPage,
    currentColorScheme,
    deviceType,
    loadBaseInfo,
    common,
    settingsStore,
  } = props;

  const isMobileView = deviceType === DeviceType.mobile;

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    common,
  });

  const { getCommonInitialValue, cultureNames } = useCommon(
    defaultProps.common,
  );

  const navigate = useNavigate();

  const [state, setState] = React.useState({
    isLoading: false,
    timezone: "",
    timezoneDefault: "",
    language: "",
    languageDefault: "",
    hasChanged: false,
    showReminder: false,
    hasScroll: false,
    isCustomizationView: false,
  });

  const prevProps = React.useRef({ language: "", tReady: "", isLoaded: "" });
  const prevState = React.useRef({ language: "", timezone: "" });

  const checkInnerWidth = () => {
    if (!isMobileDevice()) {
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

  const settingIsEqualInitialValue = (settingName, value) => {
    const defaultValue = JSON.stringify(state[`${settingName}Default`]);
    const currentValue = JSON.stringify(value);
    return defaultValue === currentValue;
  };

  const checkChanges = () => {
    if (!state.timezoneDefault || !state.languageDefault) return;

    let hasChanged = false;

    settingNames.forEach((settingName) => {
      const valueFromSessionStorage = getFromSessionStorage(settingName);
      if (
        valueFromSessionStorage &&
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

  React.useEffect(() => {
    languageFromSessionStorage = getFromSessionStorage("language");
    languageDefaultFromSessionStorage =
      getFromSessionStorage("languageDefault");
    timezoneFromSessionStorage = getFromSessionStorage("timezone");
    timezoneDefaultFromSessionStorage =
      getFromSessionStorage("timezoneDefault");

    if (isMobileView) getCommonInitialValue();

    setDocumentTitle(t("StudioTimeLanguageSettings"));

    const isLoadedSetting = isLoaded && tReady && timezoneFromSessionStorage;

    if (isLoadedSetting) {
      setIsLoadedLngTZSettings(isLoadedSetting);
    }
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    if (
      rawTimezones.length > 0 &&
      isLoaded &&
      tReady &&
      timezoneFromSessionStorage === ""
    ) {
      const timezones = mapTimezonesToArray(rawTimezones);

      const selectedTimezone =
        timezoneFromSessionStorage ||
        findSelectedItemByKey(timezones, portalTimeZoneId) ||
        rawTimezones[0];

      const selectedTimezoneDefault =
        findSelectedItemByKey(timezones, portalTimeZoneId) || timezones[0];

      setState((val) => ({
        ...val,
        timezone: selectedTimezone,
        timezoneDefault: selectedTimezoneDefault,
      }));
    }

    if (
      cultures.length > 0 &&
      isLoaded &&
      tReady &&
      languageFromSessionStorage === ""
    ) {
      const selectedLanguage =
        languageFromSessionStorage ||
        findSelectedItemByKey(cultureNames, portalLanguage) ||
        cultureNames[0];

      const selectedLanguageDefault =
        findSelectedItemByKey(cultureNames, portalLanguage) || cultureNames[0];
      setState((val) => ({
        ...val,
        language: selectedLanguage,
        languageDefault: selectedLanguageDefault,
      }));
    }

    if (timezoneDefaultFromSessionStorage || timezone) {
      checkChanges();
    }

    if (languageDefaultFromSessionStorage || language) {
      checkChanges();
    }
    return () => {
      window.removeEventListener("resize", checkInnerWidth);
    };
  }, [isLoaded]);

  React.useState(() => {
    prevProps.current = {
      language,
      tReady,
      isLoaded,
    };
  }, [language, tReady, isLoaded]);

  React.useState(() => {
    prevState.current = { language: state.language, timezone: state.timezone };
  }, [state.language, state.timezone]);

  React.useEffect(() => {
    const { timezoneDefault, languageDefault, hasScroll } = state;

    if (
      isLoaded !== prevProps.current.isLoaded ||
      tReady !== prevProps.current.tReady ||
      state.language !== prevState.current.language ||
      state.timezone !== prevState.current.timezone
    ) {
      const isLoadedSetting =
        isLoaded && tReady && state.timezone && state.language;

      if (isLoadedSetting) {
        setIsLoadedLngTZSettings(isLoadedSetting);
      }
    }

    if (
      rawTimezones.length > 0 &&
      isLoaded &&
      tReady &&
      state.timezone === ""
    ) {
      const timezones = mapTimezonesToArray(rawTimezones);

      const selectedTimezone =
        timezoneFromSessionStorage ||
        findSelectedItemByKey(timezones, portalTimeZoneId) ||
        rawTimezones[0];

      const selectedTimezoneDefault =
        timezoneDefaultFromSessionStorage ||
        findSelectedItemByKey(timezones, portalTimeZoneId) ||
        timezones[0];

      setState((val) => ({
        ...val,
        timezone: selectedTimezone,
        timezoneDefault: selectedTimezoneDefault,
      }));
    }

    if (cultures.length > 0 && isLoaded && tReady && state.language === "") {
      const newCultureNames = mapCulturesToArray(cultures, i18n);
      const selectedLanguage =
        languageFromSessionStorage ||
        findSelectedItemByKey(newCultureNames, portalLanguage) ||
        newCultureNames[0];

      const selectedLanguageDefault =
        languageDefaultFromSessionStorage ||
        findSelectedItemByKey(newCultureNames, portalLanguage) ||
        newCultureNames[0];

      setState((val) => ({
        ...val,
        language: selectedLanguage,
        languageDefault: selectedLanguageDefault,
      }));
    }

    const checkScroll = checkScrollSettingsBlock();

    window.addEventListener("resize", checkScroll);
    const scrollLngTZSettings = checkScroll();

    if (scrollLngTZSettings !== hasScroll) {
      setState((val) => ({ ...val, hasScroll: scrollLngTZSettings }));
    }

    if (language !== prevProps.current.language) {
      i18n.changeLanguage(language).then(() => {
        const newLocaleSelectedLanguage =
          findSelectedItemByKey(cultureNames, state.language.key) ||
          cultureNames[0];
        setState((val) => ({
          ...val,
          language: languageFromSessionStorage || newLocaleSelectedLanguage,
        }));
      });
    }
    if (timezoneDefault && languageDefault) {
      checkChanges();
    }
  }, [
    state.timezoneDefault,
    state.languageDefault,
    state.hasScroll,
    state.timezone,
    state.language,
    i18n,
    language,
    cultureNames,
    rawTimezones,
    portalTimeZoneId,
    isLoaded,
    cultures,
    portalLanguage,
    tReady,
    setIsLoadedLngTZSettings,

    timezone,
  ]);

  const onSelectLanguage = (selectedLanguage) => {
    setState((val) => ({
      ...val,
      language: selectedLanguage,
    }));
    if (settingIsEqualInitialValue("language", selectedLanguage)) {
      saveToSessionStorage("language", "");
      saveToSessionStorage("languageDefault", "");
    } else {
      saveToSessionStorage("language", selectedLanguage);
    }
    checkChanges();
  };

  const onSelectTimezone = (selectedTimezone) => {
    setState((val) => ({
      ...val,
      timezone: selectedTimezone,
    }));
    if (settingIsEqualInitialValue("timezone", selectedTimezone)) {
      saveToSessionStorage("timezone", "");
      saveToSessionStorage("timezoneDefault", "");
    } else {
      saveToSessionStorage("timezone", selectedTimezone);
    }

    checkChanges();
  };

  const onSaveClick = () => {
    const { setLanguageAndTime, user, language: lng } = props;

    setState((val) => ({ ...val, isLoading: true }));
    setLanguageAndTime(state.language.key, state.timezone.key)
      .then(() => {
        !user.cultureName &&
          setCookie(LANGUAGE, state.language.key || "en", {
            "max-age": COOKIE_EXPIRATION_YEAR,
          });
        window.timezone = state.timezone.key;
      })
      .then(() => toastr.success(t("Common:SuccessfullySaveSettingsMessage")))
      .then(
        () =>
          !user.cultureName &&
          lng !== state.language.key &&
          window.location.reload(),
      )
      .catch((error) => toastr.error(error))
      .finally(() => setState((val) => ({ ...val, isLoading: false })));

    setState((val) => ({
      ...val,
      showReminder: false,
      timezoneDefault: state.timezone,
      languageDefault: state.language,
    }));

    saveToSessionStorage("languageDefault", state.language);
    saveToSessionStorage("timezoneDefault", state.timezone);
  };

  const onCancelClick = () => {
    settingNames.forEach((settingName) => {
      const valueFromSessionStorage = getFromSessionStorage(settingName);
      if (
        valueFromSessionStorage !== "none" &&
        valueFromSessionStorage !== null &&
        !settingIsEqualInitialValue(settingName, valueFromSessionStorage)
      ) {
        const defaultValue = state[`${settingName}Default`];

        setState((val) => ({ ...val, [settingName]: defaultValue || null }));
        saveToSessionStorage(settingName, "");
      }
    });

    setState((val) => ({ ...val, showReminder: false }));

    checkChanges();
  };

  const {
    isLoading,

    showReminder,
    hasScroll,
    isCustomizationView,
  } = state;

  const timezones = mapTimezonesToArray(rawTimezones);
  const cultureNamesNew = mapCulturesToArray(cultures, i18n);

  const isBetaLang = state?.language?.isBeta;

  const settingsBlock = (
    <div className="settings-block">
      <FieldContainer
        id="fieldContainerLanguage"
        labelText={`${t("Common:Language")}`}
        isVertical
      >
        <div className="settings-block__wrapper-language">
          <ComboBox
            tabIndex={1}
            id="comboBoxLanguage"
            options={cultureNamesNew}
            selectedOption={state.language}
            onSelect={onSelectLanguage}
            isDisabled={isLoading || !state.language}
            directionY="both"
            noBorder={false}
            scaled
            scaledOptions
            isDefaultMode={false}
            dropDownMaxHeight={300}
            className="dropdown-item-width combo-box-settings"
            showDisabledItems
            dataTestId="language_and_time_zone_combo_box_language"
          />
          {isBetaLang ? <BetaBadge place="right-start" /> : null}
        </div>
      </FieldContainer>
      <FieldContainer
        id="fieldContainerTimezone"
        labelText={`${t("TimeZone")}`}
        isVertical
      >
        <ComboBox
          tabIndex={2}
          id="comboBoxTimezone"
          options={timezones}
          directionY="both"
          selectedOption={state.timezone}
          onSelect={onSelectTimezone}
          isDisabled={isLoading || !state.timezone}
          noBorder={false}
          scaled
          scaledOptions
          isDefaultMode={false}
          dropDownMaxHeight={300}
          className="dropdown-item-width combo-box-settings"
          showDisabledItems
          dataTestId="language_and_time_zone_combo_box_timezone"
        />
      </FieldContainer>
    </div>
  );

  return !isLoadedPage ? (
    <LoaderCustomization lngTZSettings />
  ) : (
    <StyledSettingsComponent
      hasScroll={hasScroll}
      className="category-item-wrapper"
      withoutExternalLink={!languageAndTimeZoneSettingsUrl}
    >
      {isCustomizationView && !isMobileView ? (
        <div className="category-item-heading">
          <div className="category-item-title">
            {t("StudioTimeLanguageSettings")}
          </div>
        </div>
      ) : null}
      <div className="category-item-description">
        <Text fontSize="13px" fontWeight={400}>
          {t("TimeLanguageSettingsDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <Text>
          <Trans t={t} i18nKey="TimeLanguageSettingsSave" />
        </Text>
        {languageAndTimeZoneSettingsUrl ? (
          <Link
            className="link-learn-more"
            color={currentColorScheme.main?.accent}
            target="_blank"
            isHovered
            dataTestId="language_and_time_zone_link"
            href={languageAndTimeZoneSettingsUrl}
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>
      {settingsBlock}
      <SaveCancelButtons
        tabIndex={3}
        className="save-cancel-buttons"
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("Common:YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings
        hasScroll={hasScroll}
        additionalClassSaveButton="language-time-zone-save"
        additionalClassCancelButton="language-time-zone-cancel"
        saveButtonDataTestId="language_and_time_zone_save_buttons"
        cancelButtonDataTestId="language_and_time_zone_cancel_buttons"
      />
    </StyledSettingsComponent>
  );
};

export const LanguageAndTimeZoneSettings = inject(
  ({ settingsStore, setup, common, userStore }) => {
    const {
      culture,
      timezone,
      timezones,
      nameSchemaId,
      greetingSettings,
      cultures,
      getPortalCultures,
      currentColorScheme,
      languageAndTimeZoneSettingsUrl,
      deviceType,
    } = settingsStore;

    const { user } = userStore;

    const { setLanguageAndTime } = setup;
    const { isLoaded, setIsLoadedLngTZSettings, initSettings, setIsLoaded } =
      common;
    return {
      user,
      portalLanguage: culture,
      portalTimeZoneId: timezone,
      language: culture,
      rawTimezones: timezones,
      greetingSettings,
      nameSchemaId,
      setLanguageAndTime,
      isLoaded,
      setIsLoadedLngTZSettings,
      cultures,
      getPortalCultures,
      currentColorScheme,
      languageAndTimeZoneSettingsUrl,
      deviceType,
      setIsLoaded,
      common,
      settingsStore,
      loadBaseInfo: async (page) => {
        await initSettings(page);
      },
    };
  },
)(
  withLoading(
    withTranslation(["Settings", "Common"])(
      observer(LanguageAndTimeZoneComponent),
    ),
  ),
);
