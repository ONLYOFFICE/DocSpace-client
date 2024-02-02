import React from "react";

import ViewerMediaCloseSvgUrl from "PUBLIC_DIR/images/viewer.media.close.svg?url";

import { Text } from "@docspace/shared/components/text";
import { IconButton } from "@docspace/shared/components/icon-button";

import { ControlBtn } from "../../MediaViewer.styled";

import type { DesktopDetailsProps } from "./DesktopDetails.type";
import { DesktopDetailsContainer } from "./DesktopDetails.styled";

export const DesktopDetails = ({
  onMaskClick,
  title,
  className,
}: DesktopDetailsProps) => {
  return (
    <DesktopDetailsContainer className={className}>
      <Text dir="auto" isBold fontSize="14px" className="title">
        {title}
      </Text>
      <ControlBtn onClick={onMaskClick} className="mediaPlayerClose">
        <IconButton
          color="#fff"
          iconName={ViewerMediaCloseSvgUrl}
          size={28}
          isClickable
        />
      </ControlBtn>
    </DesktopDetailsContainer>
  );
};
