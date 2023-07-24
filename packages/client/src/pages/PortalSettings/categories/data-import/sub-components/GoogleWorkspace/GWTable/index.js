import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import Text from "@docspace/components/text";
import Box from "@docspace/components/box";

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
        <Box className="selected-users-count">
          
        </Box>
        <SaveCancelButtons
          className="save-cancel-buttons"
          onSaveClick={nextStep}
          onCancelClick={prevStep}
          showReminder={showReminder}
          saveButtonLabel={t("Settings:NextStep")}
          cancelButtonLabel={t("Common:Back")}
          displaySettings={true}
        />
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
