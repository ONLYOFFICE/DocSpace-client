import React from "react";
import styled from "styled-components";
import { tablet, mobile } from "@docspace/components/utils/device";

import Base from "../themes/base";

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: ${(props) => props.theme.formWrapper.background};
  box-shadow: ${(props) => props.theme.formWrapper.boxShadow};
  border-radius: 12px;
  max-width: 320px;
  min-width: 320px;

  @media ${tablet} {
    max-width: 416px;
    min-width: 416px;
  }

  @media ${mobile} {
    padding: 0;
    border-radius: 0;
    box-shadow: none !important;
    max-width: 100%;
    min-width: 100%;
    background: transparent !important;
  }
`;

StyledWrapper.defaultProps = { theme: Base };

const FormWrapper = (props) => {
  const { children } = props;
  return <StyledWrapper {...props}>{children}</StyledWrapper>;
};

FormWrapper.defaultProps = { theme: Base };

export default FormWrapper;
