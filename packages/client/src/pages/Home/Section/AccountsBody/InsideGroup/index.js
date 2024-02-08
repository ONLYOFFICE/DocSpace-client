import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const InsideGroup = ({
  tReady,
  accountsViewAs,
  currentGroup,
  setCurrentGroup,
  fetchGroup,
}) => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  // useEffect(() => {
  //   (async () => {
  //     if (!groupId) return;
  //     if (!currentGroup) {
  //       fetchGroup(groupId);
  //     }
  //   })();
  // }, [groupId]);

  // useEffect(() => {
  //   navigate(`/accounts/groups/${groupId}/filter`);
  // }, [groupId]);

  if (!currentGroup) return null;

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
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  fetchGroup: peopleStore.groupsStore.fetchGroup,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(InsideGroup))(),
  ),
);
