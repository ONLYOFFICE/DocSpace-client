import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";
import HelpButton from "@docspace/components/help-button";

import GWTableView from "./GWTableView";
import GWRowView from "./GWRowView";

const GWTable = (props) => {
  const { t, nextStep, prevStep, viewAs, showReminder } = props;

  return (
    <>
      <Box className="description-wrapper">
        <Text className="step-description">
          {t("Settings:SelectUsersDescription")}
        </Text>
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={nextStep}
          onCancelClick={prevStep}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
        <Box className="selected-users-info">
          <Text className="selected-users-count">Selected: 0/10 users</Text>
          <Text className="selected-admins-count">
            License limit Admins/Power: 0/100
          </Text>
          <HelpButton
            place="right"
            offsetRight={0}
            tooltipContent={
              <Text fontSize="13px">Paste you tooltip content here</Text>
            }
          />
        </Box>
      </Box>

      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <GWTableView sectionWidth={context.sectionWidth} />
          ) : (
            <GWRowView sectionWidth={context.sectionWidth} />
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
})(observer(GWTable));
