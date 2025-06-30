// (c) Copyright Ascensio System SIA 2009-2025
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
import React, { useMemo, memo, type JSX } from "react";

import classNames from "classnames";

import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";
import BackArrow from "PUBLIC_DIR/images/viewer.media.back.react.svg";
import { Text } from "../../../text";

import { ContextMenu } from "../../../context-menu";

import styles from "./MobileDetails.module.scss";
import type MobileDetailsProps from "./MobileDetails.props";

const MobileDetails = memo(
  ({
    ref,
    icon,
    title,
    isError,
    isPreviewFile,
    isPublicFile,
    onHide,
    onMaskClick,
    onContextMenu,
    contextModel,
  }: MobileDetailsProps): JSX.Element => {
    const contextMenuHeader = useMemo(
      () => ({
        icon,
        color: "",
        title,
      }),
      [icon, title],
    );

    return (
      <div
        className={classNames(styles.container)}
        role="dialog"
        aria-label={title}
      >
        {!isPublicFile ? (
          <BackArrow
            className={styles.mobileClose}
            onClick={onMaskClick}
            data-test-id="mobile-details-back"
            role="button"
            aria-label="Back"
          />
        ) : null}
        <Text
          fontSize="14px"
          className={styles.title}
          data-test-id="mobile-details-title"
        >
          {title}
        </Text>
        {!isPreviewFile && !isError ? (
          <div className="details-context">
            <MediaContextMenu
              className={styles.mobileContext}
              onClick={onContextMenu}
              data-test-id="mobile-details-context"
              role="button"
              aria-label="Open context menu"
            />
            <ContextMenu
              ref={ref}
              model={[]}
              withBackdrop
              onHide={onHide}
              header={contextMenuHeader}
              getContextModel={contextModel}
              data-test-id="mobile-details-context-menu"
            />
          </div>
        ) : null}
      </div>
    );
  },
);

MobileDetails.displayName = "MobileDetails";

export { MobileDetails };
