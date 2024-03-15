import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import * as Styled from "../../styles/groups.styled";
import withLoader from "@docspace/client/src/HOCs/withLoader";
import InfoPanelViewLoader from "@docspace/shared/skeletons/info-panel/body";
import GroupMember from "./GroupMember";
import useFetchGroup from "./useFetchGroup";
import { useParams } from "react-router-dom";
import { useState } from "react";

const Groups = ({
  infoPanelSelection,
  currentGroup,
  setCurrentGroup,
  infoPanelSelectedGroup,
  setInfoPanelSelectedGroup,
}) => {
  const { groupId: paramsGroupId } = useParams();
  const isInsideGroup = !!paramsGroupId;

  const group = isInsideGroup ? currentGroup : infoPanelSelectedGroup;

  const groupId = isInsideGroup ? paramsGroupId : infoPanelSelection?.id;
  const setGroup = isInsideGroup ? setCurrentGroup : setInfoPanelSelectedGroup;

  useFetchGroup(groupId, group?.id, setGroup);

  const groupManager = infoPanelSelection?.manager;
  const groupMembers = group?.members?.filter(
    (user) => user.id !== groupManager?.id,
  );

  return (
    <Styled.GroupsContent>
      {groupManager && <GroupMember groupMember={groupManager} isManager />}
      {!groupMembers ? (
        <InfoPanelViewLoader view="groups" />
      ) : (
        groupMembers?.map((groupMember) => (
          <GroupMember key={groupMember.id} groupMember={groupMember} />
        ))
      )}
    </Styled.GroupsContent>
  );
};

export default inject(({ peopleStore, infoPanelStore }) => ({
  currentGroup: peopleStore.groupsStore.currentGroup,
  setCurrentGroup: peopleStore.groupsStore.setCurrentGroup,
  infoPanelSelectedGroup: infoPanelStore.infoPanelSelectedGroup,
  setInfoPanelSelectedGroup: infoPanelStore.setInfoPanelSelectedGroup,
}))(
  withTranslation([])(
    withLoader(observer(Groups))(<InfoPanelViewLoader view="accounts" />),
  ),
);
