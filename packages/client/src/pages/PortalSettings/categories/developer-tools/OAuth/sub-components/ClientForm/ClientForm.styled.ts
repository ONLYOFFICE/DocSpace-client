import styled from "styled-components";

const Container = styled.div`
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

export {
  Container,
  BlockContainer,
  HeaderRaw,
  InputGroup,
  InputRaw,
  CheckboxGroup,
  CheckboxRaw,
};
