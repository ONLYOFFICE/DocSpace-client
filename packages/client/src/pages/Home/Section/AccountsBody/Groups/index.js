import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import TableView from "./TableView";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import RowView from "./RowView";

const Groups = ({ tReady, accountsViewAs }) => {
  console.log(accountsViewAs);

  return (
    <Consumer>
      {(context) =>
        accountsViewAs === "table" ? (
          <TableView sectionWidth={context.sectionWidth} tReady={tReady} />
        ) : (
          <RowView sectionWidth={context.sectionWidth} tReady={tReady} />
        )
      }
    </Consumer>
  );
};

export default inject(({ peopleStore }) => ({
  accountsViewAs: peopleStore.viewAs,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(Groups))()
  )
);
