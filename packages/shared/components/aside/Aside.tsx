import React from "react";
import { isMobileOnly, isIOS } from "react-device-detect";

import { Scrollbar, ScrollbarType } from "../scrollbar";

import {
  StyledAside,
  StyledControlContainer,
  StyledCrossIcon,
} from "./Aside.styled";
import { AsideProps } from "./Aside.types";

const AsidePure = (props: AsideProps) => {
  const {
    visible,
    children,
    scale,
    zIndex,
    className,
    contentPaddingBottom,
    withoutBodyScroll,
    onClose,
  } = props;
  const [windowHeight] = React.useState(window.innerHeight);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const diffRef = React.useRef<number | null>(null);
  const visualPageTop = React.useRef(0);

  const onResize = React.useCallback(
    (e: Event) => {
      if (!contentRef.current) return;

      const target = e.target as VisualViewport;

      if (e?.type === "resize") {
        const diff = windowHeight - target.height - target.pageTop;

        visualPageTop.current = target.pageTop;

        contentRef.current.style.bottom = `${diff}px`;

        contentRef.current.style.height = `${
          target.height - 64 + target.pageTop
        }px`;

        contentRef.current.style.position = "fixed";

        diffRef.current = diff;
      } else if (e?.type === "scroll") {
        const diff = window.visualViewport?.pageTop ? 0 : visualPageTop.current;

        if (diffRef.current)
          contentRef.current.style.bottom = `${diffRef.current + diff}px`;

        if (window.visualViewport)
          contentRef.current.style.height = `${
            window.visualViewport.height - 64 + diff
          }px`;

        contentRef.current.style.position = "fixed";
      }
    },
    [windowHeight],
  );

  React.useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport?.addEventListener("resize", onResize);
      window.visualViewport?.addEventListener("scroll", onResize);
    }
    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, [onResize]);

  return (
    <StyledAside
      visible={visible}
      scale={scale}
      zIndex={zIndex}
      contentPaddingBottom={contentPaddingBottom}
      className={`${className} not-selectable aside`}
      forwardRef={contentRef}
      data-testid="aside"
    >
      {/* <CloseButton  displayType="aside" zIndex={zIndex}/> */}
      {withoutBodyScroll ? children : <Scrollbar>{children}</Scrollbar>}

      {visible && (
        <StyledControlContainer className="close-button" onClick={onClose}>
          <StyledCrossIcon />
        </StyledControlContainer>
      )}
    </StyledAside>
  );
};

AsidePure.defaultProps = {
  scale: false,
  zIndex: 400,
  withoutBodyScroll: false,
};

const Aside = React.memo(AsidePure);

export { Aside };
