import { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";
import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

import { Wrapper } from "../StyledStepper";

const FourthStep = (props) => {
  const { t, incrementStep, decrementStep, users, searchValue, setSearchValue } = props;

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
      />

      <SearchInput
        id="search-users-type-input"
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

      {filteredAccounts.length > 0 && (
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={incrementStep}
          onCancelClick={decrementStep}
          showReminder={true}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
      )}
    </Wrapper>
  );
};

export default inject(({ importAccountsStore }) => {
  const { checkedAccounts, users, searchValue, setSearchValue } = importAccountsStore;

  return {
    checkedAccounts,
    users,
    searchValue,
    setSearchValue,
  };
})(observer(FourthStep));
