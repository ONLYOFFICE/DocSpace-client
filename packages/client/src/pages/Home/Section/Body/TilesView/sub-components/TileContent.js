import React from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { tablet } from "@docspace/shared/utils";

const truncateCss = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const commonCss = css`
  margin: 0;
  font-family: "Open Sans";
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  font-style: normal;
  font-weight: 600;
`;

const StyledTileContent = styled.div`
  width: 100%;
  display: inline-flex;
`;

const MainContainerWrapper = styled.div`
  ${commonCss};

  display: flex;
  align-self: center;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-left: auto;`
      : `margin-right: auto;`}
`;

const MainContainer = styled.div`
  height: 20px;

  @media ${tablet} {
    ${truncateCss};
  }
`;

const TileContent = (props) => {
  const { children, id, className, style, onClick } = props;

  return (
    <StyledTileContent
      id={id}
      className={className}
      style={style}
      onClick={onClick}
    >
      <MainContainerWrapper
        mainContainerWidth={children.props && children.props.containerWidth}
      >
        <MainContainer className="row-main-container">{children}</MainContainer>
      </MainContainerWrapper>
    </StyledTileContent>
  );
};

TileContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  sideColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default TileContent;
