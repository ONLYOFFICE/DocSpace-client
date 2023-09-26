import { useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

const StyledSearchInput = styled(SearchInput)`
  margin-top: 20px;
`;

const SelectUsersTypeStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  checkedAccounts,
  users,
  searchValue,
  setSearchValue,
}) => {
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
      />

      {!checkedAccounts.length > 0 && (
        <StyledSearchInput
          id="search-users-type-input"
          placeholder={t("Common:Search")}
          value={searchValue}
          onChange={onChangeInput}
          refreshTimeout={100}
          onClearSearch={onClearSearchInput}
        />
      )}

      <AccountsTable t={t} accountsData={filteredAccounts} />

      {users.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={users.length}
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
        />
      )}
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { checkedAccounts, users, searchValue, setSearchValue } =
    importAccountsStore;

  return {
    checkedAccounts,
    users,
    searchValue,
    setSearchValue,
  };
})(observer(SelectUsersTypeStep));
