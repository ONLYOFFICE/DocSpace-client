import React, { useId, useRef, useCallback, FC } from "react";
import type { TooltipRefProps } from "react-tooltip";

import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";

import { Badge } from "../badge";
import { IconButton } from "../icon-button";

import {
  InfoBadgeContent,
  InfoBadgeDescription,
  InfoBadgeHeader,
  InfoBadgeTitle,
  StyledToolTip,
} from "./InfoBadge.styled";
import type InfoBadgeProps from "./InfoBadge.types";

export const InfoBadge: FC<InfoBadgeProps> = ({
  label,
  offset,
  place,
  tooltipDescription,
  tooltipTitle,
}) => {
  const id = useId();

  const tooltipRef = useRef<TooltipRefProps>(null);

  const onClose = useCallback(() => {
    tooltipRef.current?.close();
  }, []);

  return (
    <div data-testid="info-badge">
      <Badge
        noHover
        fontSize="9px"
        isHovered={false}
        borderRadius="50px"
        label={label}
        data-tooltip-id={id}
        backgroundColor="#533ED1"
      />

      <StyledToolTip
        id={id}
        clickable
        openOnClick
        place={place}
        offset={offset}
        ref={tooltipRef}
      >
        <InfoBadgeContent>
          <InfoBadgeHeader>
            <InfoBadgeTitle>{tooltipTitle}</InfoBadgeTitle>
            <IconButton
              isFill
              size={16}
              onClick={onClose}
              iconName={CrossIcon}
              className="info-badge__close"
            />
          </InfoBadgeHeader>
          <InfoBadgeDescription>{tooltipDescription}</InfoBadgeDescription>
        </InfoBadgeContent>
      </StyledToolTip>
    </div>
  );
};
