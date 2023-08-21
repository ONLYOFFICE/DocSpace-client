import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

import { Wrapper } from "../StyledStepper";

import UsersInfoBlock from "../../../sub-components/UsersInfoBlock";

import { mockData } from "./mockData";

const ThirdStep = (props) => {
  const { t, incrementStep, decrementStep, numberOfCheckedAccounts } = props;

  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(mockData.slice(leftBoundary, rightBoundary));
  };

  return (
    <Wrapper>
      <p className="users-without-email">
        We found <b>6 users</b> without emails. You can add necessary data to their accounts on the
        next step.
      </p>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
      />

      <UsersInfoBlock
        t={t}
        selectedUsers={numberOfCheckedAccounts}
        totalUsers={mockData.length}
        totalLicenceLimit={100}
        licencelimit={10}
      />

      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />

      <AccountsTable accountsData={dataPortion} />

      {mockData.length > 25 && (
        <AccountsPaging t={t} numberOfItems={mockData.length} setDataPortion={handleDataChange} />
      )}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
      />
    </Wrapper>
  );
};

export default inject(({ setup, importAccountsStore }) => {
  const { viewAs } = setup;
  const { numberOfCheckedAccounts } = importAccountsStore;

  return {
    viewAs,
    numberOfCheckedAccounts,
  };
})(observer(ThirdStep));
