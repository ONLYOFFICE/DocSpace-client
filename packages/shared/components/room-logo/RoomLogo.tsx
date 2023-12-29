import React from "react";

import { isMobile } from "react-device-detect";

import ArchiveSvg32Url from "PUBLIC_DIR/images/icons/32/room/archive.svg?url";
import CustomSvg32Url from "PUBLIC_DIR/images/icons/32/room/custom.svg?url";
import EditingSvg32Url from "PUBLIC_DIR/images/icons/32/room/editing.svg?url";
// import FillingFormSvg32Url from "PUBLIC_DIR/images/icons/32/room/filling.form.svg?url";
// import ReviewSvg32Url from "PUBLIC_DIR/images/icons/32/room/review.svg?url";
// import ViewOnlySvg32Url from "PUBLIC_DIR/images/icons/32/room/view.only.svg?url";
import PublicRoomSvg32Url from "PUBLIC_DIR/images/icons/32/room/public.svg?url";

import { RoomsType } from "../../enums";

import { Checkbox } from "../checkbox";

import { StyledContainer, StyledLogoContainer } from "./RoomLogo.styled";
import { RoomLogoProps } from "./RoomLogo.types";

const RoomLogoPure = ({
  id,
  className,
  style,
  type,

  isArchive,
  withCheckbox,
  isChecked,
  isIndeterminate,
  onChange,
}: RoomLogoProps) => {
  const getIcon = () => {
    if (isArchive) {
      return ArchiveSvg32Url;
    }

    switch (type) {
      //   case RoomsType.ReadOnlyRoom:
      //     return ViewOnlySvg32Url;
      //   case RoomsType.ReviewRoom:
      //     return ReviewSvg32Url;
      //   case RoomsType.FillingFormsRoom:
      //     return FillingFormSvg32Url;
      case RoomsType.EditingRoom:
        return EditingSvg32Url;
      case RoomsType.CustomRoom:
        return CustomSvg32Url;
      case RoomsType.PublicRoom:
        return PublicRoomSvg32Url;
      default:
        return "";
    }
  };

  const onSelect = () => {
    if (!isMobile) return;

    onChange?.();
  };

  const icon = getIcon();

  return (
    <StyledContainer
      id={id}
      className={className}
      style={style}
      data-testid="room-logo"
    >
      <StyledLogoContainer
        className="room-logo_icon-container"
        onClick={onSelect}
      >
        <img className="room-logo_icon" alt="room-logo" src={icon} />
      </StyledLogoContainer>

      {withCheckbox && (
        <Checkbox
          className="room-logo_checkbox checkbox"
          isChecked={isChecked}
          isIndeterminate={isIndeterminate}
          onChange={onChange}
        />
      )}
    </StyledContainer>
  );
};

RoomLogoPure.defaultProps = {
  isPrivacy: false,
  isArchive: false,
  withCheckbox: false,
  isChecked: false,
  isIndeterminate: false,
};

export { RoomLogoPure };

const RoomLogo = React.memo(RoomLogoPure);

export { RoomLogo };
