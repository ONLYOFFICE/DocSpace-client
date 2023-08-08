import React from "react";
import moment from "moment";

import Text from "@docspace/components/text";

import { StyledMainInfo } from "../StyledComponent";
const MainInfoComponent = (props) => {
  const { portalInfo, activeUsersCount } = props;

  const creationDate = moment(portalInfo.creationDateTime).format("l");

  return (
    <StyledMainInfo>
      <Text
        fontSize={"14px"}
        fontWeight={700}
        color={"#555F65"}
      >{`Portal Created date: ${creationDate}`}</Text>
      <Text
        fontSize={"14px"}
        fontWeight={700}
        color={"#555F65"}
      >{`Number of active employees: ${activeUsersCount}`}</Text>
    </StyledMainInfo>
  );
};

export default MainInfoComponent;
