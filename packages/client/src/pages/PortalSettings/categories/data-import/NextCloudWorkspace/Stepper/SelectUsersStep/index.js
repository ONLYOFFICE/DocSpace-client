// (c) Copyright Ascensio System SIA 2010-2024
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

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

// import UsersInfoBlock from "../../../sub-components/UsersInfoBlock";
import { Wrapper } from "../StyledStepper";
import { NoEmailUsersBlock } from "../../../sub-components/NoEmailUsersBlock";

// const LICENSE_LIMIT = 100;

const SelectUsersStep = (props) => {
  const {
    t,
    incrementStep,
    decrementStep,
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
    areCheckedUsersEmpty,
  } = props;

  const [dataPortion, setDataPortion] = useState(withEmailUsers.slice(0, 25));

  useEffect(() => {
    setSearchValue("");
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
      data.displayName.toLowerCase().startsWith(searchValue.toLowerCase()) ||
      data.email.toLowerCase().startsWith(searchValue.toLowerCase()),
  );

  const goBack = () => {
    cancelMigration();
    setTimeout(decrementStep, 100);
  };

  return (
    <Wrapper>
      {withEmailUsers.length > 0 && (
        <NoEmailUsersBlock users={users.withoutEmail.length} t={t} />
      )}

      {withEmailUsers.length > 0 ? (
        <>
          <SaveCancelButtons
            className="save-cancel-buttons"
            onSaveClick={incrementStep}
            onCancelClick={goBack}
            saveButtonLabel={t("Settings:NextStep")}
            cancelButtonLabel={t("Common:Back")}
            showReminder
            displaySettings
            saveButtonDisabled={areCheckedUsersEmpty}
          />

          {/* <UsersInfoBlock
            t={t}
            selectedUsers={numberOfCheckedAccounts}
            totalUsers={users.length}
            totalLicenceLimit={LICENSE_LIMIT}
          /> */}

          <SearchInput
            id="search-users-input"
            placeholder={t("Common:Search")}
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
        </>
      ) : (
        <Text fontWeight={600} lineHeight="20px" className="mb-17">
          {t("Settings:AddEmailsWarning")}
        </Text>
      )}

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={incrementStep}
          onCancelClick={goBack}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          showReminder
          displaySettings
          saveButtonDisabled={areCheckedUsersEmpty}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
    areCheckedUsersEmpty,
  } = importAccountsStore;

  return {
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
    areCheckedUsersEmpty,
  };
})(observer(SelectUsersStep));
