import { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
// import UsersInfoBlock from "./../../../sub-components/UsersInfoBlock";

// const LICENSE_LIMIT = 100;

const SelectUsersStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  withEmailUsers,
  searchValue,
  setSearchValue,
}) => {
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
      data.email.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
        // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
      />

      {/* <UsersInfoBlock
        t={t}
        selectedUsers={100}
        totalUsers={withEmailUsers.length}
        totalLicenceLimit={LICENSE_LIMIT}
      /> */}

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

      {withEmailUsers.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={withEmailUsers.length}
          setDataPortion={handleDataChange}
        />
      )}

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStep}
          onCancelClick={onPrevStep}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
          // saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
        />
      )}
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    numberOfCheckedAccounts,
    withEmailUsers,
    searchValue,
    setSearchValue,
  } = importAccountsStore;

  return {
    withEmailUsers,
    searchValue,
    setSearchValue,
    numberOfCheckedAccounts,
  };
})(observer(SelectUsersStep));
