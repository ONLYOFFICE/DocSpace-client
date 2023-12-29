import React from "react";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components";
import PlayerMessageErrorProps from "./PlayerMessageError.props";
import {
  StyledErrorToolbar,
  StyledMediaError,
} from "./PlayerMessageError.styled";
import { isSeparator } from "../../helpers";

function PlayerMessageError({
  model,
  isMobile,
  errorTitle,
  onMaskClick,
}: PlayerMessageErrorProps) {
  const items = !isMobile
    ? model.filter((el) => el.key !== "rename")
    : model.filter((el) => el.key === "delete" || el.key === "download");

  return (
    <div>
      <StyledMediaError>
        {/*@ts-ignore*/}
        <Text
          fontSize="15px"
          color={"#fff"}
          textAlign="center"
          className="title"
        >
          {errorTitle}
        </Text>
      </StyledMediaError>
      {items.length !== 0 && (
        <StyledErrorToolbar>
          {items.map((item) => {
            if (item.disabled || isSeparator(item)) return;

            const onClick = () => {
              onMaskClick();
              item.onClick();
            };
            return (
              <div className="toolbar-item" key={item.key} onClick={onClick}>
                <ReactSVG src={item.icon} />
              </div>
            );
          })}
        </StyledErrorToolbar>
      )}
    </div>
  );
}

export default PlayerMessageError;
