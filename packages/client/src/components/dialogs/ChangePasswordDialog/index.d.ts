// The dialog is JavaScript with PropTypes, so a TSX caller sees no props at
// all -- react-i18next 15 resolves the wrapped type for real instead of
// degrading it to `any`, and every prop it is given is then rejected. These
// are the PropTypes the component declares.
import type { ComponentType } from "react";

declare const ChangePasswordDialog: ComponentType<{
  visible: boolean;
  onClose: () => void;
  email: string;
}>;

export default ChangePasswordDialog;
