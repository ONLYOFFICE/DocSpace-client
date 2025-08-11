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

import React, { type JSX } from "react";

import {
  TEnhancedMigrationUser,
  TWorkspaceService,
} from "@docspace/shared/api/settings/types";
import { TPaymentFeature } from "@docspace/shared/api/portal/types";

import { TOption } from "@docspace/shared/components/combobox";
import { SaveCancelButtonProps } from "@docspace/shared/components/save-cancel-buttons/SaveCancelButton.types";
import { TTranslation } from "@docspace/shared/types";

import type { TFunction } from "i18next";
import { TUser } from "@docspace/shared/api/people/types";

export interface ProvidersProps {}

export interface InjectedProvidersProps extends ProvidersProps {
  theme: TStore["settingsStore"]["theme"];
  services: TStore["importAccountsStore"]["services"];
  setServices: TStore["importAccountsStore"]["setServices"];
  getMigrationList: TStore["importAccountsStore"]["getMigrationList"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  logoText: TStore["settingsStore"]["logoText"];
}

export interface SelectFileStepProps {
  t: TFunction;
  isMultipleUpload?: boolean;
  acceptedExtensions: string[];
  migratorName: TWorkspaceService;
}

export interface InjectedSelectFileStepProps extends SelectFileStepProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  cancelUploadDialogVisible: TStore["dialogsStore"]["cancelUploadDialogVisible"];
  setCancelUploadDialogVisible: TStore["dialogsStore"]["setCancelUploadDialogVisible"];
  initMigrations: TStore["importAccountsStore"]["initMigrations"];
  getMigrationStatus: TStore["importAccountsStore"]["getMigrationStatus"];
  setUsers: TStore["importAccountsStore"]["setUsers"];
  fileLoadingStatus: TStore["importAccountsStore"]["fileLoadingStatus"];
  setLoadingStatus: TStore["importAccountsStore"]["setLoadingStatus"];
  cancelMigration: TStore["importAccountsStore"]["cancelMigration"];
  files: TStore["importAccountsStore"]["files"];
  setFiles: TStore["importAccountsStore"]["setFiles"];
  migratingWorkspace: TStore["importAccountsStore"]["migratingWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  uploadFiles: TStore["importAccountsStore"]["uploadFiles"];
  defaultUsersQuota: TStore["currentQuotaStore"]["defaultUsersQuota"];
  defaultRoomsQuota: TStore["currentQuotaStore"]["defaultRoomsQuota"];
  tenantCustomQuota: TStore["currentQuotaStore"]["tenantCustomQuota"];
  isDefaultUsersQuotaSet: TStore["currentQuotaStore"]["isDefaultUsersQuotaSet"];
  isDefaultRoomsQuotaSet: TStore["currentQuotaStore"]["isDefaultRoomsQuotaSet"];
  isTenantCustomQuotaSet: TStore["currentQuotaStore"]["isTenantCustomQuotaSet"];
  warningQuotaDialogVisible: TStore["dialogsStore"]["warningQuotaDialogVisible"];
  setWarningQuotaDialogVisible: TStore["dialogsStore"]["setWarningQuotaDialogVisible"];
}

export interface DataImportProps {}

export interface InjectedDataImportProps extends DataImportProps {
  getMigrationStatus: TStore["importAccountsStore"]["getMigrationStatus"];
  viewAs: TStore["setup"]["viewAs"];
  setViewAs: TStore["setup"]["setViewAs"];
  currentDeviceType: TStore["settingsStore"]["currentDeviceType"];
  isMigrationInit: TStore["importAccountsStore"]["isMigrationInit"];
  setUsers: TStore["importAccountsStore"]["setUsers"];
  workspace: TStore["importAccountsStore"]["workspace"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setFiles: TStore["importAccountsStore"]["setFiles"];
  setLoadingStatus: TStore["importAccountsStore"]["setLoadingStatus"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];
}

export interface WorkspaceProps {}

export interface InjectedWorkspaceProps extends WorkspaceProps {
  theme: TStore["settingsStore"]["theme"];
  filteredUsers: TStore["importAccountsStore"]["filteredUsers"];
  step: TStore["importAccountsStore"]["step"];
  setStep: TStore["importAccountsStore"]["setStep"];
  migratingWorkspace: TStore["importAccountsStore"]["migratingWorkspace"];
  migrationPhase: TStore["importAccountsStore"]["migrationPhase"];
  isMigrationInit: TStore["importAccountsStore"]["isMigrationInit"];
  setIsMigrationInit: TStore["importAccountsStore"]["setIsMigrationInit"];
  logoText: TStore["settingsStore"]["logoText"];
}

export interface LayoutProps {
  t: TFunction;
  theme: TStore["settingsStore"]["theme"];
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  component: JSX.Element;
  logoText: string;
}

export type TQuota = TPaymentFeature;

export interface SelectUsersStepProps {
  t: TTranslation;
  canDisable: boolean;
  shouldSetUsers: boolean;
}

export interface InjectedSelectUsersStepProps extends SelectUsersStepProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  decrementStep: TStore["importAccountsStore"]["decrementStep"];
  withEmailUsers: TStore["importAccountsStore"]["withEmailUsers"];
  searchValue: TStore["importAccountsStore"]["searchValue"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
  cancelMigration: TStore["importAccountsStore"]["cancelMigration"];

  areCheckedUsersEmpty: TStore["importAccountsStore"]["areCheckedUsersEmpty"];
  setResultUsers: TStore["importAccountsStore"]["setResultUsers"];
  clearCheckedAccounts: TStore["importAccountsStore"]["clearCheckedAccounts"];
  setStep: TStore["importAccountsStore"]["setStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];

  cancelUploadDialogVisible: TStore["dialogsStore"]["cancelUploadDialogVisible"];
  setCancelUploadDialogVisible: TStore["dialogsStore"]["setCancelUploadDialogVisible"];

  totalUsedUsers: TStore["importAccountsStore"]["totalUsedUsers"];
  quota: TStore["importAccountsStore"]["quota"];
}

export interface AccountsTableProps {
  t?: TFunction;
  accountsData: TStore["importAccountsStore"]["withEmailUsers"];
}

export interface InjectedAccountsTableProps extends AccountsTableProps {
  viewAs: TStore["setup"]["viewAs"];
}

export interface TableViewProps {
  t: TFunction;
  sectionWidth?: number;
  accountsData: TStore["importAccountsStore"]["withEmailUsers"];
}

export interface InjectedTableViewProps extends TableViewProps {
  userId?: string;
  checkedUsers: TStore["importAccountsStore"]["checkedUsers"];
  toggleAccount: TStore["importAccountsStore"]["toggleAccount"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isAccountChecked: TStore["importAccountsStore"]["isAccountChecked"];
}

export interface AddEmailTableProps extends InjectedTableViewProps {
  users: TStore["importAccountsStore"]["users"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
}

export interface SelectUserTableProps extends InjectedTableViewProps {
  withEmailUsers: TStore["importAccountsStore"]["withEmailUsers"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
}

export interface UsersTableHeaderProps {
  t: TFunction;
  sectionWidth?: number;

  userId?: string;
  tableRef: React.RefObject<HTMLDivElement | null>;
  columnStorageName: string;
  columnInfoPanelStorageName: string;
  isIndeterminate: boolean;
  isChecked: boolean;
  toggleAll?: (e?: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface UsersTableRowProps {
  t: TFunction;
  displayName: string;
  email: string;
  isDuplicate: boolean;
  isChecked: boolean;
  toggleAccount: (
    e: React.MouseEvent<Element> | React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export interface RowViewProps {
  t: TFunction;
  sectionWidth?: number;
  accountsData: TStore["importAccountsStore"]["withEmailUsers"];
}

export interface InjectedRowViewProps extends RowViewProps {
  userId?: string;
  checkedUsers: TStore["importAccountsStore"]["checkedUsers"];
  withEmailUsers: TStore["importAccountsStore"]["withEmailUsers"];
  toggleAccount: TStore["importAccountsStore"]["toggleAccount"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isAccountChecked: TStore["importAccountsStore"]["isAccountChecked"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
}

export interface AddEmailRowProps extends RowViewProps {
  users: TStore["importAccountsStore"]["users"];
  checkedUsers: TStore["importAccountsStore"]["checkedUsers"];
  toggleAccount: TStore["importAccountsStore"]["toggleAccount"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isAccountChecked: TStore["importAccountsStore"]["isAccountChecked"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
}

export interface UsersRowProps {
  t: TFunction;
  data: TEnhancedMigrationUser;
  sectionWidth?: number;
  isChecked: boolean;
  toggleAccount: () => void;
}

export interface AddEmailUsersRowProps extends UsersRowProps {
  isEmailOpen: boolean;
  setOpenedEmailKey: React.Dispatch<React.SetStateAction<string>>;
}

export interface UsersRowContentProps {
  t: TFunction;
  data: TEnhancedMigrationUser;
  sectionWidth?: number;
  displayName: string;
  email: string;
  isDuplicate: boolean;
}

export interface AddEmailsStepProps {
  t: TTranslation;
}

export interface InjectedAddEmailsStepProps extends AddEmailsStepProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  decrementStep: TStore["importAccountsStore"]["decrementStep"];
  users: TStore["importAccountsStore"]["users"];
  searchValue: TStore["importAccountsStore"]["searchValue"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
  setResultUsers: TStore["importAccountsStore"]["setResultUsers"];
  areCheckedUsersEmpty: TStore["importAccountsStore"]["areCheckedUsersEmpty"];

  cancelMigration: TStore["importAccountsStore"]["cancelMigration"];
  clearCheckedAccounts: TStore["importAccountsStore"]["clearCheckedAccounts"];
  setStep: TStore["importAccountsStore"]["setStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];

  cancelUploadDialogVisible: TStore["dialogsStore"]["cancelUploadDialogVisible"];
  setCancelUploadDialogVisible: TStore["dialogsStore"]["setCancelUploadDialogVisible"];

  totalUsedUsers: TStore["importAccountsStore"]["totalUsedUsers"];
  quota: TStore["importAccountsStore"]["quota"];
}

export interface AddEmailTableRowProps {
  t: TFunction;
  displayName: string;
  email: string;
  isChecked: boolean;
  toggleAccount: () => void;
  id: string;
  isEmailOpen: boolean;
  setOpenedEmailKey: React.Dispatch<React.SetStateAction<string>>;
}

export interface InjectedAddEmailTableRowProps extends AddEmailTableRowProps {
  changeEmail: TStore["importAccountsStore"]["changeEmail"];
}

export interface AddEmailRowContentProps {
  id: string;
  sectionWidth: number | undefined;
  displayName: string;
  email: string;
  emailInputRef: React.RefObject<HTMLDivElement | null>;
  emailTextRef: React.RefObject<HTMLSpanElement | null>;
  isChecked: boolean;
  isEmailOpen: boolean;
  setOpenedEmailKey: React.Dispatch<React.SetStateAction<string>>;
  setIsPrevEmailValid: React.Dispatch<React.SetStateAction<boolean>>;
  toggleAccount: () => void;
}

export interface InjectedAddEmailRowContentProps
  extends AddEmailRowContentProps {
  changeEmail: TStore["importAccountsStore"]["changeEmail"];
}

export interface TypeSelectProps {
  t: TTranslation;
}

export interface InjectedTypeSelectProps extends TypeSelectProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  decrementStep: TStore["importAccountsStore"]["decrementStep"];
  users: TStore["importAccountsStore"]["users"];
  searchValue: TStore["importAccountsStore"]["searchValue"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
  filteredUsers: TStore["importAccountsStore"]["filteredUsers"];
  cancelMigration: TStore["importAccountsStore"]["cancelMigration"];
  clearCheckedAccounts: TStore["importAccountsStore"]["clearCheckedAccounts"];
  setStep: TStore["importAccountsStore"]["setStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];

  cancelUploadDialogVisible: TStore["dialogsStore"]["cancelUploadDialogVisible"];
  setCancelUploadDialogVisible: TStore["dialogsStore"]["setCancelUploadDialogVisible"];
}

export interface InjectedTypeSelectTableProps extends AccountsTableProps {
  viewAs: TStore["setup"]["viewAs"];
  changeGroupType: TStore["importAccountsStore"]["changeGroupType"];
  UserTypes: TStore["importAccountsStore"]["UserTypes"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isOwner: TUser["isOwner"];
}

export interface TypeSelectTableViewProps {
  t: TFunction;
  sectionWidth?: number;
  accountsData: TEnhancedMigrationUser[];
  typeOptions: TOption[];
}
export interface InjectedTypeSelectTableViewProps
  extends TypeSelectTableViewProps {
  userId?: string;
  checkedUsers: TStore["importAccountsStore"]["checkedUsers"];
  toggleAccount: TStore["importAccountsStore"]["toggleAccount"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isAccountChecked: TStore["importAccountsStore"]["isAccountChecked"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
  filteredUsers: TStore["importAccountsStore"]["filteredUsers"];
}

export interface TypeSelectTableRowProps {
  id: string;
  displayName: string;
  email: string;
  typeOptions: TOption[];
  isChecked: boolean;
  type: string;
  toggleAccount: () => void;
}

export interface InjectedTypeSelectTableRowProps
  extends TypeSelectTableRowProps {
  changeUserType: TStore["importAccountsStore"]["changeUserType"];
}

export interface TypeSelectRowViewProps {
  t: TFunction;
  sectionWidth?: number;
  accountsData: TEnhancedMigrationUser[];
  typeOptions: TOption[];
}

export interface InjectedTypeSelectRowViewProps extends TypeSelectRowViewProps {
  filteredUsers: TStore["importAccountsStore"]["filteredUsers"];
  checkedUsers: TStore["importAccountsStore"]["checkedUsers"];
  toggleAccount: TStore["importAccountsStore"]["toggleAccount"];
  toggleAllAccounts: TStore["importAccountsStore"]["toggleAllAccounts"];
  isAccountChecked: TStore["importAccountsStore"]["isAccountChecked"];
  setSearchValue: TStore["importAccountsStore"]["setSearchValue"];
}

export interface TypeSelectUsersRowProps {
  data: TEnhancedMigrationUser;
  sectionWidth?: number;
  typeOptions: TOption[];
  isChecked: boolean;
  toggleAccount: () => void;
}

export interface TypeSelectRowContentProps {
  id: string;
  sectionWidth?: number;
  displayName: string;
  email: string;
  typeOptions: TOption[];
  roleSelectorRef: React.RefObject<HTMLDivElement | null>;
  type: string;
}

export interface InjectedTypeSelectRowContentProps
  extends TypeSelectRowContentProps {
  changeUserType: TStore["importAccountsStore"]["changeUserType"];
}

export interface AccountsPagingProps {
  t: TFunction;
  numberOfItems: number;
  setDataPortion: (leftBoundary: number, rightBoundary: number) => void;
  pagesPerPage?: number;
}

export interface ImportItemProps {
  sectionName: string;
  sectionIcon?: string;
  workspace: string;
  isChecked: boolean;
}

export interface ImportSectionProps {
  isDisabled: boolean;
  isChecked: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sectionName: string;
  description: string;
  exportSection: Omit<ImportItemProps, "isChecked">;
  importSection: Omit<ImportItemProps, "isChecked">;
  dataTestId?: string;
}

export interface NoEmailUsersProps {
  t: TFunction;
  users: number;
}

export interface UsersInfoBlockProps {
  quota?: { max: number };
  totalUsedUsers?: number;
  numberOfSelectedUsers?: number;
  totalUsers?: number;
}

type TExportDetails = { name: string; icon?: string };

export interface ImportStepProps {
  t: TFunction;
  serviceName: string;
  usersExportDetails: TExportDetails;
  personalExportDetails: TExportDetails;
  sharedFilesExportDetails: TExportDetails;
  sharedFoldersExportDetails: TExportDetails;
  hasCommonFiles?: boolean;
  hasProjectFiles?: boolean;
}

export interface InjectedImportStepProps extends ImportStepProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  decrementStep: TStore["importAccountsStore"]["decrementStep"];
  importOptions: TStore["importAccountsStore"]["importOptions"];
  setImportOptions: TStore["importAccountsStore"]["setImportOptions"];
  cancelMigration: TStore["importAccountsStore"]["cancelMigration"];
  clearCheckedAccounts: TStore["importAccountsStore"]["clearCheckedAccounts"];
  setStep: TStore["importAccountsStore"]["setStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];

  user: TStore["userStore"]["user"];

  cancelUploadDialogVisible: TStore["dialogsStore"]["cancelUploadDialogVisible"];
  setCancelUploadDialogVisible: TStore["dialogsStore"]["setCancelUploadDialogVisible"];
}

export interface ImportProcessingStepProps {
  t: TFunction;
  migratorName: TWorkspaceService;
}

export interface InjectedImportProcessingStepProps
  extends ImportProcessingStepProps {
  incrementStep: TStore["importAccountsStore"]["incrementStep"];
  setIsLoading: TStore["importAccountsStore"]["setIsLoading"];
  proceedFileMigration: TStore["importAccountsStore"]["proceedFileMigration"];
  getMigrationStatus: TStore["importAccountsStore"]["getMigrationStatus"];
}

export interface ImportCompleteStepProps {
  t: TFunction;
}

export interface InjectedImportCompleteStepProps
  extends ImportCompleteStepProps {
  getMigrationLog: TStore["importAccountsStore"]["getMigrationLog"];
  clearCheckedAccounts: TStore["importAccountsStore"]["clearCheckedAccounts"];
  sendWelcomeLetter: TStore["importAccountsStore"]["sendWelcomeLetter"];
  clearMigration: TStore["importAccountsStore"]["clearMigration"];
  getMigrationStatus: TStore["importAccountsStore"]["getMigrationStatus"];
  setStep: TStore["importAccountsStore"]["setStep"];
  setWorkspace: TStore["importAccountsStore"]["setWorkspace"];
  setMigratingWorkspace: TStore["importAccountsStore"]["setMigratingWorkspace"];
  setMigrationPhase: TStore["importAccountsStore"]["setMigrationPhase"];
}

export interface MigrationButtonsProps extends SaveCancelButtonProps {
  migrationCancelLabel: string;
  onMigrationCancelClick: () => void;
}
