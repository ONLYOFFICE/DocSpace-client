import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const InsideGroup = ({
  tReady,
  accountsViewAs,
  currentGroup,
  setCurrentGroup,
  getGroupById,
}) => {
  const { groupId } = useParams();

  useEffect(() => {
    (async () => {
      if (!groupId) return;
      if (!currentGroup || groupId !== currentGroup.id) {
        console.log(groupId);
        const newCurrentGroup = await getGroupById(groupId);
        console.log(newCurrentGroup);
        setCurrentGroup(newCurrentGroup);
      }
    })();
  }, [groupId]);

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

export default inject(({ peopleStore }) => ({
  groups: peopleStore.groupsStore.groups,
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  getGroupById: peopleStore.groupsStore.getGroupById,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(InsideGroup))(),
  ),
);
