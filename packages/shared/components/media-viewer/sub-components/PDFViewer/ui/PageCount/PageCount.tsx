import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { isMobile } from "react-device-detect";

import PanelReactSvg from "PUBLIC_DIR/images/panel.react.svg";
import PageCountProps, { PageCountRef } from "./PageCount.props";
import { PageCountWrapper } from "./PageCount.styled";

const PageCount = forwardRef<PageCountRef, PageCountProps>(
  ({ isPanelOpen, visible, className, setIsOpenMobileDrawer }, ref) => {
    const [pagesCount, setPagesCount] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(0);

    useImperativeHandle(ref, () => ({
      setPagesCount(pagesCountArg: number) {
        setPagesCount(pagesCountArg);
      },
      setPageNumber: (pageNumberArg: number) => {
        setPageNumber(pageNumberArg);
      },
    }));

    const openMobileDrawer = useCallback(() => {
      setIsOpenMobileDrawer(true);
    }, [setIsOpenMobileDrawer]);

    if (!visible) return;

    return (
      <PageCountWrapper isPanelOpen={isPanelOpen} className={className}>
        {isMobile && <PanelReactSvg onClick={openMobileDrawer} />}
        <div>
          <span>{pageNumber}</span> / <span>{pagesCount}</span>
        </div>
      </PageCountWrapper>
    );
  },
);

PageCount.displayName = "PageCount";

export { PageCount };
