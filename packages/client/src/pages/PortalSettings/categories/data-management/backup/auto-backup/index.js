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

import React from "react";
import moment from "moment";
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RadioButton } from "@docspace/shared/components/radio-button";
import { Text } from "@docspace/shared/components/text";
import {
  deleteBackupSchedule,
  getBackupSchedule,
  createBackupSchedule,
} from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import {
  BackupStorageType,
  AutoBackupPeriod,
  FolderType,
} from "@docspace/shared/enums";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import {
  getBackupStorage,
  getStorageRegions,
} from "@docspace/shared/api/settings";
// import { getThirdPartyCommonFolderTree } from "@docspace/shared/api/files";
import AutoBackupLoader from "@docspace/shared/skeletons/backup/AutoBackup";
import { FloatingButton } from "@docspace/shared/components/floating-button";
import { Badge } from "@docspace/shared/components/badge";
import { Link } from "@docspace/shared/components/link";
import { getSettingsThirdParty } from "@docspace/shared/api/files";
import StatusMessage from "@docspace/shared/components/status-message";
import SocketHelper, { SocketEvents } from "@docspace/shared/utils/socket";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import {
  getBackupProgressInfo,
  isManagement,
} from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";
import ButtonContainer from "./sub-components/ButtonContainer";
import ThirdPartyStorageModule from "./sub-components/ThirdPartyStorageModule";
import RoomsModule from "./sub-components/RoomsModule";
import ThirdPartyModule from "./sub-components/ThirdPartyModule";
import { StyledModules, StyledAutoBackup } from "../StyledBackup";

const { DocumentModuleType, ResourcesModuleType, StorageModuleType } =
  BackupStorageType;
const { EveryDayType, EveryWeekType, EveryMonthType } = AutoBackupPeriod;
class AutomaticBackup extends React.PureComponent {
  constructor(props) {
    super(props);
    const { t, tReady, language } = props;
    moment.locale(language);

    this.state = {
      isLoadingData: false,
      isInitialLoading: false,
      isEmptyContentBeforeLoader: true,
      isError: false,
    };

    this.periodsObject = [
      {
        key: 0,
        label: t("Common:EveryDay"),
      },
      {
        key: 1,
        label: t("Common:EveryWeek"),
      },
      {
        key: 2,
        label: t("Common:EveryMonth"),
      },
    ];
    this.timerId = null;
    this.hoursArray = [];
    this.monthNumbersArray = [];
    this.maxNumberCopiesArray = [];
    this.weekdaysLabelArray = [];

    if (tReady) setDocumentTitle(t("AutoBackup"));

    this.getTime();
    this.getMonthNumbers();
    this.getMaxNumberCopies();
  }

  componentDidMount() {
    const {
      fetchTreeFolders,
      rootFoldersTitles,
      setDownloadingProgress,
      setTemporaryLink,
      t,
    } = this.props;

    SocketHelper.on(SocketEvents.BackupProgress, (opt) => {
      const options = getBackupProgressInfo(
        opt,
        t,
        setDownloadingProgress,
        setTemporaryLink,
      );
      if (!options) return;

      const { error, success } = options;

      if (error) toastr.error(error);
      if (success) toastr.success(success);
    });

    this.getWeekdays();

    this.timerId = setTimeout(() => {
      this.setState({ isInitialLoading: true });
    }, 200);

    if (Object.keys(rootFoldersTitles).length === 0) fetchTreeFolders();

    this.setBasicSettings();
  }

  componentDidUpdate(prevProps) {
    const { t, tReady } = this.props;
    if (prevProps.tReady !== tReady && tReady)
      setDocumentTitle(t("AutoBackup"));
  }

  componentWillUnmount() {
    const { resetDownloadingProgress } = this.props;
    clearTimeout(this.timerId);
    this.timerId = null;
    resetDownloadingProgress();

    SocketHelper.off(SocketEvents.BackupProgress);
  }

