import styled, { css } from "styled-components";

const StyledWrapper = styled.div`
  max-width: 660px;

  width: 100%;

  display: grid;
  grid-gap: 32px;

  .toggle-btn-wrapper {
    display: flex;
    //gap: 8px;
  }

  .toggle-btn {
    height: 20px;
    line-height: 20px;
    position: relative;

    & > svg {
      margin-top: 2px;
    }
  }

  .heading {
    margin-bottom: -2px;
    margin-top: 0;
  }

  .settings-section {
    display: grid;
    grid-gap: 12px;
  }
`;

export default StyledWrapper;
