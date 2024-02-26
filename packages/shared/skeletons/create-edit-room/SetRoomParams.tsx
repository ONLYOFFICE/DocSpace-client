import React from "react";
import { RectangleSkeleton } from "../rectangle";
import { StyledSetRoomParamsLoader } from "./CreateEditRoom.styled";

const SetRoomParamsLoader = () => {
  return (
    <StyledSetRoomParamsLoader>
      <RectangleSkeleton width="100%" height="86" borderRadius="6" />
      <RectangleSkeleton width="100%" height="53.6" borderRadius="6" />
      <div className="tag_input">
        <RectangleSkeleton width="100%" height="53.6" borderRadius="6" />
        <RectangleSkeleton width="84" height="32" borderRadius="3" />
      </div>
      <RectangleSkeleton width="100%" height="146" borderRadius="4" />
    </StyledSetRoomParamsLoader>
  );
};
export default SetRoomParamsLoader;
