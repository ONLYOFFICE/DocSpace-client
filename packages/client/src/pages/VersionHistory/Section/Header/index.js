﻿import ArrowPathReactSvgUrl from "PUBLIC_DIR/images/arrow.path.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import Headline from "@docspace/common/components/Headline";
import { IconButton } from "@docspace/shared/components/icon-button";
import { desktop, tablet } from "@docspace/shared/utils";

const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;

  .arrow-button {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? css`
            margin-right: -8px;
            margin-left: 15px;
          `
        : css`
            margin-left: -8px;
            margin-right: 15px;
          `}
    min-width: 17px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
    }

    @media ${tablet} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? css`
              padding: 8px 8px 8px 0;
              margin-right: -8px;
            `
          : css`
              padding: 8px 0 8px 8px;
              margin-left: -8px;
            `}
    }
  }

  .headline-header {
    @media ${desktop} {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl"
          ? `margin-right: -9px;`
          : `margin-left: -9px;`}
    }
  }
`;

const SectionHeaderContent = (props) => {
  const { title, onClickBack } = props;

  return (
    <StyledContainer>
      <IconButton
        iconName={ArrowPathReactSvgUrl}
        size="17"
        // color="#A3A9AE"
        // hoverColor="#657077"
        isFill={true}
        onClick={onClickBack}
        className="arrow-button"
      />

      <Headline className="headline-header" type="content" truncate={true}>
        {title}
      </Headline>
    </StyledContainer>
  );
};

export default SectionHeaderContent;
