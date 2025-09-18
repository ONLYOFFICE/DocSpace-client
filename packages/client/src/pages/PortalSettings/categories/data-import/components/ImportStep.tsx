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

import { inject, observer } from "mobx-react";
import styled from "styled-components";

import AccountsIcon from "PUBLIC_DIR/images/icons/16/catalog.accounts.react.svg?url";
import RoomsIcon from "PUBLIC_DIR/images/icons/16/catalog.rooms.react.svg?url";
import PortfolioIcon from "PUBLIC_DIR/images/icons/16/catalog.portfolio.react.svg?url";
import ProjectsIcon from "PUBLIC_DIR/images/icons/16/catalog.projects.react.svg?url";
import DocumentsIcon from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg?url";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import ImportSection from "../sub-components/ImportSection";
import { ImportStepProps, InjectedImportStepProps } from "../types";
import { MigrationButtons } from "../sub-components/MigrationButtons";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .save-cancel-buttons {
    margin-top: 4px;
  }
`;

const ImportStep = (props: ImportStepProps) => {
  const {
    t,
    serviceName,
    usersExportDetails,
    personalExportDetails,
    sharedFilesExportDetails,
    sharedFoldersExportDetails,
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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const checked = e.target.checked;
    setImportOptions({ [name]: checked });
  };

  const users =
    t("Settings:Employees")[0].toUpperCase() + t("Settings:Employees").slice(1);

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
    <Wrapper>
      <ImportSection
        isChecked
        sectionName={users}
        description={t("Settings:UsersSectionDescription")}
        exportSection={{
          sectionName: usersExportDetails.name,
          workspace: serviceName,
          sectionIcon: usersExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Contacts"),
          workspace: t("Common:ProductName"),
          sectionIcon: AccountsIcon,
        }}
        isDisabled
        dataTestId="import_users_section"
      />

      <ImportSection
        isChecked={importOptions.importGroups}
        onChange={(e) => onChange(e, "importGroups")}
        sectionName={t("Common:Groups")}
        description={t("Settings:GroupsDescription", {
          serviceName,
          contactsName: t("Common:Contacts"),
        })}
        exportSection={{
          sectionName: t("Common:Groups"),
          workspace: serviceName,
        }}
        importSection={{
          sectionName: t("Common:Contacts"),
          workspace: t("Common:ProductName"),
          sectionIcon: AccountsIcon,
        }}
        isDisabled={false}
        dataTestId="import_groups_section"
      />

      <ImportSection
        isChecked={importOptions.importPersonalFiles}
        onChange={(e) => onChange(e, "importPersonalFiles")}
        sectionName={t("Settings:PersonalFiles")}
        description={t("Settings:ImportFilesLocation", {
          sectionName: t("Common:MyDocuments"),
        })}
        exportSection={{
          sectionName: personalExportDetails.name,
          workspace: serviceName,
          sectionIcon: personalExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Documents"),
          workspace: t("Common:ProductName"),
          sectionIcon: DocumentsIcon,
        }}
        isDisabled={false}
        dataTestId="import_personal_files_section"
      />

      <ImportSection
        isChecked={importOptions.importSharedFiles}
        onChange={(e) => onChange(e, "importSharedFiles")}
        sectionName={t("Settings:SharedFiles")}
        description={t("Settings:SharedFilesImportLocation", {
          sectionName: t("Common:MyDocuments"),
        })}
        exportSection={{
          sectionName: sharedFilesExportDetails.name,
          workspace: serviceName,
          sectionIcon: sharedFilesExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Documents"),
          workspace: t("Common:ProductName"),
          sectionIcon: DocumentsIcon,
        }}
        isDisabled={false}
        dataTestId="import_shared_files_section"
      />
      <ImportSection
        isChecked={importOptions.importSharedFolders}
        onChange={(e) => onChange(e, "importSharedFolders")}
        sectionName={t("Settings:SharedFolders")}
        description={t("Settings:FolderToRoomImportNote", {
          sectionName: t("Common:Rooms"),
        })}
        exportSection={{
          sectionName: sharedFoldersExportDetails.name,
          workspace: serviceName,
          sectionIcon: sharedFoldersExportDetails.icon,
        }}
        importSection={{
          sectionName: t("Common:Rooms"),
          workspace: t("Common:ProductName"),
          sectionIcon: RoomsIcon,
        }}
        isDisabled={false}
        dataTestId="import_shared_folders_section"
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
            workspace: t("Common:ProductName"),
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
            workspace: t("Common:ProductName"),
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
    </Wrapper>
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
