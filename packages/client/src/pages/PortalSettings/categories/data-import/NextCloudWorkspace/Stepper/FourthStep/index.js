import React, { useState } from "react";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";
import AccountsPaging from "../../../sub-components/AccountsPaging";

import { Wrapper } from "../StyledStepper";

import { mockData } from "./mockData";

const FourthStep = (props) => {
  const { t, incrementStep, decrementStep } = props;

  const [dataPortion, setDataPortion] = useState(mockData.slice(0, 25));

  const handleDataChange = (leftBoundary, rightBoundary) => {
    setDataPortion(mockData.slice(leftBoundary, rightBoundary));
  };

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
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder={t("Common:Search")}
      />
      <AccountsTable t={t} accountsData={dataPortion} />

      {mockData.length > 25 && (
        <AccountsPaging t={t} numberOfItems={mockData.length} setDataPortion={handleDataChange} />
      )}

      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        showReminder={true}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </Wrapper>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(FourthStep));
