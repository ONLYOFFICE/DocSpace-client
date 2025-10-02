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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { TFunction } from "i18next";

import { SearchInput } from "@docspace/shared/components/search-input";
import { Text } from "@docspace/shared/components/text";

import { InputSize } from "@docspace/shared/components/text-input";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { searchMigrationUsers } from "SRC_DIR/pages/PortalSettings/utils/importUtils";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../sub-components/AccountsPaging";

import { Wrapper } from "../../StyledDataImport";

import {
  SelectUsersStepProps,
  InjectedSelectUsersStepProps,
} from "../../types";
import { MigrationButtons } from "../../sub-components/MigrationButtons";
import UsersInfoBlock from "../../sub-components/UsersInfoBlock";

const REFRESH_TIMEOUT = 100;
const PAGE_SIZE = 25;

const SelectUsersStep = (props: SelectUsersStepProps) => {
  const {
    canDisable,
    shouldSetUsers,

    t,
    incrementStep,
    decrementStep,
    withEmailUsers,
    searchValue,
    setSearchValue,
    areCheckedUsersEmpty,
    setResultUsers,
    cancelMigration,
    clearCheckedAccounts,
    setStep,
    setWorkspace,
    setMigratingWorkspace,
    setMigrationPhase,

    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
    selectedWithEmail,
  } = props as InjectedSelectUsersStepProps;

  const [dataPortion, setDataPortion] = useState(
    withEmailUsers.slice(0, PAGE_SIZE),
  );

  useEffect(() => {
    setSearchValue("");
  }, [setSearchValue]);

  const handleDataChange = (leftBoundary: number, rightBoundary: number) => {
    setDataPortion(withEmailUsers.slice(leftBoundary, rightBoundary));
  };

  const onChangeInput = (value: string) => {
    setSearchValue(value);
  };

  const onClearSearchInput = () => {
    setSearchValue("");
  };

  const filteredAccounts = searchMigrationUsers(dataPortion, searchValue);

  const handleStepIncrement = shouldSetUsers
    ? () => {
        setResultUsers();
        incrementStep();
      }
    : incrementStep;

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
      saveButtonDisabled={canDisable ? areCheckedUsersEmpty : false}
      migrationCancelLabel={t("Settings:CancelImport")}
      onMigrationCancelClick={showCancelDialog}
    />
  );

  return (
    <Wrapper>
      {withEmailUsers.length > 0 ? (
        <>
          {Buttons}

          <UsersInfoBlock
            selectedUsers={selectedWithEmail}
            totalUsers={withEmailUsers.length}
          />

          <SearchInput
            id="search-users-input"
            placeholder={t("Common:Search")}
            value={searchValue}
            onChange={onChangeInput}
            refreshTimeout={REFRESH_TIMEOUT}
            onClearSearch={onClearSearchInput}
            size={InputSize.base}
            dataTestId="search_users_input"
          />

          <AccountsTable t={t as TFunction} accountsData={filteredAccounts} />

          {withEmailUsers.length > PAGE_SIZE && filteredAccounts.length > 0 ? (
            <AccountsPaging
              t={t as TFunction}
              numberOfItems={withEmailUsers.length}
              setDataPortion={handleDataChange}
              pagesPerPage={PAGE_SIZE}
            />
          ) : null}
        </>
      ) : (
        <>
          <Text fontWeight={600} lineHeight="20px" className="mb-17">
            {t("Settings:AddEmailsWarning")}
          </Text>
          {Buttons}
        </>
      )}

      {filteredAccounts.length > 0 ? Buttons : null}

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

export default inject<TStore>(({ importAccountsStore, dialogsStore }) => {
  const {
    incrementStep,
    decrementStep,
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
    checkedUsers,
    areCheckedUsersEmpty,
    setResultUsers,
    clearCheckedAccounts,
    setStep,
    setWorkspace,
    setMigratingWorkspace,
    setMigrationPhase,
    selectedWithEmail,
  } = importAccountsStore;
  const { cancelUploadDialogVisible, setCancelUploadDialogVisible } =
    dialogsStore;

  return {
    incrementStep,
    decrementStep,
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
    checkedUsers,
    areCheckedUsersEmpty,
    setResultUsers,
    clearCheckedAccounts,
    setStep,
    setWorkspace,
    setMigratingWorkspace,
    setMigrationPhase,

    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
    selectedWithEmail,
  };
})(observer(SelectUsersStep));
