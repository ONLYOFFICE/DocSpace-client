import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";

import TableView from "./TableView";
import RowView from "./RowView";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  max-width: 660px;
  background: #f8f9f9;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  .selected-users-count {
    margin-right: 24px;
    color: #555f65;
    font-weight: 700;
  }

  .selected-admins-count {
    margin-right: 8px;
    color: #555f65;
    font-weight: 700;
  }
`;

const SecondStep = (props) => {
  const { t, incrementStep, decrementStep, viewAs } = props;

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        showReminder={true}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
      <Wrapper>
        <Text className="selected-users-count">Selected: 0/10 users</Text>
        <Text className="selected-admins-count">License limit Admins/Power: 0/100</Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={<Text fontSize="13px">Paste you tooltip content here</Text>}
        />
      </Wrapper>

      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView sectionWidth={context.sectionWidth} />
          ) : (
            <RowView sectionWidth={context.sectionWidth} />
          )
        }
      </Consumer>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={incrementStep}
        onCancelClick={decrementStep}
        showReminder={true}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
    </>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(SecondStep));
