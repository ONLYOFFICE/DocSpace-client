import { IRole } from "@docspace/common/Models";

interface DeleteAllFormsDialogProps {
  visible: boolean;
  isLoading: boolean;
  removeItem?: IRole;

  setDeleteAllFormsDialogVisible: (visible: boolean) => void;
  clearBufferSelectionRole: VoidFunction;
}

export default DeleteAllFormsDialogProps;
