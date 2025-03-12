import { useEffect, useState } from "react";
import { getAnimationOrigin, getChatPosition } from "./utils";

const ChatWidgetWrapper = ({
  children,
  triggerRef,
  isOpen,
  isPopupView,
  ...rest
}: {
  children: React.ReactElement | React.ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement>;
  isOpen?: boolean;
  isPopupView: boolean;
}) => {
  const width = 450;
  const height = 650;

  const [windowPosition, setWindowPosition] = useState({ left: "0", top: "0" });

  useEffect(() => {
    if (triggerRef && isPopupView)
      setWindowPosition(
        getChatPosition(
          triggerRef.current!.getBoundingClientRect(),
          width,
          height
        )
      );
  }, [triggerRef, isPopupView, width, height]);

  if (!isPopupView) {
    return (
      <div className="chat-panel-wrapper" {...rest}>
        <div className="chat-panel">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={
        "chat-panel-wrapper cl-chat-window " +
        getAnimationOrigin() +
        (isOpen ? " cl-scale-100" : " cl-scale-0")
      }
      style={{ ...windowPosition, zIndex: 9999, width, height }}
      {...rest}
    >
      <div className="chat-panel cl-window">{children}</div>
    </div>
  );
};

export default ChatWidgetWrapper;
