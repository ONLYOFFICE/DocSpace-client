import { Consumer } from "@docspace/components/utils/context";
import { inject, observer } from "mobx-react";

import SaveCancelButtons from "@docspace/components/save-cancel-buttons";
import TableView from "./TableView";
import RowView from "./RowView";

const ThirdStep = (props) => {
  const { t, onNextStepClick, onPrevStepClick, viewAs, showReminder } = props;

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

      <Consumer>
        {(context) =>
          viewAs === "table" ? (
            <TableView sectionWidth={context.sectionWidth} t={t} />
          ) : (
            <RowView sectionWidth={context.sectionWidth} t={t} />
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
})(observer(ThirdStep));
