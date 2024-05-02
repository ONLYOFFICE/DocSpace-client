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

import { useState, useEffect } from "react";
import api from "@docspace/shared/api";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { StyledBruteForceProtection } from "../StyledSecurity";
import isEqual from "lodash/isEqual";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { toastr } from "@docspace/shared/components/toast";
import { TextInput } from "@docspace/shared/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Text } from "@docspace/shared/components/text";
import { size } from "@docspace/shared/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import BruteForceProtectionLoader from "../sub-components/loaders/brute-force-protection-loader";
import { Link } from "@docspace/shared/components/link";
import { DeviceType } from "@docspace/shared/enums";

const BruteForceProtection = (props) => {
  const {
    t,
    numberAttempt,
    blockingTime,
    checkPeriod,

    getBruteForceProtection,
    initSettings,
    isInit,
    bruteForceProtectionUrl,
    currentDeviceType,
    currentColorScheme,
  } = props;

  const defaultNumberAttempt = numberAttempt?.toString();
  const defaultBlockingTime = blockingTime?.toString();
  const defaultCheckPeriod = checkPeriod?.toString();

  const [currentNumberAttempt, setCurrentNumberAttempt] =
    useState(defaultNumberAttempt);

  const [currentBlockingTime, setCurrentBlockingTime] =
    useState(defaultBlockingTime);
  const [currentCheckPeriod, setCurrentCheckPeriod] =
    useState(defaultCheckPeriod);

  const [showReminder, setShowReminder] = useState(false);
  const [isGetSettingsLoaded, setIsGetSettingsLoaded] = useState(false);

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const [hasErrorNumberAttempt, setHasErrorNumberAttempt] = useState(false);
  const [hasErrorBlockingTime, setHasErrorBlockingTime] = useState(false);
  const [hasErrorCheckPeriod, setHasErrorCheckPeriod] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      currentNumberAttempt == null ||
      currentCheckPeriod == null ||
      currentBlockingTime == null
    )
      return;

    setHasErrorNumberAttempt(!parseInt(currentNumberAttempt));
    setHasErrorBlockingTime(!parseInt(currentBlockingTime));
    setHasErrorCheckPeriod(!parseInt(currentCheckPeriod));
  }, [currentNumberAttempt, currentBlockingTime, currentCheckPeriod]);

  useEffect(() => {
    isInit && getSettings();
  }, [isInit]);

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);

    if (!isInit) initSettings("brute-force-protection");

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (!isGetSettingsLoaded) return;

    const defaultSettings = getFromSessionStorage(
      "defaultBruteForceProtection",
    );

    const checkNullNumberAttempt = !+currentNumberAttempt;
    const checkNullBlockingTime = !+currentBlockingTime;
    const checkNullCheckPeriod = !+currentCheckPeriod;

    const newSettings = {
      numberAttempt: checkNullNumberAttempt
        ? currentNumberAttempt
        : currentNumberAttempt.replace(/^0+/, ""),
      blockingTime: checkNullBlockingTime
        ? currentBlockingTime
        : currentBlockingTime.replace(/^0+/, ""),
      checkPeriod: checkNullCheckPeriod
        ? currentCheckPeriod
        : currentCheckPeriod.replace(/^0+/, ""),
    };

    saveToSessionStorage("currentBruteForceProtection", newSettings);

    if (isEqual(defaultSettings, newSettings)) {
      setShowReminder(false);
      return;
    }

    setShowReminder(true);
  }, [
    currentNumberAttempt,
    currentBlockingTime,
    currentCheckPeriod,
    isGetSettingsLoaded,
  ]);

  const checkWidth = () => {
    window.innerWidth > size.mobile &&
      location.pathname.includes("brute-force-protection") &&
      navigate("/portal-settings/security/access-portal");
  };

  const getSettings = () => {
    const currentSettings = getFromSessionStorage(
      "currentBruteForceProtection",
    );

    const defaultData = {
      numberAttempt: defaultNumberAttempt.replace(/^0+/, ""),
      blockingTime: defaultBlockingTime.replace(/^0+/, ""),
      checkPeriod: defaultCheckPeriod.replace(/^0+/, ""),
    };
    saveToSessionStorage("defaultBruteForceProtection", defaultData);

    if (currentSettings) {
      setCurrentNumberAttempt(currentSettings.numberAttempt);
      setCurrentBlockingTime(currentSettings.blockingTime);
      setCurrentCheckPeriod(currentSettings.checkPeriod);
      setIsGetSettingsLoaded(true);
      return;
    }

    setCurrentNumberAttempt(defaultNumberAttempt);
    setCurrentBlockingTime(defaultBlockingTime);
    setCurrentCheckPeriod(defaultCheckPeriod);
    setIsGetSettingsLoaded(true);
  };

  const onValidation = (inputValue) => {
    const isPositiveOrZeroNumber =
      Math.sign(inputValue) === 1 || Math.sign(inputValue) === 0;

    return !(
      !isPositiveOrZeroNumber ||
      inputValue.indexOf(".") !== -1 ||
      inputValue.indexOf(" ") !== -1 ||
      inputValue.length > 4
    );
  };

  const onChangeNumberAttempt = (e) => {
    const inputValue = e.target.value;

    onValidation(inputValue) &&
      setCurrentNumberAttempt(inputValue) &&
      setShowReminder(true);
  };

  const onChangeBlockingTime = (e) => {
    const inputValue = e.target.value;

    onValidation(inputValue) &&
      setCurrentBlockingTime(inputValue) &&
      setShowReminder(true);
  };

  const onChangeCheckPeriod = (e) => {
    const inputValue = e.target.value;

    onValidation(inputValue) &&
      setCurrentCheckPeriod(inputValue) &&
      setShowReminder(true);
  };

  const onSaveClick = () => {
    if (hasErrorNumberAttempt || hasErrorCheckPeriod) return;
    setIsLoadingSave(true);

    const numberCurrentNumberAttempt = parseInt(currentNumberAttempt);
    const numberCurrentBlockingTime = parseInt(currentBlockingTime);
    const numberCurrentCheckPeriod = parseInt(currentCheckPeriod);

    api.settings
      .setBruteForceProtection(
        numberCurrentNumberAttempt,
        numberCurrentBlockingTime,
        numberCurrentCheckPeriod,
      )
      .then(() => {
        saveToSessionStorage("defaultBruteForceProtection", {
          numberAttempt: currentNumberAttempt.replace(/^0+/, ""),
          blockingTime: currentBlockingTime.replace(/^0+/, ""),
          checkPeriod: currentCheckPeriod.replace(/^0+/, ""),
        });

        getBruteForceProtection();
        setShowReminder(false);
        setIsLoadingSave(false);
        toastr.success(t("SuccessfullySaveSettingsMessage"));
      })
      .catch((error) => {
        toastr.error(error);
      });
  };

  const onCancelClick = () => {
    const defaultSettings = getFromSessionStorage(
      "defaultBruteForceProtection",
    );
    setCurrentNumberAttempt(defaultSettings.numberAttempt);
    setCurrentBlockingTime(defaultSettings.blockingTime);
    setCurrentCheckPeriod(defaultSettings.checkPeriod);
    setShowReminder(false);
  };

  if (currentDeviceType !== DeviceType.desktop && !isGetSettingsLoaded)
    return <BruteForceProtectionLoader />;

  return (
    <StyledBruteForceProtection>
      <div className="description">
        <Text className="page-subtitle">
          {t("BruteForceProtectionDescription")}
        </Text>

        <Link
          className="link"
          fontSize="13px"
          target="_blank"
          isHovered
          href={bruteForceProtectionUrl}
          color={currentColorScheme.main?.accent}
        >
          {t("Common:LearnMore")}
        </Link>
      </div>

      <FieldContainer
        className="input-container"
        labelText={t("NumberOfAttempts")}
        isVertical={true}
        place="top"
        hasError={hasErrorNumberAttempt}
        errorMessage={t("ErrorMessageBruteForceProtection")}
      >
        <TextInput
          className="brute-force-protection-input"
          tabIndex={1}
          value={currentNumberAttempt}
          onChange={onChangeNumberAttempt}
          isDisabled={isLoadingSave}
          placeholder={t("EnterNumber")}
          hasError={hasErrorNumberAttempt}
        />
      </FieldContainer>

      <FieldContainer
        className="input-container"
        labelText={t("BlockingTime")}
        isVertical={true}
        place="top"
        hasError={hasErrorBlockingTime}
        errorMessage={t("ErrorMessageBruteForceProtection")}
      >
        <TextInput
          className="brute-force-protection-input"
          tabIndex={2}
          value={currentBlockingTime}
          onChange={onChangeBlockingTime}
          isDisabled={isLoadingSave}
          placeholder={t("EnterTime")}
          hasError={hasErrorBlockingTime}
        />
      </FieldContainer>

      <FieldContainer
        className="input-container"
        labelText={t("CheckPeriod")}
        isVertical={true}
        place="top"
        hasError={hasErrorCheckPeriod}
        errorMessage={t("ErrorMessageBruteForceProtection")}
      >
        <TextInput
          className="brute-force-protection-input"
          tabIndex={3}
          value={currentCheckPeriod}
          onChange={onChangeCheckPeriod}
          isDisabled={isLoadingSave}
          placeholder={t("EnterTime")}
          hasError={hasErrorCheckPeriod}
        />
      </FieldContainer>
      <SaveCancelButtons
        className="save-cancel-buttons"
        tabIndex={4}
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        showReminder={showReminder}
        reminderText={t("YouHaveUnsavedChanges")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        displaySettings={true}
        hasScroll={false}
        additionalClassSaveButton="brute-force-protection-save"
        additionalClassCancelButton="brute-force-protection-cancel"
        isSaving={isLoadingSave}
      />
    </StyledBruteForceProtection>
  );
};

export default inject(({ settingsStore, setup }) => {
  const {
    numberAttempt,
    blockingTime,
    checkPeriod,

    getBruteForceProtection,
    bruteForceProtectionUrl,
    currentDeviceType,
    currentColorScheme,
  } = settingsStore;

  const { initSettings, isInit } = setup;

  return {
    numberAttempt,
    blockingTime,
    checkPeriod,

    getBruteForceProtection,
    initSettings,
    isInit,
    bruteForceProtectionUrl,
    currentDeviceType,
    currentColorScheme,
  };
})(withTranslation(["Settings", "Common"])(observer(BruteForceProtection)));
