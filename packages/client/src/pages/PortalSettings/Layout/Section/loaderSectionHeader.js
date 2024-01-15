import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { isTablet, isDesktop } from "@docspace/shared/utils";

const StyledLoader = styled.div`
  display: flex;
  align-items: center;

  .arrow {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 12px;
          `
        : css`
            padding-right: 12px;
          `}
  }

  padding: ${(props) =>
    props.isTabletView
      ? "16px 0 17px"
      : props.isDesktopView
      ? "21px 0 23px"
      : "14px 0 0"};
`;

const LoaderSectionHeader = () => {
  const [isTabletView, setIsTabletView] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);

  const height = isTabletView ? "28" : "24";
  const width = isTabletView ? "163" : "140";

  const levelSettings = location.pathname.split("/").length - 1;

  const checkInnerWidth = () => {
    const isTabletView = isTablet();

    const isDesktopView = isDesktop();
    if (isTabletView) {
      setIsTabletView(true);
    } else {
      setIsTabletView(false);
    }

    if (isDesktopView) {
      setIsDesktopView(true);
    } else {
      setIsDesktopView(false);
    }
  };

  useEffect(() => {
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    return () => window.removeEventListener("resize", checkInnerWidth);
  });

  return (
    <StyledLoader isTabletView={isTabletView} isDesktopView={isDesktopView}>
      {levelSettings === 4 && (
        <RectangleSkeleton width="17" height="17" className="arrow" />
      )}

      <RectangleSkeleton width={width} height={height} className="loader" />
    </StyledLoader>
  );
};

export default LoaderSectionHeader;
