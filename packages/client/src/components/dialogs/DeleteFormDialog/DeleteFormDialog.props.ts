interface DeleteFormDialogProps {
  theme: any;
  visible: boolean;
  removeItem: {
    fileId: number;
    boardId: string;
    fileName: string;
    boardName: string;
  };

  setVisible: (visible: boolean) => void;
}

export default DeleteFormDialogProps;
