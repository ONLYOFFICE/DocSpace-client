import { GroupParams } from "../types";
import GroupNameParam from "./GroupNameParam";
import { Dispatch, ChangeEvent } from "react";
import HeadOfGroup from "./HeadOfGroupParam";
import MembersParam from "./MembersParam";

interface CreateGroupDialogBodyProps {
  groupParams: GroupParams;
  setGroupParams: Dispatch<React.SetStateAction<GroupParams>>;
  onClose: () => void;
}

const CreateGroupDialogBody = ({
  groupParams,
  setGroupParams,
  onClose,
}: CreateGroupDialogBodyProps) => {
  const onChangeGroupName = (e: ChangeEvent<HTMLInputElement>) =>
    setGroupParams({ ...groupParams, groupName: e.target.value });

  const setGroupManager = (groupManager: object) =>
    setGroupParams({ ...groupParams, groupManager });

  const setGroupMembers = (groupMembers: object[]) =>
    setGroupParams({ ...groupParams, groupMembers });

  return (
    <>
      <GroupNameParam
        groupName={groupParams.groupName}
        onChangeGroupName={onChangeGroupName}
      />
      <HeadOfGroup
        groupManager={groupParams.groupManager}
        setGroupManager={setGroupManager}
        onClose={onClose}
      />
      <MembersParam
        groupManager={groupParams.groupManager}
        groupMembers={groupParams.groupMembers}
        setGroupMembers={setGroupMembers}
        onClose={onClose}
      />
    </>
  );
};

export default CreateGroupDialogBody;
