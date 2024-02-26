import { useState } from "react";
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
  } = props;

  const [dataPortion, setDataPortion] = useState(withEmailUsers.slice(0, 25));

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
    decrementStep();
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
            // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
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
          // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
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
  } = importAccountsStore;

  return {
    users,
    withEmailUsers,
    searchValue,
    setSearchValue,
    cancelMigration,
  };
})(observer(SelectUsersStep));
