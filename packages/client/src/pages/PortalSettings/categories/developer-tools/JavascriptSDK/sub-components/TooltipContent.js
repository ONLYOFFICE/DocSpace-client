import React from "react";
import { Text } from "@docspace/shared/components/text";
import styled from "styled-components";

import XImg from "PUBLIC_DIR/images/x.react.svg";

const Wrapper = styled.div`
  box-sizing: border-box;

  max-width: 216px;
  width: 100%;
  padding: 8px 4px 16px;
`;

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin-bottom: 8px;

  svg {
    cursor: pointer;
    path {
      fill: #333;
    }
  }
`;

const ImgWrapper = styled.div`
  margin-top: 16px;
`;

export const TooltipContent = ({ title, description, img }) => {
  return (
    <Wrapper>
      <HeaderContainer>
        <Text fontSize="16px" fontWeight={700} lineHeight="22px">
          {title}
        </Text>
        {/* <XImg /> */}
      </HeaderContainer>
      <Text>{description}</Text>
      <ImgWrapper>
        <img src={img} alt={title} />
      </ImgWrapper>
    </Wrapper>
  );
};
