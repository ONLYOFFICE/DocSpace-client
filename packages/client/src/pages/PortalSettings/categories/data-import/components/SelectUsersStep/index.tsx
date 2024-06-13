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
import { Text } from "@docspace/shared/components/text";

import { InputSize } from "@docspace/shared/components/text-input";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../sub-components/AccountsPaging";

import UsersInfoBlock from "../../sub-components/UsersInfoBlock";
import { Wrapper } from "../../StyledDataImport";

import { parseQuota } from "../../utils";

import {
  SelectUsersStepProps,
  InjectedSelectUsersStepProps,
} from "../../types";

const REFRESH_TIMEOUT = 100;
const PAGING_BREAKPOINT = 25;

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
    checkedUsers,
    users,
    areCheckedUsersEmpty,
    setResultUsers,

    quotaCharacteristics,
  } = props as InjectedSelectUsersStepProps;

  const [dataPortion, setDataPortion] = useState(withEmailUsers.slice(0, 25));
  const [quota, setQuota] = useState<{
    used: number;
    max: number | null;
  }>({
    used: 0,
    max: 0,
  });

  useEffect(() => {
    setSearchValue("");
    setQuota(parseQuota(quotaCharacteristics[1]));
  }, [quotaCharacteristics, setSearchValue]);

  const handleDataChange = (leftBoundary: number, rightBoundary: number) => {
    setDataPortion(withEmailUsers.slice(leftBoundary, rightBoundary));
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

  const numberOfSelectedUsers =
    checkedUsers.withEmail.length + checkedUsers.withoutEmail.length;

  const totalUsedUsers =
    quota.used +
    checkedUsers.withEmail.filter((user) => !user.isDuplicate).length +
    checkedUsers.withoutEmail.length;

  const handleStepIncrement = shouldSetUsers
    ? () => {
        setResultUsers();
        incrementStep();
      }
    : incrementStep;

  const Buttons = (
    <SaveCancelButtons
      className="save-cancel-buttons"
      onSaveClick={handleStepIncrement}
      onCancelClick={decrementStep}
      saveButtonLabel={t("Settings:NextStep")}
      cancelButtonLabel={t("Common:Back")}
      showReminder
      displaySettings
      saveButtonDisabled={
        canDisable &&
        (areCheckedUsersEmpty ||
          (quota.max ? totalUsedUsers > quota.max : false))
      }
    />
  );

  return (
    <Wrapper>
      {withEmailUsers.length > 0 ? (
        <>
          {Buttons}

          {quota.max && (
            <UsersInfoBlock
              t={t}
              totalUsedUsers={totalUsedUsers}
              selectedUsers={numberOfSelectedUsers}
              totalUsers={withEmailUsers.length + users.withoutEmail.length}
              totalLicenceLimit={quota.max}
            />
          )}

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

          {withEmailUsers.length > PAGING_BREAKPOINT &&
            filteredAccounts.length > 0 && (
              <AccountsPaging
                t={t}
                numberOfItems={withEmailUsers.length}
                setDataPortion={handleDataChange}
              />
            )}
        </>
      ) : (
        <Text fontWeight={600} lineHeight="20px" className="mb-17">
          {t("Settings:AddEmailsWarning")}
        </Text>
      )}

      {filteredAccounts.length > 0 && Buttons}
    </Wrapper>
  );
};

export default inject<TStore>(({ importAccountsStore, currentQuotaStore }) => {
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
  } = importAccountsStore;

  const { quotaCharacteristics } = currentQuotaStore;

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

    quotaCharacteristics,
  };
})(observer(SelectUsersStep));
