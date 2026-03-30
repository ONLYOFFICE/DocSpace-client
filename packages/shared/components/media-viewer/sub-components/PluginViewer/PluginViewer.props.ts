export type PluginViewerProps = {
  pluginViewerContent: React.ReactNode;
  handleMaskClick: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  devices?: {
    isMobileOnly: boolean;
    isMobile: boolean;
    isDesktop: boolean;
  };
};
