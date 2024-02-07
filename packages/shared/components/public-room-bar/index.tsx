import React from "react";
import { ReactSVG } from "react-svg";
import PeopleIcon from "PUBLIC_DIR/images/people.react.svg?url";

import { Text } from "../text";

import { StyledPublicRoomBar } from "./PublicRoomBar.styled";
import { PublicRoomBarProps } from "./PublicRoomBar.types";

const PublicRoomBar = (props: PublicRoomBarProps) => {
  const { headerText, bodyText, iconName, onClose, ...rest } = props;

  return (
    <StyledPublicRoomBar {...rest}>
      <div className="text-container">
        <div className="header-body">
          <div className="header-icon">
            <ReactSVG src={iconName || PeopleIcon} />
          </div>
          <Text className="text-container_header" fontWeight={600}>
            {headerText}
          </Text>
        </div>
        <Text className="text-container_body" fontSize="12px" fontWeight={400}>
          {bodyText}
        </Text>
      </div>

      {/* <IconButton
        className="close-icon"
        size={8}
        iconName={CrossReactSvg}
        onClick={onClose}
      /> */}
    </StyledPublicRoomBar>
  );
};

export default PublicRoomBar;
