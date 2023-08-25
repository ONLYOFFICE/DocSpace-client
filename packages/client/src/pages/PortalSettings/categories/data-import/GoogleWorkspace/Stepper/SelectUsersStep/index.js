import { useState } from "react";
import { inject, observer } from "mobx-react";
import { mockData } from "../mockData.js";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import UsersInfoBlock from "./../../../sub-components/UsersInfoBlock";

const LICENSE_LIMIT = 100;

const SelectUsersStep = ({
  t,
  onNextStep,
  onPrevStep,
  showReminder,
  numberOfCheckedAccounts,
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
        placeholder={t("Common:Search")}
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
      />

      <AccountsTable t={t} accountsData={dataPortion} />

      {mockData.length > 25 && (
        <AccountsPaging
          t={t}
          numberOfItems={mockData.length}
          setDataPortion={handleDataChange}
        />
      )}
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { numberOfCheckedAccounts } = importAccountsStore;

  return {
    numberOfCheckedAccounts,
  };
})(observer(SelectUsersStep));