  setBasicSettings = async () => {
    const {
      setDefaultOptions,
      t,
      setThirdPartyStorage,
      setBackupSchedule,
      getProgress,
      setStorageRegions,
      setConnectedThirdPartyAccount,
      setErrorInformation,
    } = this.props;

    try {
      getProgress(t);

      const [account, backupSchedule, backupStorage, storageRegions] =
        await Promise.all([
          getSettingsThirdParty(),
          getBackupSchedule(isManagement()),
          getBackupStorage(),
          getStorageRegions(),
        ]);
      setConnectedThirdPartyAccount(account);
      setThirdPartyStorage(backupStorage);
      setBackupSchedule(backupSchedule);
      setStorageRegions(storageRegions);

      setDefaultOptions(t, this.periodsObject, this.weekdaysLabelArray);

      clearTimeout(this.timerId);
      this.timerId = null;

      this.setState({
        isEmptyContentBeforeLoader: false,
        isInitialLoading: false,
      });
    } catch (error) {
      setErrorInformation(error, t);
      clearTimeout(this.timerId);
      this.timerId = null;
      this.setState({
        isEmptyContentBeforeLoader: false,
        isInitialLoading: false,
        isInitialError: true,
      });
    }
  };

  getTime = () => {
    for (let item = 0; item < 24; item++) {
      const obj = {
        key: item,
        label: `${item}:00`,
      };
      this.hoursArray.push(obj);
    }
  };

  getMonthNumbers = () => {
    for (let item = 1; item <= 31; item++) {
      const obj = {
        key: item,
        label: `${item}`,
      };
      this.monthNumbersArray.push(obj);
    }
  };

  getMaxNumberCopies = () => {
    const { t } = this.props;
    for (let item = 1; item <= 30; item++) {
      const obj = {
        key: `${item}`,
        label: `${t("MaxCopies", { copiesCount: item })}`,
      };
      this.maxNumberCopiesArray.push(obj);
    }
  };

  getWeekdays = () => {
    const { language } = this.props;
    const gettingWeekdays = moment.weekdays();
    for (let item = 0; item < gettingWeekdays.length; item++) {
      const obj = {
        key: `${item + 1}`,
        label: `${gettingWeekdays[item]}`,
      };
      this.weekdaysLabelArray.push(obj);
    }
    const isEnglishLanguage = language === "en";
    if (!isEnglishLanguage) {
      this.weekdaysLabelArray.push(this.weekdaysLabelArray.shift());
    }
  };

  onClickPermissions = () => {
    const { seStorageType, setSelectedEnableSchedule } = this.props;

    seStorageType(DocumentModuleType.toString());

    setSelectedEnableSchedule();
  };

  onClickShowStorage = (e) => {
    const { seStorageType } = this.props;
    const key = e.target.name;
    seStorageType(key);
  };

  onCancelModuleSettings = () => {
    const { isError } = this.state;
    const {
      toDefault,
      isCheckedThirdParty,
      isCheckedDocuments,
      resetNewFolderPath,

      defaultFolderId,
    } = this.props;

    toDefault();
    (isCheckedThirdParty || isCheckedDocuments) &&
      resetNewFolderPath(defaultFolderId);
    this.setState({
      ...(isError && { isError: false }),
    });
  };

  canSave = () => {
    const {
      isCheckedDocuments,
      isCheckedThirdParty,
      isCheckedThirdPartyStorage,
      selectedFolderId,
      isFormReady,
    } = this.props;

    if (
      (isCheckedDocuments && !selectedFolderId) ||
      (isCheckedThirdParty && !selectedFolderId)
    ) {
      this.setState({
        isError: true,
      });
      return false;
    }

    if (isCheckedThirdPartyStorage) {
      return isFormReady();
    }
    return true;
  };

