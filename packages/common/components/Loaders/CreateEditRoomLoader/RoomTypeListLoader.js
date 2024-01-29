import React from "react";
import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const StyledRoomTypeListLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const RoomTypeListLoader = ({}) => {
  return (
    <StyledRoomTypeListLoader>
      {[...Array(5).keys()].map((key) => (
        <RectangleSkeleton
          key={key}
          width={"100%"}
          height={"86"}
          borderRadius={"6"}
        />
      ))}
    </StyledRoomTypeListLoader>
  );
};
export default RoomTypeListLoader;
