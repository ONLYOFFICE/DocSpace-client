import type { PropsWithChildren } from "react";
import { isMobile, isMobileOnly } from "react-device-detect";

import Scrollbar from "@docspace/components/scrollbar";
import { BoardWrapperProps } from "./Board.props";

function BoardWrapper({
  sectionWidth,
  children,
}: PropsWithChildren<BoardWrapperProps>) {
  if (isMobile) {
    return (
      //@ts-ignore
      <Scrollbar
        style={{
          width: sectionWidth,
          height: `calc(100vh  - ${isMobileOnly ? 255 : 155}px)`,
        }}
      >
        {children}
      </Scrollbar>
    );
  }

  return <>{children}</>;
}

export default BoardWrapper;
