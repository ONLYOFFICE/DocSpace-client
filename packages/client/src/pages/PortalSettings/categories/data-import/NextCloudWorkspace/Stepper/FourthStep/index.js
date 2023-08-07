import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";

import { Wrapper } from "../StyledStepper";

const FourthStep = (props) => {
  const { t, incrementStep, decrementStep } = props;

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
        placeholder="Search"
      />
      <AccountsTable />
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