  onSaveModuleSettings = async () => {
    const {
      isCheckedDocuments,
      isCheckedThirdParty,
      isCheckedThirdPartyStorage,
      selectedMaxCopiesNumber,
      selectedPeriodNumber,
      selectedWeekday,
      selectedHour,
      selectedMonthDay,
      selectedStorageId,
      selectedFolderId,
      selectedEnableSchedule,
      getStorageParams,
    } = this.props;

    if (!selectedEnableSchedule) {
      this.deleteSchedule();
      return;
    }

    if (!this.canSave()) return;
    // return;
    this.setState({ isLoadingData: true }, () => {
      let day;
      let period;

      if (selectedPeriodNumber === "1") {
        period = EveryWeekType;
        day = selectedWeekday;
      } else if (selectedPeriodNumber === "2") {
        period = EveryMonthType;
        day = selectedMonthDay;
      } else {
        period = EveryDayType;
        day = null;
      }
      const time = selectedHour.substring(0, selectedHour.indexOf(":"));

      const storageType = isCheckedDocuments
        ? DocumentModuleType
        : isCheckedThirdParty
          ? ResourcesModuleType
          : StorageModuleType;

      const storageParams = getStorageParams(
        isCheckedThirdPartyStorage,
        selectedFolderId,
        selectedStorageId,
      );

      this.createSchedule(
        storageType.toString(),
        storageParams,
        selectedMaxCopiesNumber,
        period.toString(),
        time,
        day?.toString(),
      );
    });
  };

  createSchedule = async (
    storageType,
    storageParams,
    selectedMaxCopiesNumber,
    period,
    time,
    day,
  ) => {
    const {
      t,
      setThirdPartyStorage,
      setDefaultOptions,
      setBackupSchedule,

      isCheckedThirdParty,
      isCheckedDocuments,
      updateBaseFolderPath,
      setErrorInformation,
    } = this.props;

    try {
      (isCheckedThirdParty || isCheckedDocuments) && updateBaseFolderPath();

      await createBackupSchedule(
        storageType,
        storageParams,
        selectedMaxCopiesNumber,
        period,
        time,
        day,
        false,
        isManagement(),
      );
      const [selectedSchedule, storageInfo] = await Promise.all([
        getBackupSchedule(isManagement()),
        getBackupStorage(),
      ]);
      setBackupSchedule(selectedSchedule);
      setThirdPartyStorage(storageInfo);
      setDefaultOptions(t, this.periodsObject, this.weekdaysLabelArray);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
      this.setState({
        isLoadingData: false,
      });
    } catch (error) {
      setErrorInformation(error, t);

      (isCheckedThirdParty || isCheckedDocuments) && updateBaseFolderPath();

      this.setState({
        isLoadingData: false,
      });
    }
  };

  deleteSchedule = () => {
    const { t, deleteSchedule, setErrorInformation } = this.props;
    this.setState({ isLoadingData: true }, () => {
      deleteBackupSchedule()
        .then(() => {
          deleteSchedule(this.weekdaysLabelArray);
          toastr.success(t("SuccessfullySaveSettingsMessage"));

          this.setState({
            isLoadingData: false,
          });
        })
        .catch((error) => {
          setErrorInformation(error, t);
          this.setState({
            isLoadingData: false,
          });
        });
    });
  };

