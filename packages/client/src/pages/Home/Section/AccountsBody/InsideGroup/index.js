import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import PeopleRowContainer from "./RowView/PeopleRowContainer";
import TableView from "./TableView/TableContainer";
import { Consumer } from "@docspace/shared/utils/context";
import withLoader from "SRC_DIR/HOCs/withLoader";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AccountsFilter from "@docspace/shared/api/people/filter";

const InsideGroup = ({
  tReady,
  accountsViewAs,
  currentGroup,
  setCurrentGroup,
  getGroupById,
  filter,
}) => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      if (!groupId) return;
      if (!currentGroup || currentGroup.id !== groupId) {
        const newCurrentGroup = await getGroupById(groupId);
        const newFilter = AccountsFilter.getFilter(location);
        setCurrentGroup(newCurrentGroup, newFilter, true);
      }
    })();
  }, [groupId]);

  useEffect(() => {
    navigate(`/accounts/groups/${groupId}/filter`);
  }, [groupId]);

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
  filter: peopleStore.groupsStore.filter,
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  getGroupById: peopleStore.groupsStore.getGroupById,
}))(
  withTranslation(["People", "Common", "PeopleTranslations"])(
    withLoader(observer(InsideGroup))(),
  ),
);
