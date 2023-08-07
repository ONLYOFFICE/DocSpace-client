import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";
import SearchInput from "@docspace/components/search-input";

import AccountsTable from "./AccountsTable";

import { Wrapper, UsersInfoBlock } from "../StyledStepper";

const ThirdStep = (props) => {
  const { t, incrementStep, decrementStep } = props;

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
      <UsersInfoBlock>
        <Text color="#555f65" fontWeight={700} className="selected-users-count">
          Selected: 0/10 users
        </Text>
        <Text color="#555f65" fontWeight={700} className="selected-admins-count">
          License limit Admins/Power: 0/100
        </Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={<Text>Insert tooltip content</Text>}
        />
      </UsersInfoBlock>

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
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        showReminder
        displaySettings
      />
    </Wrapper>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(ThirdStep));
