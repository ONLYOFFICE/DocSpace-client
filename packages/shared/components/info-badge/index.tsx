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

import React, { useId, useRef, useCallback, FC } from "react";
import type { TooltipRefProps } from "react-tooltip";

import CrossIcon from "PUBLIC_DIR/images/cross.edit.react.svg?url";

import { Badge } from "../badge";
import { IconButton } from "../icon-button";
import { Tooltip } from "../tooltip";

import styles from "./InfoBadge.module.scss";
import type InfoBadgeProps from "./InfoBadge.types";
import { globalColors } from "../../themes";

const InfoBadge: FC<InfoBadgeProps> = ({
  label,
  offset,
  place = "bottom",
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
        backgroundColor={globalColors.mainPurple}
      />

      {tooltipDescription && tooltipTitle ? (
        <Tooltip
          id={id}
          ref={tooltipRef}
          place={place}
          offset={offset || 10}
          clickable
          openOnClick
          className={styles.tooltip}
          aria-labelledby={id}
          data-testid="info-tooltip"
        >
          <div className={styles.content}>
            <div className={styles.header}>
              <h3 className={styles.title} data-testid="tooltip-title">
                {tooltipTitle}
              </h3>
              <IconButton
                isFill
                size={16}
                onClick={onClose}
                iconName={CrossIcon}
                className={styles.close}
              />
            </div>
            <p className={styles.description} data-testid="tooltip-description">
              {tooltipDescription}
            </p>
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
};

InfoBadge.displayName = "InfoBadge";

export { InfoBadge };
