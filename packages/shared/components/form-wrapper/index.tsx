import React from "react";
import styled from "styled-components";
import { tablet, mobile } from "../../utils";
import { Base } from "../../themes";

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

interface FormWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FormWrapper = (props: FormWrapperProps) => {
  const { children } = props;
  return <StyledWrapper {...props}>{children}</StyledWrapper>;
};

export { FormWrapper };
