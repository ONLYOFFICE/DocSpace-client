import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import Text from "@docspace/components/text";

import SearchInput from "@docspace/components/search-input";

import { Wrapper } from "../StyledStepper";

import UsersInfoBlock from "../../../sub-components/UsersInfoBlock";

import { mockData as nextStepData } from "../ThirdStep/mockData";
import { mockData } from "./mockData";
import { NoEmailUsersBlock } from "../../../sub-components/NoEmailUsersBlock";

const LICENSE_LIMIT = 100;

const SecondStep = (props) => {
  const { t, incrementStep, decrementStep, numberOfCheckedAccounts } = props;

  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(mockData.slice(leftBoundary, rightBoundary));
  };

  const users = `${nextStepData.length} ${t("Settings:Employees")}`;

  return (
    <Wrapper>
      {nextStepData.length > 0 && <NoEmailUsersBlock users={users} t={t} />}

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
            saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
          />

          <UsersInfoBlock
            t={t}
            selectedUsers={numberOfCheckedAccounts}
            totalUsers={mockData.length}
            totalLicenceLimit={LICENSE_LIMIT}
          />

          <SearchInput
            id="search-users-input"
            onChange={() => console.log("changed")}
            onClearSearch={() => console.log("cleared")}
            placeholder="Search"
          />

          <AccountsTable accountsData={dataPortion} t={t} />

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
          {t("Settings:AddEmailsWarning")}
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
        saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
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
})(observer(SecondStep));
