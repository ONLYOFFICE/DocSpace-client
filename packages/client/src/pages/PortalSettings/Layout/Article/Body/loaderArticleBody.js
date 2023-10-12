import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import Loaders from "@docspace/common/components/Loaders";

import { isDesktop, desktop } from "@docspace/components/utils/device";

const StyledLoader = styled.div`
  .loader {
    padding-bottom: 12px;
  }

  .section-name-container {
    padding: 1px 3px 29px;
    display: flex;
    justify-content: flex-start;
  }

  .section-name {
    width: 20px;
    height: 1px;
    line-height: 1px;
    background: #d0d5da;
    margin: 0px;
  }

  @media ${desktop} {
    padding-top: 7px;
    display: flex;
    flex-direction: column;

    .section-name-loader {
      margin-bottom: 12px;
    }

    .loader {
      padding-bottom: 16px;
    }
  }
`;

const LoaderArticleBody = () => {
  const [isTabletView, setIsTabletView] = useState(false);

  const checkInnerWidth = () => {
    const isTabletView = !isDesktop();

    if (isTabletView) {
      setIsTabletView(true);
    } else {
      setIsTabletView(false);
    }
  };

  useEffect(() => {
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    return () => window.removeEventListener("resize", checkInnerWidth);
  });

  const height = isTabletView ? "28px" : "20px";
  const width = isTabletView ? "28px" : "210px";

  return (
    <StyledLoader>
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
      <Loaders.Rectangle width={width} height={height} className="loader" />
    </StyledLoader>
  );
};

export default LoaderArticleBody;
