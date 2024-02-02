/* eslint-disable react/prop-types */
import React, { useMemo, forwardRef, memo, ForwardedRef } from "react";

import { Text } from "@docspace/shared/components/text";
import {
  ContextMenu,
  TContextMenuRef,
} from "@docspace/shared/components/context-menu";

import MediaContextMenu from "PUBLIC_DIR/images/vertical-dots.react.svg";
import BackArrow from "PUBLIC_DIR/images/viewer.media.back.react.svg";

import { StyledMobileDetails } from "../../MediaViewer.styled";

import type MobileDetailsProps from "./MobileDetails.props";

export const MobileDetails = memo(
  forwardRef(
    (
      {
        icon,
        title,
        isError,
        isPreviewFile,
        onHide,
        onMaskClick,
        onContextMenu,
        contextModel,
      }: MobileDetailsProps,
      ref: ForwardedRef<TContextMenuRef>,
    ): JSX.Element => {
      const contextMenuHeader = useMemo(
        () => ({
          icon,
          title,
        }),
        [icon, title],
      );

      return (
        <StyledMobileDetails>
          <BackArrow className="mobile-close" onClick={onMaskClick} />
          <Text fontSize="14px" color="#fff" className="title">
            {title}
          </Text>
          {!isPreviewFile && !isError && (
            <div className="details-context">
              <MediaContextMenu
                className="mobile-context"
                onClick={onContextMenu}
              />
              <ContextMenu
                ref={ref}
                model={[]}
                withBackdrop
                onHide={onHide}
                header={contextMenuHeader}
                getContextModel={contextModel}
              />
            </div>
          )}
        </StyledMobileDetails>
      );
    },
  ),
);

MobileDetails.displayName = "MobileDetails";
