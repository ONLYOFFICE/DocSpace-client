import React from "react";

import { RectangleSkeleton } from "../rectangle";
import { StyledRoomTypeListLoader } from "./CreateEditRoom.styled";

const RoomTypeListLoader = () => {
  return (
    <StyledRoomTypeListLoader>
      {[...Array(5).keys()].map((key) => (
        <RectangleSkeleton
          key={key}
          width="100%"
          height="86"
          borderRadius="6"
        />
      ))}
    </StyledRoomTypeListLoader>
  );
};
export default RoomTypeListLoader;
