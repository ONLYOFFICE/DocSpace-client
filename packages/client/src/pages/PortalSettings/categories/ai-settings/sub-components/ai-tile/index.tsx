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

import { useId } from "react";
import classNames from "classnames";

import { Heading, HeadingLevel } from "@docspace/shared/components/heading";
import { Tooltip } from "@docspace/shared/components/tooltip";

import LoadErrorIcon from "PUBLIC_DIR/images/load.error.react.svg";

import styles from "./AiTile.module.scss";

type AiTileProps = {
  icon: string | React.ReactNode;
  children: React.ReactNode;
  tooltipText?: string;
};

export const AiTile = ({ icon, children, tooltipText }: AiTileProps) => {
  const tooltipId = useId();

  const dataTooltipProps = tooltipText
    ? { "data-tooltip-id": tooltipId, "data-tooltip-content": tooltipText }
    : {};

  return (
    <div className={styles.aiTile} {...dataTooltipProps}>
      <div className={styles.icon}>
        {typeof icon === "string" ? (
          <img src={icon} alt="ai tile icon" />
        ) : (
          icon
        )}
      </div>
      <div className={styles.content}>{children}</div>

      {tooltipText ? (
        <Tooltip id={tooltipId} place="bottom" offset={10} float />
      ) : null}
    </div>
  );
};

type HeaderProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  hasError?: boolean;
  getErrorTooltipContent?: () => React.ReactNode;
};

const Header = ({
  title,
  children,
  className,
  hasError,
  getErrorTooltipContent,
}: HeaderProps) => {
  const tooltipId = useId();

  return (
    <div className={classNames(styles.header, className)}>
      <div className={styles.titleBlock}>
        <Heading
          className={styles.heading}
          level={HeadingLevel.h3}
          fontSize="16px"
          fontWeight={700}
          lineHeight="22px"
          truncate
        >
          {title}
        </Heading>

        {hasError ? (
          <>
            <LoadErrorIcon data-tooltip-id={tooltipId} />
            <Tooltip
              id={tooltipId}
              place="bottom"
              offset={15}
              getContent={getErrorTooltipContent}
            />
          </>
        ) : null}
      </div>

      {children}
    </div>
  );
};

const Body = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.body}>{children}</div>
);

AiTile.Header = Header;
AiTile.Body = Body;
