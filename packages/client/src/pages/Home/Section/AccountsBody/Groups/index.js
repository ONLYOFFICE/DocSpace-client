import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import TableView from "./TableView";
import { useEffect } from "react";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import RowView from "./RowView";
import { useLocation } from "react-router-dom";
import { RowsSkeleton, TableSkeleton } from "@docspace/shared/skeletons";

const Groups = ({
  tReady,
  accountsViewAs,
  isGroupsLoaded,
  setPeopleSelection,
  setPeopleBufferSelection,
}) => {
  const { location } = useLocation();

  useEffect(() => {
    setPeopleSelection([]);
    setPeopleBufferSelection();
  }, [location]);

  if (!isGroupsLoaded) {
    if (accountsViewAs === "table") return <TableSkeleton />;
    return <RowsSkeleton />;
  }

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
  isGroupsLoaded: peopleStore.groupsStore.groups !== undefined,
  setPeopleSelection: peopleStore.selectionStore.setSelection,
  setPeopleBufferSelection: peopleStore.selectionStore.setBufferSelection,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(Groups))(),
  ),
);