  render() {
    const {
      t,
      isCheckedThirdPartyStorage,
      isCheckedThirdParty,
      isCheckedDocuments,
      // commonThirdPartyList,
      buttonSize,
      downloadingProgress,
      theme,
      selectedEnableSchedule,
      rootFoldersTitles,
      isEnableAuto,
      automaticBackupUrl,
      currentColorScheme,
      isBackupProgressVisible,
      errorInformation,
    } = this.props;

    const {
      isInitialLoading,
      isLoadingData,
      isError,
      isEmptyContentBeforeLoader,
      isInitialError,
    } = this.state;

    const commonProps = {
      isLoadingData,
      monthNumbersArray: this.monthNumbersArray,
      hoursArray: this.hoursArray,
      maxNumberCopiesArray: this.maxNumberCopiesArray,
      periodsObject: this.periodsObject,
      weekdaysLabelArray: this.weekdaysLabelArray,
    };
    const commonRadioButtonProps = {
      fontSize: "13px",
      fontWeight: "600",
      value: "value",
      className: "backup_radio-button",
      onClick: this.onClickShowStorage,
    };

    const roomName = rootFoldersTitles[FolderType.USER]?.title;
    return isEmptyContentBeforeLoader &&
      !isInitialLoading ? null : isInitialLoading ? (
      <AutoBackupLoader />
    ) : (
      <StyledAutoBackup isEnableAuto={isEnableAuto}>
        <StatusMessage message={errorInformation} />
        <div className="backup_modules-header_wrapper">
          <Text className="backup_modules-description settings_unavailable">
            {t("AutoBackupDescription", {
              productName: t("Common:ProductName"),
            })}
          </Text>
          {!isManagement() ? (
            <Link
              className="link-learn-more"
              href={automaticBackupUrl}
              target="_blank"
              fontSize="13px"
              color={currentColorScheme.main?.accent}
              isHovered
            >
              {t("Common:LearnMore")}
            </Link>
          ) : null}
        </div>

        <div className="backup_toggle-wrapper">
          <ToggleButton
            className="enable-automatic-backup backup_toggle-btn"
            onChange={this.onClickPermissions}
            isChecked={selectedEnableSchedule}
            isDisabled={isLoadingData || !isEnableAuto || isInitialError}
          />

          <div className="toggle-caption">
            <div className="toggle-caption_title">
              <Text
                fontWeight={600}
                lineHeight="20px"
                noSelect
                className="settings_unavailable"
              >
                {t("EnableAutomaticBackup")}
              </Text>
              {!isEnableAuto && !isManagement() ? (
                <Badge
                  backgroundColor={
                    theme.isBase
                      ? globalColors.favoritesStatus
                      : globalColors.favoriteStatusDark
                  }
                  label={t("Common:Paid")}
                  fontWeight="700"
                  className="auto-backup_badge"
                  isPaidBadge
                />
              ) : null}
            </div>
            <Text className="backup_toggle-btn-description settings_unavailable">
              {t("EnableAutomaticBackupDescription")}
            </Text>
          </div>
        </div>
        {!isInitialError && selectedEnableSchedule && isEnableAuto ? (
          <div className="backup_modules">
            <StyledModules>
              <RadioButton
                key={0}
                {...commonRadioButtonProps}
                id="backup-room"
                label={t("RoomsModule")}
                name={`${DocumentModuleType}`}
                isChecked={isCheckedDocuments}
                isDisabled={isLoadingData}
              />
              <Text className="backup-description">
                <Trans t={t} i18nKey="RoomsModuleDescription" ns="Settings">
                  {{ roomName }}
                </Trans>
              </Text>
              {isCheckedDocuments ? (
                <RoomsModule {...commonProps} isError={isError} />
              ) : null}
            </StyledModules>

            <StyledModules
            // isDisabled={isDisabledThirdPartyList}
            >
              <RadioButton
                {...commonRadioButtonProps}
                id="third-party-resource"
                label={t("ThirdPartyResource")}
                name={`${ResourcesModuleType}`}
                isChecked={isCheckedThirdParty}
                isDisabled={
                  isLoadingData
                  // || isDisabledThirdPartyList
                }
              />
              <Text className="backup-description">
                {t("ThirdPartyResourceDescription")}
              </Text>
              {isCheckedThirdParty ? (
                <ThirdPartyModule
                  {...commonProps}
                  isError={isError}
                  buttonSize={buttonSize}
                />
              ) : null}
            </StyledModules>
            <StyledModules>
              <RadioButton
                {...commonRadioButtonProps}
                id="third-party-storage"
                label={t("Common:ThirdPartyStorage")}
                name={`${StorageModuleType}`}
                isChecked={isCheckedThirdPartyStorage}
                isDisabled={isLoadingData}
              />
              <Text className="backup-description">
                {t("ThirdPartyStorageDescription")}
              </Text>

              {isCheckedThirdPartyStorage ? (
                <ThirdPartyStorageModule {...commonProps} />
              ) : null}
            </StyledModules>
          </div>
        ) : null}

        <ButtonContainer
          t={t}
          isLoadingData={isLoadingData || isInitialError}
          buttonSize={buttonSize}
          onSaveModuleSettings={this.onSaveModuleSettings}
          onCancelModuleSettings={this.onCancelModuleSettings}
        />

        {isBackupProgressVisible ? (
          <FloatingButton
            className="layout-progress-bar"
            icon="file"
            alert={false}
            percent={downloadingProgress}
          />
        ) : null}
      </StyledAutoBackup>
    );
  }
}
export default inject(
  ({
    authStore,
    settingsStore,
    backup,
    treeFoldersStore,
    filesSelectorInput,
    currentQuotaStore,
  }) => {
    const { language } = authStore;
    const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
    const {
      theme,
      currentColorScheme,
      automaticBackupUrl,
      checkEnablePortalSettings,
    } = settingsStore;

    const {
      downloadingProgress,
      backupSchedule,
      // commonThirdPartyList,
      clearProgressInterval,
      deleteSchedule,
      getProgress,
      setThirdPartyStorage,
      setDefaultOptions,
      setBackupSchedule,
      selectedStorageType,
      seStorageType,
      // setCommonThirdPartyList,
      selectedPeriodLabel,
      selectedWeekdayLabel,
      selectedWeekday,
      selectedHour,
      selectedMonthDay,
      selectedMaxCopiesNumber,
      selectedPeriodNumber,
      selectedFolderId,
      selectedStorageId,
      toDefault,
      isFormReady,
      getStorageParams,
      setSelectedEnableSchedule,
      selectedEnableSchedule,
      setConnectedThirdPartyAccount,
      setStorageRegions,
      defaultFolderId,
      isBackupProgressVisible,
      setDownloadingProgress,
      setTemporaryLink,
      resetDownloadingProgress,
      errorInformation,
      setErrorInformation,
    } = backup;

    const { updateBaseFolderPath, resetNewFolderPath } = filesSelectorInput;

    const isCheckedDocuments = selectedStorageType === `${DocumentModuleType}`;
    const isCheckedThirdParty =
      selectedStorageType === `${ResourcesModuleType}`;
    const isCheckedThirdPartyStorage =
      selectedStorageType === `${StorageModuleType}`;

    const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;

    const isEnableAuto = checkEnablePortalSettings(
      isRestoreAndAutoBackupAvailable,
    );

    return {
      setConnectedThirdPartyAccount,
      defaultFolderId,
      isEnableAuto,
      fetchTreeFolders,
      rootFoldersTitles,
      downloadingProgress,
      theme,
      language,
      isFormReady,
      backupSchedule,
      // commonThirdPartyList,
      clearProgressInterval,
      deleteSchedule,
      getProgress,
      setThirdPartyStorage,
      setDefaultOptions,
      setBackupSchedule,
      selectedStorageType,
      seStorageType,
      // setCommonThirdPartyList,
      selectedPeriodLabel,
      selectedWeekdayLabel,
      selectedWeekday,
      selectedHour,
      selectedMonthDay,
      selectedMaxCopiesNumber,
      selectedPeriodNumber,
      selectedFolderId,
      selectedStorageId,

      toDefault,

      isCheckedThirdPartyStorage,
      isCheckedThirdParty,
      isCheckedDocuments,

      getStorageParams,

      setSelectedEnableSchedule,
      selectedEnableSchedule,

      resetNewFolderPath,
      setStorageRegions,
      updateBaseFolderPath,

      automaticBackupUrl,
      currentColorScheme,
      isBackupProgressVisible,
      setDownloadingProgress,
      setTemporaryLink,
      resetDownloadingProgress,
      errorInformation,
      setErrorInformation,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(AutomaticBackup)));
