import styled from "styled-components";
import Circle from "../CircleLoader";
import Rectangle from "../RectangleLoader";

export const LoadersCircle = styled(Circle)`
  grid-area: circles;
`;
export const LoadersTitle = styled(Rectangle)`
  grid-area: title;
`;
export const LoadersUser = styled(Rectangle)`
  grid-area: users;
`;

export const DashboardLoaderContainer = styled.section`
  display: grid;

  grid-template-columns: repeat(auto-fit, 264px);
  grid-auto-flow: column;
  gap: 30px;

  width: min-content;
  height: 100%;

  padding-right: 20px;
`;
