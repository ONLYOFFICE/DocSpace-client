import { useRef } from "react";
import Scrollbar from "react-scrollbars-custom";

import { SubInfoPanelBodyProps } from "../Section.types";
import { StyledScrollbar } from "../Section.styled";

const SubInfoPanelBody = ({
  children,
  isInfoPanelScrollLocked,
}: SubInfoPanelBodyProps) => {
  const scrollRef = useRef<Scrollbar | null>(null);
  let scrollYPossible = false;
  if (scrollRef.current)
    // @ts-expect-error check later private
    scrollYPossible = scrollRef?.current?.scrollValues?.scrollYPossible;
  const scrollLocked = scrollYPossible && isInfoPanelScrollLocked;

  return (
    <StyledScrollbar
      ref={scrollRef}
      $isScrollLocked={scrollLocked}
      noScrollY={scrollLocked}
      scrollclass="section-scroll info-panel-scroll"
    >
      {children}
    </StyledScrollbar>
  );
};

SubInfoPanelBody.displayName = "SubInfoPanelBody";

export default SubInfoPanelBody;
