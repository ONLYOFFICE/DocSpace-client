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
import { inject, observer } from "mobx-react";

import { SearchInput } from "@docspace/shared/components/search-input";

import { Text } from "@docspace/shared/components/text";
import { InputSize } from "@docspace/shared/components/text-input";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../sub-components/AccountsPaging";
import { Wrapper } from "../../StyledDataImport";
import { NoEmailUsersBlock } from "../../sub-components/NoEmailUsersBlock";
import { AddEmailsStepProps, InjectedAddEmailsStepProps } from "../../types";
import { MigrationButtons } from "../../sub-components/MigrationButtons";
import UsersInfoBlock from "../../sub-components/UsersInfoBlock";

const PAGE_SIZE = 25;
const REFRESH_TIMEOUT = 100;

const AddEmailsStep = (props: AddEmailsStepProps) => {
  const {
    t,
    incrementStep,
    decrementStep,
    users,
    searchValue,
    setSearchValue,
    setResultUsers,
    areCheckedUsersEmpty,
    cancelMigration,
    clearCheckedAccounts,
    setStep,
    setWorkspace,
    setMigratingWorkspace,
    setMigrationPhase,
    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
    totalUsedUsers,
    quota,
  } = props as InjectedAddEmailsStepProps;

  const [dataPortion, setDataPortion] = useState(
    users.withoutEmail.slice(0, PAGE_SIZE),
  );

  const handleDataChange = (leftBoundary: number, rightBoundary: number) => {
    setDataPortion(users.withoutEmail.slice(leftBoundary, rightBoundary));
  };

  const onChangeInput = (value: string) => {
    setSearchValue(value);
  };

  const onClearSearchInput = () => {
    setSearchValue("");
  };

  const filteredAccounts = dataPortion.filter(
    (data) =>
      data.firstName?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      data.displayName?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      data.email?.toLowerCase().startsWith(searchValue.toLowerCase()),
  );

  const handleStepIncrement = () => {
    setResultUsers();
    incrementStep();
  };

  useEffect(() => {
    setSearchValue("");
  }, [setSearchValue]);

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

  const Buttons = (
    <MigrationButtons
      className="save-cancel-buttons"
      onSaveClick={handleStepIncrement}
      onCancelClick={decrementStep}
      saveButtonLabel={t("Settings:NextStep")}
      cancelButtonLabel={t("Common:Back")}
      showReminder
      displaySettings
      saveButtonDisabled={
        areCheckedUsersEmpty || (quota.max ? totalUsedUsers > quota.max : false)
      }
      migrationCancelLabel={t("Settings:CancelImport")}
      onMigrationCancelClick={showCancelDialog}
    />
  );

  return (
    <Wrapper>
      {users.withoutEmail.length > 0 && (
        <NoEmailUsersBlock t={t} users={users.withoutEmail.length} />
      )}

      {users.withoutEmail.length > 0 ? (
        <>
          {Buttons}

          <UsersInfoBlock />

          <SearchInput
            id="search-users-input"
            placeholder={t("Common:Search")}
            value={searchValue}
            onChange={onChangeInput}
            refreshTimeout={REFRESH_TIMEOUT}
            onClearSearch={onClearSearchInput}
            size={InputSize.base}
          />

          <AccountsTable t={t} accountsData={filteredAccounts} />

          {users.withoutEmail.length > PAGE_SIZE && (
            <AccountsPaging
              t={t}
              numberOfItems={users.withoutEmail.length}
              setDataPortion={handleDataChange}
              pagesPerPage={PAGE_SIZE}
            />
          )}
        </>
      ) : (
        <>
          <Text fontWeight={600} lineHeight="20px" className="mb-17">
            {t("Settings:WithoutEmailHint")}
          </Text>
          {Buttons}
        </>
      )}

      {filteredAccounts.length > 0 && Buttons}

      {cancelUploadDialogVisible && (
        <CancelUploadDialog
          visible={cancelUploadDialogVisible}
          onClose={hideCancelDialog}
          cancelMigration={onCancelMigration}
          loading={false}
          isFifthStep={false}
          isSixthStep={false}
        />
      )}
    </Wrapper>
  );
};

export default inject<TStore>(
  ({ importAccountsStore, currentQuotaStore, dialogsStore }) => {
    const {
      incrementStep,
      decrementStep,
      searchValue,
      setSearchValue,
      users,
      setResultUsers,
      areCheckedUsersEmpty,

      cancelMigration,
      clearCheckedAccounts,
      setStep,
      setWorkspace,
      setMigratingWorkspace,
      setMigrationPhase,
      totalUsedUsers,
      quota,
    } = importAccountsStore;

    const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
      dialogsStore;

    return {
      incrementStep,
      decrementStep,
      searchValue,
      setSearchValue,
      users,
      setResultUsers,
      areCheckedUsersEmpty,

      cancelMigration,
      clearCheckedAccounts,
      setStep,
      setWorkspace,
      setMigratingWorkspace,
      setMigrationPhase,

      cancelUploadDialogVisible,
      setCancelUploadDialogVisible,
      totalUsedUsers,
      quota,
    };
  },
)(observer(AddEmailsStep));
