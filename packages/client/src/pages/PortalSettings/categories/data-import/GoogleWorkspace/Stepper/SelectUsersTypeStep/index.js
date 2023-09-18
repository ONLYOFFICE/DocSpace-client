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
}) => {
  const [dataPortion, setDataPortion] = useState(users.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(users.slice(leftBoundary, rightBoundary));
  };

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
          onChange={() => console.log("changed")}
          onClearSearch={() => console.log("cleared")}
        />
      )}

      <AccountsTable t={t} accountsData={dataPortion} />

      {users.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={users.length}
          setDataPortion={handleDataChange}
        />
      )}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStep}
        onCancelClick={onPrevStep}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { checkedAccounts, users } = importAccountsStore;

  return {
    checkedAccounts,
    users,
  };
})(observer(SelectUsersTypeStep));
