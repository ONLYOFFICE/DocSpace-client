import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import TableView from "./TableView";
import { useEffect } from "react";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import RowView from "./RowView";
import { useLocation } from "react-router-dom";

const Groups = ({
  tReady,
  accountsViewAs,
  setPeopleSelection,
  setPeopleBufferSelection,
}) => {
  const { location } = useLocation();

  useEffect(() => {
    setPeopleSelection([]);
    setPeopleBufferSelection();
  }, [location]);

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
  setPeopleSelection: peopleStore.selectionStore.setSelection,
  setPeopleBufferSelection: peopleStore.selectionStore.setBufferSelection,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(Groups))(),
  ),
);
