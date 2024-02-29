import React from "react";

const useShareDialog = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  const onSDKRequestSharingSettings = React.useCallback(() => {
    setIsVisible(true);
  }, []);

  const onClose = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isSharingDialogVisible: isVisible,
    onSDKRequestSharingSettings,
    onCloseSharingDialog: onClose,
  };
};

export default useShareDialog;
