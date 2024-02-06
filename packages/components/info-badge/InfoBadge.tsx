import React, { useId, useRef, useCallback } from "react";
import type { TooltipRefProps } from "react-tooltip";

import Badge from "../badge";
import IconButton from "../icon-button";

import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";

import {
  InfoBadgeContent,
  InfoBadgeDescription,
  InfoBadgeHeader,
  InfoBadgeTitle,
  StyledToolTip,
} from "./InfoBadge.styled";
import type InfoBadgeProps from "./InfoBadge.props";

function InfoBadge(props: InfoBadgeProps) {
  const id = useId();

  const tooltipRef = useRef<TooltipRefProps>();

  const onClose = useCallback(() => {
    tooltipRef.current?.close();
  }, []);

  return (
    <div>
      <Badge
        noHover
        fontSize="9px"
        isHovered={false}
        borderRadius="50px"
        label={props.label}
        data-tooltip-id={id}
        backgroundColor="#533ED1"
      />
      {/*@ts-ignore */}
      <StyledToolTip
        id={id}
        clickable
        openOnClick
        ref={tooltipRef}
        place={props.place}
        offset={props.offset}
      >
        <InfoBadgeContent>
          <InfoBadgeHeader>
            <InfoBadgeTitle>{props.tooltipTitle}</InfoBadgeTitle>
            <IconButton
              isFill
              size="16"
              onClick={onClose}
              iconName={CrossIcon}
              className="info-badge__close"
            />
          </InfoBadgeHeader>
          {/*@ts-ignore */}
          <InfoBadgeDescription>
            {props.tooltipDescription}
          </InfoBadgeDescription>
        </InfoBadgeContent>
      </StyledToolTip>
    </div>
  );
}

export default InfoBadge;
