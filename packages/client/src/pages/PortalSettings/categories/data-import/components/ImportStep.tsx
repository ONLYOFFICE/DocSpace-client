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

import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import SharedOutlineIcon from "PUBLIC_DIR/images/icons/16/catalog.shared.outline.svg?url";
import GroupsIcon from "PUBLIC_DIR/images/icons/16/departments.react.svg?url";
import MembersIcon from "PUBLIC_DIR/images/icons/16/catalog.user.react.svg?url";
import RoomsIcon from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import PortfolioIcon from "PUBLIC_DIR/images/icons/16/catalog.portfolio.react.svg?url";
import ProjectsIcon from "PUBLIC_DIR/images/icons/16/catalog.projects.react.svg?url";
import DocumentsIcon from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import {
  ImportOptionsKey,
  ImportOptionsType,
} from "SRC_DIR/store/ImportAccountsStore";

import ImportSection from "../sub-components/ImportSection";
import {
  ImportOptionsKeys,
  ImportStepProps,
  InjectedImportStepProps,
} from "../types";
import { MigrationButtons } from "../sub-components/MigrationButtons";
import styles from "../StyledDataImport.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const ImportStep = (props: ImportStepProps) => {
  const {
    t,
    serviceName,
    usersExportDetails,
    personalExportDetails,
    sharedFilesAndFoldersExportDetails,
    hasCommonFiles = false,
    hasProjectFiles = false,

    incrementStep,
    decrementStep,
    importOptions,
    setImportOptions,
    user,
    cancelMigration,
    clearCheckedAccounts,
    setStep,
    setWorkspace,
    setMigratingWorkspace,
    setMigrationPhase,

    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
  } = props as InjectedImportStepProps;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: ImportOptionsKey,
  ) => {
    const newImportOptions: Partial<ImportOptionsType> = {};
    const checked = e.target.checked;

    switch (name) {
      case ImportOptionsKeys.ImportPersonalFiles:
        {
          newImportOptions[name] = checked;
          const sharedFilesAndFolderValue =
            importOptions[ImportOptionsKeys.ImportSharedFilesAndFolders];

          newImportOptions[ImportOptionsKeys.ImportSharedFilesAndFolders] =
            sharedFilesAndFolderValue ? checked : sharedFilesAndFolderValue;
        }
        break;
      default:
        newImportOptions[name] = checked;
        break;
    }

    setImportOptions({ ...newImportOptions });
  };

  const onCancelMigration = () => {
    cancelMigration();
    clearCheckedAccounts();
    setStep(1);
    setWorkspace("");
    setMigratingWorkspace("");
    setMigrationPhase("");
  };

  const showCancelDialog = () => setCancelUploadDialogVisible(true);
  const hideCancelDialog = () => setCancelUploadDialogVisible(false);

  return (
    <div className={styles.importWrapper}>
      <ImportSection
        isChecked
        sectionName={t("InfoPanel:Users")}
        description={t("Settings:UsersSectionDescription")}
        exportSection={{
          sectionName: usersExportDetails.name,
          workspace: serviceName,
          sectionIcon: usersExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Members"),
          workspace: getBrandName("ProductName"),
          sectionIcon: MembersIcon,
        }}
        isDisabled
        dataTestId="import_users_section"
      />

      <ImportSection
        isChecked={importOptions.importGroups}
        onChange={(e) => onChange(e, "importGroups")}
        sectionName={t("Common:Groups")}
        description={
          <Trans
            t={t}
            i18nKey="GroupsSectionDescription"
            ns="Settings"
            values={{
              serviceName,
              sectionName: t("Common:Contacts"),
            }}
            components={{
              1: <span />,
            }}
          />
        }
        exportSection={{
          sectionName: t("Common:Groups"),
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Common:Groups"),
          workspace: getBrandName("ProductName"),
          sectionIcon: GroupsIcon,
        }}
        isDisabled={false}
        dataTestId="import_groups_section"
      />

      <ImportSection
        isChecked={importOptions.importPersonalFiles}
        onChange={(e) => onChange(e, "importPersonalFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={
          <Trans
            t={t}
            i18nKey="ImportFilesDescription"
            ns="Settings"
            values={{
              serviceName,
              sectionName: t("Common:Files"),
            }}
            components={{
              1: <span />,
            }}
          />
        }
        exportSection={{
          sectionName: personalExportDetails.name,
          workspace: serviceName,
          sectionIcon: personalExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Files"),
          workspace: getBrandName("ProductName"),
          sectionIcon: DocumentsIcon,
        }}
        isDisabled={false}
        dataTestId="import_personal_files_section"
      />

      <ImportSection
        isChecked={importOptions.importSharedFilesAndFolders}
        onChange={(e) => onChange(e, "importSharedFilesAndFolders")}
        sectionName={t("Settings:SharedFilesAndFolders")}
        description={
          <Trans
            t={t}
            i18nKey="SharedFilesAndFoldersDescription"
            ns="Settings"
            values={{
              sectionName: t("Common:SharedWithMe"),
            }}
            components={{
              1: <span />,
            }}
          />
        }
        exportSection={{
          sectionName: sharedFilesAndFoldersExportDetails.name,
          workspace: serviceName,
          sectionIcon: sharedFilesAndFoldersExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:SharedWithMe"),
          workspace: getBrandName("ProductName"),
          sectionIcon: SharedOutlineIcon,
        }}
        isDisabled={!importOptions.importPersonalFiles}
        getTooltipContent={() => (
          <Trans
            t={t}
            i18nKey="ImportSectionDisabled"
            ns="Settings"
            values={{
              importSectionName: t(
                "Settings:SharedFilesAndFolders",
              ).toLocaleLowerCase(),
              sectionName: t("Settings:PersonalFiles"),
            }}
            components={{
              1: <b />,
            }}
          />
        )}
        dataTestId="import_shared_files_and_folders_section"
      />

      {hasCommonFiles ? (
        <ImportSection
          isChecked={importOptions.importCommonFiles}
          onChange={(e) => onChange(e, "importCommonFiles")}
          sectionName={t("Common:CommonFiles")}
          description={t("Settings:CommonFilesDescription", {
            user: user?.displayName,
          })}
          exportSection={{
            sectionName: t("Common:Common"),
            workspace: serviceName,
            sectionIcon: PortfolioIcon,
          }}
          importSection={{
            sectionName: t("Common:Rooms"),
            workspace: getBrandName("ProductName"),
            sectionIcon: RoomsIcon,
          }}
          isDisabled={false}
          dataTestId="import_common_files_section"
        />
      ) : null}

      {hasProjectFiles ? (
        <ImportSection
          isChecked={importOptions.importProjectFiles}
          onChange={(e) => onChange(e, "importProjectFiles")}
          sectionName={t("Common:Projects")}
          description={t("Settings:ProjectsDescription")}
          exportSection={{
            sectionName: t("Common:Projects"),
            workspace: serviceName,
            sectionIcon: ProjectsIcon,
          }}
          importSection={{
            sectionName: t("Common:Rooms"),
            workspace: getBrandName("ProductName"),
            sectionIcon: RoomsIcon,
          }}
          isDisabled={false}
          dataTestId="import_project_files_section"
        />
      ) : null}

      <MigrationButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
        showReminder
        migrationCancelLabel={t("Settings:CancelImport")}
        onMigrationCancelClick={showCancelDialog}
      />

      {cancelUploadDialogVisible ? (
        <CancelUploadDialog
          visible={cancelUploadDialogVisible}
          onClose={hideCancelDialog}
          cancelMigration={onCancelMigration}
          loading={false}
          isFifthStep={false}
          isSixthStep={false}
        />
      ) : null}
    </div>
  );
};

export default inject<TStore>(
  ({ importAccountsStore, userStore, dialogsStore }) => {
    const {
      importOptions,
      setImportOptions,
      incrementStep,
      decrementStep,
      cancelMigration,
      clearCheckedAccounts,
      setStep,
      setWorkspace,
      setMigratingWorkspace,
      setMigrationPhase,
    } = importAccountsStore;
    const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
      dialogsStore;

    const { user } = userStore;

    return {
      user,
      importOptions,
      setImportOptions,
      incrementStep,
      decrementStep,
      cancelMigration,
      clearCheckedAccounts,
      setStep,
      setWorkspace,
      setMigratingWorkspace,
      setMigrationPhase,

      cancelUploadDialogVisible,
      setCancelUploadDialogVisible,
    };
  },
)(observer(ImportStep));
