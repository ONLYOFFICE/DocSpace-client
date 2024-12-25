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
import { StyledModules, StyledAutoBackup } from "../StyledBackup";
import ThirdPartyModule from "./sub-components/ThirdPartyModule";
import RoomsModule from "./sub-components/RoomsModule";
import ThirdPartyStorageModule from "./sub-components/ThirdPartyStorageModule";
//import { getThirdPartyCommonFolderTree } from "@docspace/shared/api/files";
import ButtonContainer from "./sub-components/ButtonContainer";
import AutoBackupLoader from "@docspace/shared/skeletons/backup/AutoBackup";
import { FloatingButton } from "@docspace/shared/components/floating-button";
import { Badge } from "@docspace/shared/components/badge";
import { Link } from "@docspace/shared/components/link";
import { getSettingsThirdParty } from "@docspace/shared/api/files";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { isManagement } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";

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
  setBasicSettings = async () => {
    const {
      setDefaultOptions,
      t,
      setThirdPartyStorage,
      setBackupSchedule,
      //setCommonThirdPartyList,
      getProgress,
      setStorageRegions,
      setConnectedThirdPartyAccount,
    } = this.props;

    try {
      getProgress(t);

      const [
        ///thirdPartyList,
        account,
        backupSchedule,
        backupStorage,
        storageRegions,
      ] = await Promise.all([
        //getThirdPartyCommonFolderTree(),
        getSettingsThirdParty(),
        getBackupSchedule(isManagement()),
        getBackupStorage(isManagement()),
        getStorageRegions(),
      ]);
      setConnectedThirdPartyAccount(account);
      setThirdPartyStorage(backupStorage);
      setBackupSchedule(backupSchedule);
      setStorageRegions(storageRegions);
      //thirdPartyList && setCommonThirdPartyList(thirdPartyList);

      setDefaultOptions(t, this.periodsObject, this.weekdaysLabelArray);

      clearTimeout(this.timerId);
      this.timerId = null;

      this.setState({
        isEmptyContentBeforeLoader: false,
        isInitialLoading: false,
      });
    } catch (error) {
      toastr.error(error);
      clearTimeout(this.timerId);
      this.timerId = null;
      this.setState({
        isEmptyContentBeforeLoader: false,
        isInitialLoading: false,
      });
    }
  };

  componentDidMount() {
    const { fetchTreeFolders, rootFoldersTitles } = this.props;

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
    const { clearProgressInterval } = this.props;
    clearTimeout(this.timerId);
    this.timerId = null;
    clearProgressInterval();
  }

  getTime = () => {
    for (let item = 0; item < 24; item++) {
      let obj = {
        key: item,
        label: `${item}:00`,
      };
      this.hoursArray.push(obj);
    }
  };
  getMonthNumbers = () => {
    for (let item = 1; item <= 31; item++) {
      let obj = {
        key: item,
        label: `${item}`,
      };
      this.monthNumbersArray.push(obj);
    }
  };
  getMaxNumberCopies = () => {
    const { t } = this.props;
    for (let item = 1; item <= 30; item++) {
      let obj = {
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
      let obj = {
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
    //return;
    this.setState({ isLoadingData: true }, function () {
      let day, period;

      if (selectedPeriodNumber === "1") {
        period = EveryWeekType;
        day = selectedWeekday;
      } else {
        if (selectedPeriodNumber === "2") {
          period = EveryMonthType;
          day = selectedMonthDay;
        } else {
          period = EveryDayType;
          day = null;
        }
      }
      let time = selectedHour.substring(0, selectedHour.indexOf(":"));

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
    } catch (e) {
      toastr.error(e);

      (isCheckedThirdParty || isCheckedDocuments) && updateBaseFolderPath();

      this.setState({
        isLoadingData: false,
      });
    }
  };
  deleteSchedule = () => {
    const { t, deleteSchedule } = this.props;
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
          toastr.error(error);
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
      //commonThirdPartyList,
      buttonSize,
      downloadingProgress,
      theme,
      selectedEnableSchedule,
      rootFoldersTitles,
      isEnableAuto,
      automaticBackupUrl,
      currentColorScheme,
      isBackupProgressVisible,
    } = this.props;

    const {
      isInitialLoading,
      isLoadingData,
      isError,
      isEmptyContentBeforeLoader,
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
      fontWeight: "400",
      value: "value",
      className: "backup_radio-button",
      onClick: this.onClickShowStorage,
    };

    const roomName = rootFoldersTitles[FolderType.USER]?.title;

    return isEmptyContentBeforeLoader && !isInitialLoading ? (
      <></>
    ) : isInitialLoading ? (
      <AutoBackupLoader />
    ) : (
      <StyledAutoBackup isEnableAuto={isEnableAuto}>
        <div className="backup_modules-header_wrapper">
          <Text className="backup_modules-description settings_unavailable">
            {t("AutoBackupDescription", {
              productName: t("Common:ProductName"),
            })}
          </Text>
          {!isManagement() && (
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
          )}
        </div>

        <div className="backup_toggle-wrapper">
          <ToggleButton
            className="enable-automatic-backup backup_toggle-btn"
            onChange={this.onClickPermissions}
            isChecked={selectedEnableSchedule}
            isDisabled={isLoadingData || !isEnableAuto}
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
              {!isEnableAuto && !isManagement() && (
                <Badge
                  backgroundColor={
                    theme.isBase
                      ? globalColors.favoritesStatus
                      : globalColors.favoriteStatusDark
                  }
                  label={t("Common:Paid")}
                  fontWeight="700"
                  className="auto-backup_badge"
                  isPaidBadge={true}
                />
              )}
            </div>
            <Text className="backup_toggle-btn-description settings_unavailable">
              {t("EnableAutomaticBackupDescription")}
            </Text>
          </div>
        </div>
        {selectedEnableSchedule && isEnableAuto && (
          <div className="backup_modules">
            <StyledModules>
              <RadioButton
                {...commonRadioButtonProps}
                id="backup-room"
                label={t("RoomsModule")}
                name={`${DocumentModuleType}`}
                key={0}
                isChecked={isCheckedDocuments}
                isDisabled={isLoadingData}
              />
              <Text className="backup-description">
                <Trans t={t} i18nKey="RoomsModuleDescription" ns="Settings">
                  {{ roomName }}
                </Trans>
              </Text>
              {isCheckedDocuments && (
                <RoomsModule {...commonProps} isError={isError} />
              )}
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
              {isCheckedThirdParty && (
                <ThirdPartyModule
                  {...commonProps}
                  isError={isError}
                  buttonSize={buttonSize}
                />
              )}
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

              {isCheckedThirdPartyStorage && (
                <ThirdPartyStorageModule {...commonProps} />
              )}
            </StyledModules>
          </div>
        )}

        <ButtonContainer
          t={t}
          isLoadingData={isLoadingData}
          buttonSize={buttonSize}
          onSaveModuleSettings={this.onSaveModuleSettings}
          onCancelModuleSettings={this.onCancelModuleSettings}
        />

        {isBackupProgressVisible && (
          <FloatingButton
            className="layout-progress-bar"
            icon="file"
            alert={false}
            percent={downloadingProgress}
          />
        )}
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
      //commonThirdPartyList,
      clearProgressInterval,
      deleteSchedule,
      getProgress,
      setThirdPartyStorage,
      setDefaultOptions,
      setBackupSchedule,
      selectedStorageType,
      seStorageType,
      //setCommonThirdPartyList,
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
      //commonThirdPartyList,
      clearProgressInterval,
      deleteSchedule,
      getProgress,
      setThirdPartyStorage,
      setDefaultOptions,
      setBackupSchedule,
      selectedStorageType,
      seStorageType,
      //setCommonThirdPartyList,
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
    };
  },
)(withTranslation(["Settings", "Common"])(observer(AutomaticBackup)));
