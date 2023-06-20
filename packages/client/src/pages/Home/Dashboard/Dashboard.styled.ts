import styled from "styled-components";

export const DashboardContainer = styled.section`
  display: grid;

  grid-template-columns: repeat(auto-fit, 264px);
  grid-auto-flow: column;
  gap: 30px;

  width: min-content;
  height: 100%;

  padding-right: 20px;
`;
