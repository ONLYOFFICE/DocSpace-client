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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { SearchInput } from "@docspace/shared/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import UsersInfoBlock from "./../../../sub-components/UsersInfoBlock";

import { parseQuota } from "../../../utils";

const SelectUsersStep = ({
  t,
  onNextStep,
  onPrevStep,
  withEmailUsers,
  searchValue,
  setSearchValue,
  setResultUsers,
  areCheckedUsersEmpty,
  cancelMigration,
  checkedUsers,
  quotaCharacteristics,
}) => {
  const [dataPortion, setDataPortion] = useState(withEmailUsers.slice(0, 25));
  const [quota, setQuota] = useState({ used: 0, max: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSearchValue("");
    setQuota(parseQuota(quotaCharacteristics[1]));
  }, []);

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(withEmailUsers.slice(leftBoundary, rightBoundary));
  };

  const onChangeInput = (value) => {
    setSearchValue(value);
  };

  const onClearSearchInput = () => {
    setSearchValue("");
  };

  const filteredAccounts = dataPortion.filter(
    (data) =>
      data.firstName?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      data.lastName?.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      data.email?.toLowerCase().startsWith(searchValue.toLowerCase()),
  );

  const handleStepIncrement = () => {
    setResultUsers();
    onNextStep();
  };

  const goBack = () => {
    cancelMigration();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onPrevStep();
    }, 1000);
  };

  const totalUsedUsers =
    quota.used +
    checkedUsers.withEmail.filter((user) => !user.isDuplicate).length;

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={handleStepIncrement}
        onCancelClick={goBack}
        showReminder
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
        saveButtonDisabled={
          areCheckedUsersEmpty || (quota.max && totalUsedUsers > quota.max)
        }
        isSaving={isSaving}
      />

      {quota.max && (
        <UsersInfoBlock
          t={t}
          totalUsedUsers={totalUsedUsers}
          selectedUsers={checkedUsers.withEmail.length}
          totalUsers={withEmailUsers.length}
          totalLicenceLimit={quota.max}
        />
      )}

      <SearchInput
        id="search-withEmailUsers-input"
        placeholder={t("Common:Search")}
        style={{ marginTop: "16px" }}
        value={searchValue}
        onChange={onChangeInput}
        refreshTimeout={100}
        onClearSearch={onClearSearchInput}
      />

      <AccountsTable t={t} accountsData={filteredAccounts} />

      {withEmailUsers.length > 25 && filteredAccounts.length > 0 && (
        <AccountsPaging
          t={t}
          numberOfItems={withEmailUsers.length}
          setDataPortion={handleDataChange}
        />
      )}

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={handleStepIncrement}
          onCancelClick={goBack}
          showReminder
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
          saveButtonDisabled={
            areCheckedUsersEmpty || (quota.max && totalUsedUsers > quota.max)
          }
          isSaving={isSaving}
        />
      )}
    </>
  );
};

export default inject(({ importAccountsStore, currentQuotaStore }) => {
  const {
    withEmailUsers,
    searchValue,
    setSearchValue,
    areCheckedUsersEmpty,
    setResultUsers,
    cancelMigration,
    checkedUsers,
  } = importAccountsStore;
  const { quotaCharacteristics } = currentQuotaStore;

  return {
    withEmailUsers,
    searchValue,
    setSearchValue,
    areCheckedUsersEmpty,
    setResultUsers,
    cancelMigration,
    checkedUsers,
    quotaCharacteristics,
  };
})(observer(SelectUsersStep));
