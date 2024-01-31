import { ConflictResolveType } from "../../enums";

export interface ConflictResolveProps {
  isLoading: boolean;
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: ConflictResolveType) => void;
  messageText: React.ReactNode;
  selectActionText: string;
  submitButtonLabel: string;
  cancelButtonLabel: string;
  overwriteTitle: string;
  overwriteDescription: string;
  duplicateTitle: string;
  duplicateDescription: string;
  skipTitle: string;
  skipDescription: string;
  headerLabel: string;
}
