import { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
// import UsersInfoBlock from "../../../sub-components/UsersInfoBlock";
import Text from "@docspace/components/text";

import { Wrapper } from "../StyledStepper";
import { NoEmailUsersBlock } from "../../../sub-components/NoEmailUsersBlock";

// const LICENSE_LIMIT = 100;

const SecondStep = (props) => {
  const {
    t,
    incrementStep,
    decrementStep,
    numberOfCheckedAccounts,
    users,
    searchValue,
    setSearchValue,
    assignCheckedUsers,
  } = props;

  const [dataPortion, setDataPortion] = useState(users.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(users.slice(leftBoundary, rightBoundary));
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

  const handleStepInrement = () => {
    assignCheckedUsers();
    incrementStep();
  };

  return (
    <Wrapper>
      {users.length > 0 && <NoEmailUsersBlock users={users.length} t={t} />}

      {users.length > 0 ? (
        <>
          <SaveCancelButtons
            className="save-cancel-buttons"
            onSaveClick={handleStepInrement}
            onCancelClick={decrementStep}
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

          {users.length > 25 && (
            <AccountsPaging t={t} numberOfItems={users.length} setDataPortion={handleDataChange} />
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
          onSaveClick={handleStepInrement}
          onCancelClick={decrementStep}
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
  const { numberOfCheckedAccounts, users, searchValue, setSearchValue, assignCheckedUsers } =
    importAccountsStore;

  return {
    numberOfCheckedAccounts,
    users,
    searchValue,
    setSearchValue,
    assignCheckedUsers,
  };
})(observer(SecondStep));
