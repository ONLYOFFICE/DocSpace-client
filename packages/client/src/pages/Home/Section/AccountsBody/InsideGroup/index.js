import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/components/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";

const InsideGroup = ({ tReady, accountsViewAs }) => {
  return (
    <Consumer>
      {(context) =>
        accountsViewAs === "table" ? (
          <TableView sectionWidth={context.sectionWidth} tReady={tReady} />
        ) : (
          <PeopleRowContainer
            sectionWidth={context.sectionWidth}
            tReady={tReady}
          />
        )
      }
    </Consumer>
  );
};

export default inject(({ peopleStore }) => ({
  accountsViewAs: peopleStore.viewAs,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(InsideGroup))()
  )
);
