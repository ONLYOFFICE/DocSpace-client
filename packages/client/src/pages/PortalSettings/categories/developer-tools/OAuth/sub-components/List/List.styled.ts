import styled from "styled-components";

export const StyledContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;

  .description {
    margin: 0 0 8px;
    line-height: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .add-button {
    width: fit-content;

    margin-bottom: 12px;
  }
`;
