import { File } from "@docspace/common/types";

interface DeleteFormDialogProps {
  theme: any;
  visible: boolean;
  removeItem?: File;

  setVisible: (visible: boolean) => void;
}

export default DeleteFormDialogProps;
