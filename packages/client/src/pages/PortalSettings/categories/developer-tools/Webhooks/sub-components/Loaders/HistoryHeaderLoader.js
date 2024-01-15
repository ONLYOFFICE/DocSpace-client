import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const LoaderWrapper = styled.div`
  width: 100%;
  margin-top: 5px;
  margin-bottom: 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filterButton,
  .configName {
    border-radius: 3px;
  }
`;

export const HistoryHeaderLoader = () => {
  return (
    <LoaderWrapper>
      <RectangleSkeleton width="118px" height="22px" className="configName" />

      <RectangleSkeleton width="32px" height="22px" className="filterButton" />
    </LoaderWrapper>
  );
};
