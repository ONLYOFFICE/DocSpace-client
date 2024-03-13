import { useTranslation } from "react-i18next";
import { ShareAccessRights } from "@docspace/shared/enums";
import { Portal } from "@docspace/shared/components/portal";
import AddUsersPanel from "../../../../panels/AddUsersPanel";
import { getAccessOptions } from "../../../../panels/InvitePanel/utils";

interface SelectGroupManagerPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onParentPanelClose: () => void;
  setGroupManager: (groupManager: object) => void;
}

const SelectGroupManagerPanel = ({
  isVisible,
  onClose,
  onParentPanelClose,
  setGroupManager,
}: SelectGroupManagerPanelProps) => {
  const { t } = useTranslation(["InviteDialog"]);
  const accessOptions = getAccessOptions(t);

  const onSelectGroupManager = (newGroupManager: object[]) => {
    setGroupManager(...newGroupManager);
  };

  return (
    <Portal
      element={
        <AddUsersPanel
          visible={isVisible}
          onClose={onClose}
          onParentPanelClose={onParentPanelClose}
          setDataItems={onSelectGroupManager}
          accessOptions={accessOptions}
          isEncrypted={true}
          defaultAccess={ShareAccessRights.FullAccess}
        />
      }
    />
  );
};

export default SelectGroupManagerPanel;
