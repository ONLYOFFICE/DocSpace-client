import type { ContextMenuModel } from "@docspace/shared/components/context-menu";

interface PlayerMessageErrorProps {
  errorTitle: string;
  model: ContextMenuModel[];
  onMaskClick: VoidFunction;
  isMobile: boolean;
}

export default PlayerMessageErrorProps;
