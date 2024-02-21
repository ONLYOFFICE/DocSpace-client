export interface IRecoverAccessModalDialogProps {
  visible: boolean;
  onClose: () => void;
  textBody: string;
  emailPlaceholderText: string;
  id?: string;
}
