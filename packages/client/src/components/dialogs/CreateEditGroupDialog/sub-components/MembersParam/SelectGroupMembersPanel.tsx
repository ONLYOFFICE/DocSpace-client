import { useTranslation } from "react-i18next";
import { ShareAccessRights } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import AddUsersPanel from "../../../../panels/AddUsersPanel";
import { getAccessOptions } from "../../../../panels/InvitePanel/utils";

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

  const onAddGroupMembers = (newGroupMembers: object[]) => {
    const resultGroupMembers = [...groupMembers];
    let showErrorWasSelected = false;

    newGroupMembers.forEach((groupMember) => {
      if (groupMembers.findIndex((gm) => gm.id === groupMember.id) !== -1) {
        showErrorWasSelected = true;
        return;
      }
      resultGroupMembers.push(groupMember);
    });

    if (showErrorWasSelected) {
      toastr.warning("Some users have already been added");
    }

    setGroupMembers(resultGroupMembers);
  };

  return (
    <Portal
      element={
        <AddUsersPanel
          visible={isVisible}
          onClose={onClose}
          onParentPanelClose={onParentPanelClose}
          isMultiSelect
          tempDataItems={[]}
          setDataItems={onAddGroupMembers}
          accessOptions={accessOptions}
          withAccessRights={false}
          isEncrypted
          defaultAccess={ShareAccessRights.FullAccess}
        />
      }
    />
  );
};

export default SelectGroupMembersPanel;
