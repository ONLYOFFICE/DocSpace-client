/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { isMobile as isMobileDevice } from "react-device-detect";
import React, { useId } from "react";
import { useTranslation } from "react-i18next";

import { IconButton } from "../icon-button";
import { classNames } from "../../utils";
import { Tooltip } from "../tooltip";
import { Link, LinkType } from "../link";
import { Text } from "../text";
import ButtonAlertIconSvgUrl from "PUBLIC_DIR/images/button.alert.react.svg?url";
import LoadErrorIconSvgUrl from "PUBLIC_DIR/images/load.error.react.svg?url";

import styles from "./FailedVectorizationBadge.module.scss";

type Props = {
  className?: string;
  size?: "small" | "medium";

  withRetryVectorization?: boolean;
  onRetryVectorization?: () => void;
};

export const FailedVectorizationBadge = ({
  size = "small",
  onRetryVectorization,
  className,
  withRetryVectorization,
}: Props) => {
  const { t } = useTranslation("Common");
  const tooltipId = useId();

  const iconAlert =
    size === "small" ? ButtonAlertIconSvgUrl : LoadErrorIconSvgUrl;

  const getAlertTooltipContent = () => {
    return (
      <div>
        <Text fontWeight={600} fontSize="12px" lineHeight="16px">
          {t("Common:PreparationForAIFailed")}
        </Text>
        <Text fontSize="12px" lineHeight="16px">
          {t("Common:PreparationForAIFailedInfo")}
        </Text>
        {withRetryVectorization ? (
          <Link
            type={LinkType.action}
            fontWeight={600}
            onClick={onRetryVectorization}
          >
            {t("Common:TryAgain")}
          </Link>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <IconButton
        data-tooltip-id={tooltipId}
        iconName={iconAlert}
        className={classNames(styles.badge, className, {
          [styles.small]: size === "small",
          [styles.medium]: size === "medium",
        })}
      />
      <Tooltip
        id={tooltipId}
        className="not-selectable"
        getContent={getAlertTooltipContent}
        place="bottom-start"
        clickable
        maxWidth="302px"
        openOnClick={isMobileDevice}
      />
    </>
  );
};
