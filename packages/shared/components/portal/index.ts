import React from "react";

import ReactDOM from "react-dom";

interface PortalProps {
  visible?: boolean;
  element: React.ReactNode;
  appendTo?: HTMLElement;
}

const Portal = ({ visible, element, appendTo }: PortalProps) => {
  const [mounted, setMounted] = React.useState(visible);

  const domExist = React.useCallback(() => {
    return !!(
      typeof window !== "undefined" &&
      window.document &&
      window.document.createElement
    );
  }, []);

  React.useEffect(() => {
    if (domExist() && !mounted) {
      setMounted(true);
    }
  }, [domExist, mounted]);

  return element && mounted
    ? ReactDOM.createPortal(element, appendTo || document.body)
    : null;
};

Portal.defaultProps = {
  visible: false,
  appendTo: null,
};

export { Portal };
