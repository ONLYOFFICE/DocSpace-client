import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import Text from "@docspace/components/text";

import { Wrapper } from "../StyledStepper";

// import UsersInfoBlock from "../../../sub-components/UsersInfoBlock";
import { NoEmailUsersBlock } from "../../../sub-components/NoEmailUsersBlock";

// const LICENSE_LIMIT = 100;

const ThirdStep = (props) => {
  const {
    t,
    incrementStep,
    decrementStep,
    numberOfCheckedAccounts,
    users,
    searchValue,
    setSearchValue,
    setResultUsers,
    areCheckedUsersEmpty,
  } = props;

  const [dataPortion, setDataPortion] = useState(users.withoutEmail.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(users.withoutEmail.slice(leftBoundary, rightBoundary));
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

  const handleStepIncrement = () => {
    setResultUsers();
    incrementStep();
  };

  return (
    <Wrapper>
      {users.withoutEmail.length > 0 && (
        <NoEmailUsersBlock users={users.withoutEmail.length} t={t} />
      )}

      {users.withoutEmail.length > 0 ? (
        <>
          <SaveCancelButtons
            className="save-cancel-buttons"
            onSaveClick={handleStepIncrement}
            onCancelClick={decrementStep}
            saveButtonLabel={t("Settings:NextStep")}
            cancelButtonLabel={t("Common:Back")}
            showReminder
            displaySettings
            saveButtonDisabled={areCheckedUsersEmpty}
            // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
          />

          {/* <UsersInfoBlock
            t={t}
            selectedUsers={numberOfCheckedAccounts}
            totalUsers={users.withoutEmail.length}
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

          {users.withoutEmail.length > 25 && (
            <AccountsPaging
              t={t}
              numberOfItems={users.withoutEmail.length}
              setDataPortion={handleDataChange}
            />
          )}
        </>
      ) : (
        <Text fontWeight={600} lineHeight="20px" className="mb-17">
          {t("Settings:AddEmailsWarning")}
        </Text>
      )}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={handleStepIncrement}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
        saveButtonDisabled={areCheckedUsersEmpty}
        // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
      />
    </Wrapper>
  );
};

export default inject(({ setup, importAccountsStore }) => {
  const { viewAs } = setup;
  const {
    numberOfCheckedAccounts,
    searchValue,
    setSearchValue,
    users,
    setResultUsers,
    areCheckedUsersEmpty,
  } = importAccountsStore;

  return {
    viewAs,
    numberOfCheckedAccounts,
    searchValue,
    setSearchValue,
    users,
    setResultUsers,
    areCheckedUsersEmpty,
  };
})(observer(ThirdStep));
