import type { ContextMenuModel } from "@docspace/shared/components/context-menu";

interface MobileDetailsProps {
  icon: string;
  title: string;
  isError: boolean;
  isPreviewFile: boolean;
  contextModel: () => ContextMenuModel[];

  onHide: VoidFunction;
  onMaskClick: VoidFunction;
  onContextMenu: (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
}

export default MobileDetailsProps;
