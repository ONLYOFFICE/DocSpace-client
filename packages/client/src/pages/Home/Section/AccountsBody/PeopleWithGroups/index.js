import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";

const PeopleWithGroups = ({ tReady, accountsViewAs }) => {
  return (
    <Consumer>
      {(context) =>
        accountsViewAs === "table" ? (
          <TableView tReady={tReady} sectionWidth={context.sectionWidth} />
        ) : (
          <PeopleRowContainer
            tReady={tReady}
            sectionWidth={context.sectionWidth}
          />
        )
      }
    </Consumer>
  );
};

export default inject(() => ({}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(PeopleWithGroups))(),
  ),
);
