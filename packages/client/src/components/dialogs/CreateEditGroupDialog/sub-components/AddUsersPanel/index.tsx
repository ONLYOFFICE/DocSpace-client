import { ShareAccessRights } from "@docspace/shared/constants";
import AddUsersPanel from "../../../../panels/AddUsersPanel";
import { getAccessOptions } from "../../../../panels/InvitePanel/utils";
import { useTranslation } from "react-i18next";

interface AddUsersProps {
  isVisible: boolean;
  onClose: () => void;
  onParentPanelClose: () => void;
}

const AddUsers = ({
  isVisible,
  onClose,
  onParentPanelClose,
}: AddUsersProps) => {
  const { t } = useTranslation(["InviteDialog"]);
  const accessOptions = getAccessOptions(t);

  return (
    <AddUsersPanel
      visible={isVisible}
      onClose={onClose}
      onParentPanelClose={onParentPanelClose}
      //   tempDataItems={inviteItems}
      //   setDataItems={addItems}
      accessOptions={accessOptions}
      isMultiSelect
      isEncrypted={true}
      defaultAccess={ShareAccessRights.FullAccess}
      //   withoutBackground={isMobileView}
      //   withBlur={!isMobileView}
      //   roomId={roomId}
    />
  );
};

export default AddUsers;
