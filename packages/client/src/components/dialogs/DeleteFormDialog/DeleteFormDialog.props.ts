import { File } from "@docspace/common/types";

interface DeleteFormDialogProps {
  theme: any;
  visible: boolean;
  removeItem: {
    boardId: string;
    fileName: string;
    boardName: string;
  };

  setVisible: (visible: boolean) => void;
}

export default DeleteFormDialogProps;
