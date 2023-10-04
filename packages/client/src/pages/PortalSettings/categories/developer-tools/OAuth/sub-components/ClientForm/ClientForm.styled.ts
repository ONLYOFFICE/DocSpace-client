import styled from "styled-components";

//@ts-ignore
import Box from "@docspace/components/box";
import { hugeMobile, tablet } from "@docspace/components/utils/device";

const Container = styled.div`
  width: 100%;

  display: grid;
  grid-template-columns: 350px 350px;

  gap: 16px;

  .preview-container {
    margin-top: 16px;

    width: fit-content;
    min-width: 350px;
    height: fit-content;

    border: 1px solid #a3aeae;
    border-radius: 6px;

    padding: 16px;
  }
`;

const FormContainer = styled.div`
  max-width: 350px;

  display: flex;
  flex-direction: column;
  gap: 20px;

  .button-container {
    width: 100;
    display: flex;

    flex-direction: raw;
    gap: 8px;
  }
`;

const BlockContainer = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HeaderRaw = styled.div`
  width: 100%;

  display: flex;
  flex-direction: raw;
  gap: 4px;

  align-items: center;

  div {
    height: 12px;
  }
`;

const InputGroup = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InputRaw = styled.div`
  width: 100%;

  display: flex;
  flex-direction: raw;
  justify-content: space-between;

  gap: 8px;

  input {
    user-select: none;
  }
`;

const CheckboxGroup = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxRaw = styled.div`
  width: 100%;
  height: auto;

  display: flex;
  flex-direction: raw;
  align-items: center;
  gap: 8px;

  .checkbox {
    margin-right: 0px;
  }
`;

const Frame = styled(Box)`
  margin-top: 16px;
  position: relative;

  display: flex;
  justify-content: center;

  button {
    width: auto;
    max-width: auto;

    padding: 0 20px;
  }
`;

const CategorySubHeader = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 16px;

  @media ${tablet} {
    &:not(&.copy-window-code) {
      margin-bottom: 0;
    }
  }

  @media ${hugeMobile} {
    &:first-of-type {
      margin-top: 0;
    }
  }
`;

export {
  Container,
  FormContainer,
  BlockContainer,
  HeaderRaw,
  InputGroup,
  InputRaw,
  CheckboxGroup,
  CheckboxRaw,
  Frame,
  CategorySubHeader,
};
