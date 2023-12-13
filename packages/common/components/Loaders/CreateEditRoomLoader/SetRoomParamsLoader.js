import React from "react";
import styled from "styled-components";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const StyledSetRoomParamsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .tag_input {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const SetRoomParamsLoader = ({}) => {
  return (
    <StyledSetRoomParamsLoader>
      <RectangleSkeleton width={"100%"} height={"86"} borderRadius={"6"} />
      <RectangleSkeleton width={"100%"} height={"53.6"} borderRadius={"6"} />
      <div className="tag_input">
        <RectangleSkeleton width={"100%"} height={"53.6"} borderRadius={"6"} />
        <RectangleSkeleton width={"84"} height={"32"} borderRadius={"3"} />
      </div>
      <RectangleSkeleton width={"100%"} height={"146"} borderRadius={"4"} />
    </StyledSetRoomParamsLoader>
  );
};
export default SetRoomParamsLoader;
