import { ShareAccessRights } from "@docspace/shared/constants";
import AddUsersPanel from "../../../../panels/AddUsersPanel";
import { getAccessOptions } from "../../../../panels/InvitePanel/utils";
import { useTranslation } from "react-i18next";

interface SelectGroupMembersPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onParentPanelClose: () => void;
  groupManager: object | null;
  groupMembers: object[];
  setGroupMembers: (groupMembers: object[]) => void;
}

const SelectGroupMembersPanel = ({
  isVisible,
  onClose,
  onParentPanelClose,
  groupManager,
  groupMembers,
  setGroupMembers,
}: SelectGroupMembersPanelProps) => {
  const { t } = useTranslation(["InviteDialog"]);
  const accessOptions = getAccessOptions(t, 5, false, true);

  const selectedGroupMemebersIds = groupMembers
    ? groupMembers.map((gm) => gm.id)
    : [];

  const onAddGroupMembers = (newGroupMembers: object[]) => {
    const items = [...groupMembers, ...newGroupMembers];
    setGroupMembers(items);
  };

  return (
    <AddUsersPanel
      visible={isVisible}
      onClose={onClose}
      onParentPanelClose={onParentPanelClose}
      isMultiSelect
      tempDataItems={[]}
      setDataItems={onAddGroupMembers}
      accessOptions={accessOptions}
      withAccessRights={false}
      isEncrypted={true}
      defaultAccess={ShareAccessRights.FullAccess}
      userIdsToFilterOut={[groupManager?.id, ...selectedGroupMemebersIds]}
      //   withoutBackground={isMobileView}
      //   withBlur={!isMobileView}
    />
  );
};

export default SelectGroupMembersPanel;
