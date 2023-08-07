import { useState } from "react";
import { inject, observer } from "mobx-react";
import { Consumer } from "@docspace/components/utils/context";
import styled from "styled-components";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import HelpButton from "@docspace/components/help-button";

import TableView from "./TableView";
import RowView from "./RowView";

const StyledText = styled(Text)`
  color: #f21c0e;
  margin-top: 16px;
  font-size: 12px;
  font-weight: 600;
`;

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
  const { t, onNextStepClick, onPrevStepClick, viewAs, showReminder } = props;
  const [isExceeded, setIsExceeded] = useState(false);
  const selectedUsers = 0;
  const totalUsers = 10;
  const licencelimit = 0;
  const totalLicenceLimit = 100;

  return (
    <>
      <SaveCancelButtons
        className="save-cancel-buttons"
        onSaveClick={onNextStepClick}
        onCancelClick={onPrevStepClick}
        showReminder={showReminder}
        saveButtonLabel={t("Settings:NextStep")}
        cancelButtonLabel={t("Common:Back")}
        displaySettings={true}
      />
      {isExceeded && <StyledText>{t("Settings:UserLimitExceeded")}</StyledText>}
      <Wrapper>
        <Text className="selected-users-count">
          {t("Settings:SelectedUsersCounter", { selectedUsers, totalUsers })}
        </Text>
        <Text className="selected-admins-count">
          {t("Settings:LicenseLimitCounter", {
            licencelimit,
            totalLicenceLimit,
          })}
        </Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">{t("Settings:LicenseLimitDescription")}</Text>
          }
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
    </>
  );
};

export default inject(({ setup }) => {
  const { viewAs } = setup;

  return {
    viewAs,
  };
})(observer(SecondStep));
