// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

/* eslint-disable react/prop-types */
import React, { useMemo, forwardRef, memo, ForwardedRef } from "react";

import { Text } from "@docspace/shared/components/text";
import {
  ContextMenu,
  TContextMenuRef,
} from "@docspace/shared/components/context-menu";

import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";
import BackArrow from "PUBLIC_DIR/images/viewer.media.back.react.svg";

import { StyledMobileDetails } from "../../MediaViewer.styled";

import type MobileDetailsProps from "./MobileDetails.props";
import { globalColors } from "../../../../themes";

const MobileDetails = memo(
  forwardRef(
    (
      {
        icon,
        title,
        isError,
        isPreviewFile,
        isPublicFile,
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
          {!isPublicFile && (
            <BackArrow className="mobile-close" onClick={onMaskClick} />
          )}
          <Text fontSize="14px" color={globalColors.white} className="title">
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

export { MobileDetails };
