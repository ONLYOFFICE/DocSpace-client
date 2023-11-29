import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

import { Wrapper } from "../StyledStepper";

const FourthStep = (props) => {
  const { t, incrementStep, decrementStep, checkedUsers, users, searchValue, setSearchValue } =
    props;

  const [boundaries, setBoundaries] = useState([0, 25]);
  const [dataPortion, setDataPortion] = useState(users.result.slice(...boundaries));

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
    <Wrapper>
      <SaveCancelButtons
        className="save-cancel-buttons upper-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        showReminder={true}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
        saveButtonDisabled={checkedUsers.result.length === 0}
      />

      <SearchInput
        id="search-checkedUsers-type-input"
        className="importUsersSearch"
        placeholder={t("Common:Search")}
        value={searchValue}
        onChange={onChangeInput}
        refreshTimeout={100}
        onClearSearch={onClearSearchInput}
      />

      <AccountsTable t={t} accountsData={filteredAccounts} />

      {users.result.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={users.result.length}
          setDataPortion={handleDataChange}
        />
      )}

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={incrementStep}
          onCancelClick={decrementStep}
          showReminder={true}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
          saveButtonDisabled={checkedUsers.result.length === 0}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const { checkedUsers, users, searchValue, setSearchValue } = importAccountsStore;

  return {
    checkedUsers,
    users,
    searchValue,
    setSearchValue,
  };
})(observer(FourthStep));
