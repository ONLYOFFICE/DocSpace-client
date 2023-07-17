import React from "react";
import styled, { css } from "styled-components";

import Link from "@docspace/components/link";
import NoUserSelect from "@docspace/components/utils/commonStyles";
import Base from "@docspace/components/themes/base";

const StyledButtonWrapper = styled.div`
  width: 340px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  box-sizing: border-box;

  border-radius: 6px;
  border: 1px solid #d0d5da;
  ${NoUserSelect};

  :hover {
    border-color: #4781d1;
    cursor: pointer;
  }

  :active {
    background-color: ${(props) => props.theme.button.backgroundColor.baseActive};

    color: ${(props) => props.theme.button.color.baseActive};

    ${() => css`
      border: ${(props) => props.theme.button.border.primaryActive};
      box-sizing: ${(props) => props.theme.button.boxSizing};
    `}
  }
`;

StyledButtonWrapper.defaultProps = { theme: Base };

export const IntegrationButton = ({ icon, onClick }) => {
  return (
    <StyledButtonWrapper onClick={onClick}>
      <img src={icon} />
      <Link type="page" isHovered color="#4781D1" fontWeight={600} lineHeight={15}>
        Import
      </Link>
    </StyledButtonWrapper>
  );
};
