import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";

import AccountsTable from "./AccountsTable";

import SearchInput from "@docspace/components/search-input";

import { Wrapper, UsersInfoBlock } from "../StyledStepper";

import Paging from "@docspace/components/paging";

const SecondStep = (props) => {
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
        <Text color="#555f65" fontSize="14px" fontWeight={700} className="selected-users-count">
          Selected: 0/10 users
        </Text>
        <Text color="#555f65" fontSize="14px" fontWeight={700} className="selected-admins-count">
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

      {/* <Paging
        previousLabel="Previous"
        nextLabel="Next"
        displayItems={true}
        displayCount={true}
        disablePrevious={false}
        disableNext={false}
        openDirection="bottom"
        selectedCount={100}
        pageCount={10}
        selectedCountItem={{
          key: 100,
          label: "100 per page",
        }}
        selectedPageItem={{ key: 1, label: "1 of 10" }}
        style={{ justifyContent: "center", alignItems: "center" }}
      /> */}

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
})(observer(SecondStep));
