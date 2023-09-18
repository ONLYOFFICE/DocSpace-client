import { useState } from "react";
import { inject, observer } from "mobx-react";

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
        saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
      />

      <UsersInfoBlock
        t={t}
        selectedUsers={numberOfCheckedAccounts}
        totalUsers={users.length}
        totalLicenceLimit={LICENSE_LIMIT}
      />

      <SearchInput
        id="search-users-input"
        placeholder={t("Common:Search")}
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
      />

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
        saveButtonDisabled={numberOfCheckedAccounts > LICENSE_LIMIT}
      />
    </>
  );
};

export default inject(({ importAccountsStore }) => {
  const { numberOfCheckedAccounts, users } = importAccountsStore;

  return {
    users,
    numberOfCheckedAccounts,
  };
})(observer(SelectUsersStep));
