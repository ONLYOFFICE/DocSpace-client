import styled from "styled-components";

export const BoardContainer = styled.section`
  display: grid;

  grid-template-columns: repeat(auto-fit, 270px);
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  gap: 30px;

  width: min-content;
  height: 100%;

  padding-right: 40px;
`;
