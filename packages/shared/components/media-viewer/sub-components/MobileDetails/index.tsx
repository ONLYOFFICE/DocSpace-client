/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo, memo, type JSX } from "react";

import classNames from "classnames";

import MediaContextMenu from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg";
import BackArrow from "PUBLIC_DIR/images/viewer.media.back.react.svg";
import { Text } from "@docspace/ui-kit/components/text";

import { ContextMenu } from "@docspace/ui-kit/components/context-menu";

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
