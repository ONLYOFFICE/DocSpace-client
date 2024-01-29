import type { ContextMenuModel } from "../../types";

interface PlayerMessageErrorProps {
  errorTitle: string;
  model: ContextMenuModel[];
  onMaskClick: VoidFunction;
  isMobile: boolean;
}

export default PlayerMessageErrorProps;
