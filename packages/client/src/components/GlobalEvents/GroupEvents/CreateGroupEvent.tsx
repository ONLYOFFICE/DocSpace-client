import { CreateGroupDialog } from "../../dialogs";

interface CreateGroupEventProps {
  visible: boolean;
  onClose: () => void;
}

const CreateGroupEvent = ({ visible, onClose }: CreateGroupEventProps) => {
  return <CreateGroupDialog visible={visible} onClose={onClose} />;
};

export default CreateGroupEvent;
