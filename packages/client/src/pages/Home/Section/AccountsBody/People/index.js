import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";

const People = ({ tReady, peopleList, accountsViewAs }) => {
  return (
    <Consumer>
      {(context) =>
        accountsViewAs === "table" ? (
          <TableView
            peopleList={peopleList}
            sectionWidth={context.sectionWidth}
            tReady={tReady}
          />
        ) : (
          <PeopleRowContainer
            peopleList={peopleList}
            sectionWidth={context.sectionWidth}
            tReady={tReady}
          />
        )
      }
    </Consumer>
  );
};

export default inject(({ peopleStore }) => ({
  peopleList: peopleStore.usersStore.peopleList,
  accountsViewAs: peopleStore.viewAs,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(People))(),
  ),
);
