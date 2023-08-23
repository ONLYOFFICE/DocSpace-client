import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import Text from "@docspace/components/text";

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
      {mockData.length > 0 && (
        <p className="users-without-email">
          We found <b>{mockData.length} users</b> without emails. You can add necessary data to
          their accounts on the next step.
        </p>
      )}

      {mockData.length > 0 ? (
        <>
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
          />

          <SearchInput
            id="search-users-input"
            onChange={() => console.log("changed")}
            onClearSearch={() => console.log("cleared")}
            placeholder="Search"
          />

          <AccountsTable accountsData={dataPortion} />

          {mockData.length > 25 && (
            <AccountsPaging
              t={t}
              numberOfItems={mockData.length}
              setDataPortion={handleDataChange}
            />
          )}
        </>
      ) : (
        <Text fontWeight={600} lineHeight="20px" className="mb-17">
          You don’t have users with emails. Please proceed to the next step to add them.
        </Text>
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
