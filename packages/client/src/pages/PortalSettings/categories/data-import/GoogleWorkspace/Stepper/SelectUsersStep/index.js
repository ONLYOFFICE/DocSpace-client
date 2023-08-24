import { useState } from "react";
import { mockData } from "../mockData.js";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";
import UsersInfoBlock from "./../../../sub-components/UsersInfoBlock";

const SelectUsersStep = ({ t, onNextStep, onPrevStep, showReminder }) => {
  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));

  const selectedUsers = 0;
  const totalUsers = 10;
  const licencelimit = 0;
  const totalLicenceLimit = 100;

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

      <UsersInfoBlock
        t={t}
        selectedUsers={selectedUsers}
        totalUsers={totalUsers}
        licencelimit={licencelimit}
        totalLicenceLimit={totalLicenceLimit}
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

export default SelectUsersStep;
