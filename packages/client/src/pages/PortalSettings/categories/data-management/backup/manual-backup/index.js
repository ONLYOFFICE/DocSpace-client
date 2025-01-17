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
import { withTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import { startBackup } from "@docspace/shared/api/portal";
import { RadioButton } from "@docspace/shared/components/radio-button";
import { toastr } from "@docspace/shared/components/toast";
import { BackupStorageType, FolderType } from "@docspace/shared/enums";
// import { getThirdPartyCommonFolderTree } from "@docspace/shared/api/files";
import DataBackupLoader from "@docspace/shared/skeletons/backup/DataBackup";
import {
  getBackupStorage,
  getStorageRegions,
} from "@docspace/shared/api/settings";
import { FloatingButton } from "@docspace/shared/components/floating-button";
import { getSettingsThirdParty } from "@docspace/shared/api/files";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { isManagement } from "@docspace/shared/utils/common";
import { getFromLocalStorage, saveToLocalStorage } from "../../../../utils";
import { StyledModules, StyledManualBackup } from "../StyledBackup";
import ThirdPartyStorageModule from "./sub-components/ThirdPartyStorageModule";
import RoomsModule from "./sub-components/RoomsModule";
import ThirdPartyModule from "./sub-components/ThirdPartyModule";

let selectedStorageType = "";

class ManualBackup extends React.Component {
  constructor(props) {
    super(props);
    selectedStorageType = getFromLocalStorage("LocalCopyStorageType");
    const checkedDocuments = selectedStorageType
      ? selectedStorageType === "Documents"
      : false;
    const checkedTemporary = selectedStorageType
      ? selectedStorageType === "TemporaryStorage"
      : true;
    const checkedThirdPartyResource = selectedStorageType
      ? selectedStorageType === "ThirdPartyResource"
      : false;
    const checkedThirdPartyStorage = selectedStorageType
      ? selectedStorageType === "ThirdPartyStorage"
      : false;

    this.timerId = null;

    const { t, tReady } = props;

    if (tReady) setDocumentTitle(t("DataBackup"));

    this.state = {
      isInitialLoading: false,
      isEmptyContentBeforeLoader: true,
      isCheckedTemporaryStorage: checkedTemporary,
      isCheckedDocuments: checkedDocuments,
      isCheckedThirdParty: checkedThirdPartyResource,
      isCheckedThirdPartyStorage: checkedThirdPartyStorage,
    };
    this.switches = [
      "isCheckedTemporaryStorage",
      "isCheckedDocuments",
      "isCheckedThirdParty",
      "isCheckedThirdPartyStorage",
    ];
  }

  componentDidMount() {
    const { fetchTreeFolders, rootFoldersTitles, isNotPaidPeriod } = this.props;

    if (isNotPaidPeriod) {
      this.setState({
        isEmptyContentBeforeLoader: false,
      });

      return;
    }
    this.timerId = setTimeout(() => {
      this.setState({ isInitialLoading: true });
    }, 200);

    if (Object.keys(rootFoldersTitles).length === 0) fetchTreeFolders();
    this.setBasicSettings();
  }

  componentDidUpdate(prevProps) {
    const { t, tReady } = this.props;

    if (prevProps.tReady !== tReady && tReady)
      setDocumentTitle(t("DataBackup"));
  }

  componentWillUnmount() {
    const { clearProgressInterval } = this.props;
    clearTimeout(this.timerId);
    this.timerId = null;

    clearProgressInterval();
  }

  setBasicSettings = async () => {
    const {
      getProgress,
      // setCommonThirdPartyList,
      t,
      setThirdPartyStorage,
      setStorageRegions,
      setConnectedThirdPartyAccount,
    } = this.props;
    try {
      getProgress(t);

      const [account, backupStorage, storageRegions] = await Promise.all([
        getSettingsThirdParty(),
        getBackupStorage(),
        getStorageRegions(),
      ]);

      setConnectedThirdPartyAccount(account);
      setThirdPartyStorage(backupStorage);
      setStorageRegions(storageRegions);
      //   } else {
      //    const commonThirdPartyList = await getThirdPartyCommonFolderTree();
      // commonThirdPartyList && setCommonThirdPartyList(commonThirdPartyList);
      //   }
    } catch (error) {
      toastr.error(error);
      // this.clearLocalStorage();
    }

    clearTimeout(this.timerId);
    this.timerId = null;

    this.setState({
      isInitialLoading: false,
      isEmptyContentBeforeLoader: false,
    });
  };

  onMakeTemporaryBackup = async () => {
    const {
      getIntervalProgress,
      setDownloadingProgress,
      t,
      clearLocalStorage,
    } = this.props;
    const { TemporaryModuleType } = BackupStorageType;

    clearLocalStorage();
    saveToLocalStorage("LocalCopyStorageType", "TemporaryStorage");
    try {
      await startBackup(`${TemporaryModuleType}`, null, false, isManagement());
      setDownloadingProgress(1);
      getIntervalProgress(t);
    } catch (e) {
      toastr.error(e);
    }
  };

  onClickDownloadBackup = () => {
    const { temporaryLink } = this.props;
    const url = window.location.origin;
    const downloadUrl = `${url}${temporaryLink}`;
    window.open(downloadUrl, "_self");
  };

  onClickShowStorage = (e) => {
    const newStateObj = {};
    const name = e.target.name;
    newStateObj[name] = true;
    const newState = this.switches.filter((el) => el !== name);
    newState.forEach((key) => (newStateObj[key] = false));
    this.setState({
      ...newStateObj,
    });
  };

  onMakeCopy = async (
    selectedFolder,
    moduleName,
    moduleType,
    selectedStorageId,
    selectedStorageTitle,
  ) => {
    const { isCheckedThirdPartyStorage } = this.state;
    const {
      t,
      getIntervalProgress,
      setDownloadingProgress,
      clearLocalStorage,
      setTemporaryLink,
      getStorageParams,
    } = this.props;

    clearLocalStorage();

    const storageParams = getStorageParams(
      isCheckedThirdPartyStorage,
      selectedFolder,
      selectedStorageId,
    );

    const folderId = isCheckedThirdPartyStorage
      ? selectedStorageId
      : selectedFolder;

    saveToLocalStorage(
      isCheckedThirdPartyStorage,
      moduleName,
      folderId,
      selectedStorageTitle,
    );

    try {
      await startBackup(moduleType, storageParams, false, isManagement());
      setDownloadingProgress(1);
      setTemporaryLink("");
      getIntervalProgress(t);
    } catch (err) {
      toastr.error(err);
    }
  };

  render() {
    const {
      t,
      temporaryLink,
      downloadingProgress,
      // commonThirdPartyList,
      buttonSize,

      rootFoldersTitles,
      isNotPaidPeriod,
      dataBackupUrl,
      currentColorScheme,
      pageIsDisabled,
      isBackupProgressVisible,
    } = this.props;
    const {
      isInitialLoading,
      isCheckedTemporaryStorage,
      isCheckedDocuments,
      isCheckedThirdParty,
      isCheckedThirdPartyStorage,
      isEmptyContentBeforeLoader,
    } = this.state;

    const isMaxProgress = downloadingProgress === 100;

    const commonRadioButtonProps = {
      fontSize: "13px",
      fontWeight: "600",
      value: "value",
      className: "backup_radio-button",
      onClick: this.onClickShowStorage,
    };
    const commonModulesProps = {
      isMaxProgress,
      onMakeCopy: this.onMakeCopy,
      buttonSize,
    };

    const roomName = rootFoldersTitles[FolderType.USER]?.title;

    return isEmptyContentBeforeLoader &&
      !isInitialLoading ? null : isInitialLoading ? (
      <DataBackupLoader />
    ) : (
      <StyledManualBackup pageIsDisabled={pageIsDisabled}>
        <div className="backup_modules-header_wrapper">
          <Text className="backup_modules-description settings_unavailable">
            {t("ManualBackupDescription")}
          </Text>
          {!isManagement() ? (
            <Link
              className="link-learn-more"
              href={dataBackupUrl}
              target="_blank"
              fontSize="13px"
              color={currentColorScheme.main?.accent}
              isHovered
            >
              {t("Common:LearnMore")}
            </Link>
          ) : null}
        </div>

        <StyledModules isDisabled={isNotPaidPeriod || pageIsDisabled}>
          <RadioButton
            id="temporary-storage"
            label={t("TemporaryStorage")}
            name="isCheckedTemporaryStorage"
            key={0}
            isChecked={isCheckedTemporaryStorage}
            isDisabled={!isMaxProgress || pageIsDisabled}
            {...commonRadioButtonProps}
          />
          <Text className="backup-description settings_unavailable">
            {t("TemporaryStorageDescription")}
          </Text>
          {isCheckedTemporaryStorage ? (
            <div className="manual-backup_buttons">
              <Button
                id="create-button"
                label={t("Common:Create")}
                onClick={this.onMakeTemporaryBackup}
                primary
                isDisabled={!isMaxProgress || pageIsDisabled}
                size={buttonSize}
              />
              {temporaryLink?.length > 0 && isMaxProgress ? (
                <Button
                  id="download-copy"
                  label={t("DownloadCopy")}
                  onClick={this.onClickDownloadBackup}
                  isDisabled={pageIsDisabled}
                  size={buttonSize}
                  style={{ marginInlineStart: "8px" }}
                />
              ) : null}
              {!isMaxProgress ? (
                <Button
                  label={`${t("Common:CopyOperation")}...`}
                  isDisabled
                  size={buttonSize}
                  style={{ marginInlineStart: "8px" }}
                />
              ) : null}
            </div>
          ) : null}
        </StyledModules>
        <StyledModules isDisabled={isNotPaidPeriod || pageIsDisabled}>
          <RadioButton
            id="backup-room"
            label={t("RoomsModule")}
            name="isCheckedDocuments"
            key={1}
            isChecked={isCheckedDocuments}
            isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
            {...commonRadioButtonProps}
          />
          <Text className="backup-description module-documents settings_unavailable">
            <Trans t={t} i18nKey="RoomsModuleDescription" ns="Settings">
              {{ roomName }}
            </Trans>
          </Text>
          {isCheckedDocuments ? (
            <RoomsModule
              {...commonModulesProps}
              isCheckedDocuments={isCheckedDocuments}
            />
          ) : null}
        </StyledModules>

        <StyledModules isDisabled={isNotPaidPeriod || pageIsDisabled}>
          <RadioButton
            id="third-party-resource"
            label={t("ThirdPartyResource")}
            name="isCheckedThirdParty"
            key={2}
            isChecked={isCheckedThirdParty}
            isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
            {...commonRadioButtonProps}
          />
          <Text className="backup-description settings_unavailable">
            {t("ThirdPartyResourceDescription")}
          </Text>
          {isCheckedThirdParty ? (
            <ThirdPartyModule {...commonModulesProps} />
          ) : null}
        </StyledModules>
        <StyledModules isDisabled={isNotPaidPeriod || pageIsDisabled}>
          <RadioButton
            id="third-party-storage"
            label={t("Common:ThirdPartyStorage")}
            name="isCheckedThirdPartyStorage"
            key={3}
            isChecked={isCheckedThirdPartyStorage}
            isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
            {...commonRadioButtonProps}
          />
          <Text className="backup-description settings_unavailable">
            {t("ThirdPartyStorageDescription")}
          </Text>
          {isCheckedThirdPartyStorage ? (
            <ThirdPartyStorageModule {...commonModulesProps} />
          ) : null}
        </StyledModules>

        {isBackupProgressVisible ? (
          <FloatingButton
            className="layout-progress-bar"
            icon="file"
            alert={false}
            percent={downloadingProgress}
          />
        ) : null}
      </StyledManualBackup>
    );
  }
}

export default inject(
  ({ settingsStore, backup, treeFoldersStore, currentTariffStatusStore }) => {
    const {
      clearProgressInterval,
      clearLocalStorage,
      // commonThirdPartyList,
      downloadingProgress,
      getProgress,
      getIntervalProgress,
      setDownloadingProgress,
      setTemporaryLink,
      // setCommonThirdPartyList,
      temporaryLink,
      getStorageParams,
      setThirdPartyStorage,
      setStorageRegions,
      setConnectedThirdPartyAccount,
      isBackupProgressVisible,
    } = backup;

    const { currentColorScheme, dataBackupUrl, portals } = settingsStore;
    const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;

    const pageIsDisabled = isManagement() && portals?.length === 1;

    return {
      isNotPaidPeriod,
      setThirdPartyStorage,
      clearProgressInterval,
      clearLocalStorage,
      // commonThirdPartyList,
      downloadingProgress,
      getProgress,
      getIntervalProgress,
      setDownloadingProgress,
      setTemporaryLink,
      setStorageRegions,
      // setCommonThirdPartyList,
      temporaryLink,
      getStorageParams,
      rootFoldersTitles,
      fetchTreeFolders,
      setConnectedThirdPartyAccount,

      dataBackupUrl,
      currentColorScheme,
      pageIsDisabled,
      isBackupProgressVisible,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(ManualBackup)));
