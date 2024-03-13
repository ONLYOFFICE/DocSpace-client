import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { SearchInput } from "@docspace/shared/components/search-input";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

const SelectUsersTypeStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  users,
  checkedUsers,
  searchValue,
  setSearchValue,
}) => {
  const [boundaries, setBoundaries] = useState([0, 25]);
  const [dataPortion, setDataPortion] = useState(
    users.result.slice(...boundaries),
  );

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setBoundaries([leftBoundary, rightBoundary]);
    setDataPortion(users.result.slice(leftBoundary, rightBoundary));
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

  useEffect(() => {
    setDataPortion(users.result.slice(...boundaries));
  }, [users]);

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons upper-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        showReminder
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings
      />

      <SearchInput
        id="search-users-type-input"
        placeholder={t("Common:Search")}
        style={{ marginTop: "20px" }}
        value={searchValue}
        onChange={onChangeInput}
        refreshTimeout={100}
        onClearSearch={onClearSearchInput}
      />

      <AccountsTable t={t} accountsData={filteredAccounts} />

      {users.result.length > 25 && filteredAccounts.length > 0 && (
        <AccountsPaging
          t={t}
          numberOfItems={users.result.length}
          setDataPortion={handleDataChange}
        />
      )}

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={onNextStep}
          onCancelClick={onPrevStep}
          showReminder
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings
        />
      )}
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { users, checkedUsers, searchValue, setSearchValue } =
    importAccountsStore;

  return {
    users,
    checkedUsers,
    searchValue,
    setSearchValue,
  };
})(observer(SelectUsersTypeStep));
