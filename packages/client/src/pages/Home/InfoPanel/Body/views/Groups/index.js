import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import * as Styled from "../../styles/groups.styled";
import withLoader from "@docspace/client/src/HOCs/withLoader";
import Loaders from "@docspace/common/components/Loaders";
import GroupMember from "./GroupMember";
import useFetchGroup from "./useFetchGroup";
import { useParams } from "react-router-dom";
import { useState } from "react";

const Groups = ({ infoPanelSelection, currentGroup, setCurrentGroup }) => {
  const { groupId: paramsGroupId } = useParams();
  const isInsideGroup = !!paramsGroupId;

  const [fetchedGroup, setFetchedGroup] = useState < any > null;
  const group = isInsideGroup ? currentGroup : fetchedGroup;

  const groupId = isInsideGroup ? paramsGroupId : infoPanelSelection?.id;
  const setGroup = isInsideGroup ? setCurrentGroup : setFetchedGroup;

  useFetchGroup(groupId, group?.id, setGroup);

  const groupManager = infoPanelSelection?.manager;
  const groupMembers = group?.members?.filter(
    (user) => user.id !== groupManager?.id,
  );

  return (
    <Styled.GroupsContent>
      {groupManager && <GroupMember groupMember={groupManager} isManager />}
      {!groupMembers ? (
        <Loaders.InfoPanelViewLoader view="groups" />
      ) : (
        groupMembers?.map((groupMember) => (
          <GroupMember key={groupMember.id} groupMember={groupMember} />
        ))
      )}
    </Styled.GroupsContent>
  );
};

export default inject(({ peopleStore }) => ({
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
}))(
  withTranslation([])(
    withLoader(observer(Groups))(
      <Loaders.InfoPanelViewLoader view="accounts" />,
    ),
  ),
);
