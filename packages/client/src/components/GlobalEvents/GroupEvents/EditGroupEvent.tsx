import EditGroupDialog from "@docspace/client/src/components/dialogs/CreateEditGroupDialog/EditGroupDialog";

interface CreateGroupEventProps {
  visible: boolean;
  onClose: () => void;
}

const EditGroupEvent = ({ item, visible, onClose }: CreateGroupEventProps) => {
  return <EditGroupDialog visible={visible} onClose={onClose} group={item} />;
};

export default EditGroupEvent;
