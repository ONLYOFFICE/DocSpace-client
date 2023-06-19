import React, { useEffect, useState } from "react";
import RectangleLoader from "../RectangleLoader";
import CircleLoader from "../CircleLoader";
import styled from "styled-components";
import { size } from "@docspace/components/utils/device";

const StyledContainer = styled.div`
  .tooltip {
    padding-bottom: 19px;
  }

  .list-title {
    padding-bottom: 12px;
  }

  .name {
    padding-left: 8px;
    padding-right: 28px;
    max-width: 284px;
  }

  .row {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
  }

  .row-with-remove {
    justify-content: space-between;
    align-items: center;
  }

  .avatar-with-role {
    display: flex;
    align-items: center;

    .name {
      padding-right: 12px;
    }
  }

  .row-container {
    padding-left: 17px;
  }

  .avatar {
    min-width: 32px;
  }
`;

const StartFillingPanelLoader = () => {
  const [isMobileView, setIsMobileView] = useState(false);
  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const checkWidth = () => {
    window.innerWidth <= size.smallTablet
      ? setIsMobileView(true)
      : setIsMobileView(false);
  };

  return (
    <StyledContainer>
      <RectangleLoader
        className="tooltip"
        height={isMobileView ? "92px" : "76px"}
      />
      <RectangleLoader className="list-title" width="120px" height="16px" />

      <div className="row-container">
        <div className="row">
          <CircleLoader
            className="avatar"
            x="16"
            y="16"
            width="32"
            height="32"
            radius="16"
          />
          <RectangleLoader className="name" height="16px" />
        </div>
        <div className="row">
          <CircleLoader
            className="avatar"
            x="16"
            y="16"
            width="32"
            height="32"
            radius="16"
          />
          <RectangleLoader className="name" height="16px" />
        </div>
        <div className="row row-with-remove">
          <div className="avatar-with-role">
            <CircleLoader
              className="avatar"
              x="16"
              y="16"
              width="32"
              height="32"
              radius="16"
            />
            <RectangleLoader className="name" height="16px" />
          </div>

          <RectangleLoader width="16" height="16" />
        </div>
      </div>
    </StyledContainer>
  );
};

export default StartFillingPanelLoader;
