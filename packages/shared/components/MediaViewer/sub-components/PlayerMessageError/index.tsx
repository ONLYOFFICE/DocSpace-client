import React from "react";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { isSeparator } from "@docspace/shared/utils/typeGuards";

import {
  StyledErrorToolbar,
  StyledMediaError,
} from "./PlayerMessageError.styled";
import type PlayerMessageErrorProps from "./PlayerMessageError.props";

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
        <Text fontSize="15px" color="#fff" textAlign="center" className="title">
          {errorTitle}
        </Text>
      </StyledMediaError>
      {items.length !== 0 && (
        <StyledErrorToolbar>
          {items.map((item) => {
            if (item.disabled || isSeparator(item)) return;

            const onClick = (
              event: React.MouseEvent<HTMLDivElement, MouseEvent>,
            ) => {
              onMaskClick();
              item.onClick?.(event);
            };

            if (!item.icon) return;

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
