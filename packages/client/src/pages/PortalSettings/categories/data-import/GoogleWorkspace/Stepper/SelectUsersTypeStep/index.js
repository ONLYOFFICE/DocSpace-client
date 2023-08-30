import { useState } from "react";
import { inject, observer } from "mobx-react";
import { mockData } from "../mockData.js";
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
}) => {
  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(mockData.slice(leftBoundary, rightBoundary));
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

      {mockData.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={mockData.length}
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
  const { checkedAccounts } = importAccountsStore;

  return {
    checkedAccounts,
  };
})(observer(SelectUsersTypeStep));
