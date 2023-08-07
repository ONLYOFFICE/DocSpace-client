import React from "react";
import moment from "moment";

import Text from "@docspace/components/text";

import { StyledMainInfo } from "../StyledComponent";
const MainInfoComponent = ({ portalInfo, activeUsersCount }) => {
  return (
    <StyledMainInfo>
      <Text
        fontSize={"14px"}
        fontWeight={700}
        color={"#555F65"}
      >{`Portal Created date: ${moment(portalInfo.creationDateTime).format(
        "l"
      )}`}</Text>
      <Text
        fontSize={"14px"}
        fontWeight={700}
        color={"#555F65"}
      >{`Number of active employees: ${activeUsersCount}`}</Text>
    </StyledMainInfo>
  );
};

export default MainInfoComponent;
