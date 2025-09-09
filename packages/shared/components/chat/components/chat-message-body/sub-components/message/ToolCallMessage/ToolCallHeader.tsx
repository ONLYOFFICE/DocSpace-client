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

import React from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import ToolFinish from "PUBLIC_DIR/images/tool.finish.svg?url";
import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg?url";

import { Text } from "../../../../../../text";
import type {
  ToolCallPlacement,
  ToolCallStatus,
} from "../../../../../Chat.types";
import { Loader, LoaderTypes } from "../../../../../../loader";
import { useTheme } from "../../../../../../../hooks/useTheme";
import { getServerIcon } from "../../../../../../../utils";
import { ServerType } from "../../../../../../../api/ai/enums";
import type { TToolCallContent } from "../../../../../../../api/ai/types";

import styles from "../../../ChatMessageBody.module.scss";

type ToolCallHeaderProps = {
  content: TToolCallContent;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  status: ToolCallStatus;
  placement: ToolCallPlacement;
  expandable?: boolean;
};

export const ToolCallHeader = ({
  content,
  collapsed,
  setCollapsed,
  status,
  placement,
  expandable,
}: ToolCallHeaderProps) => {
  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const statusIcons = {
    loading: <Loader type={LoaderTypes.track} size="12px" />,
    confirmation: <Loader type={LoaderTypes.track} size="12px" />,
    finished: <ReactSVG src={ToolFinish} className={styles.toolFinishIcon} />,
  };

  const statusIcon = placement === "confirmDialog" ? null : statusIcons[status];

  const onClick = () => {
    setCollapsed(!collapsed);
  };

  const serverIcon = getServerIcon(
    content.mcpServerInfo?.serverType || ServerType.Custom,
    isBase,
  );

  return (
    <div
      className={classNames(styles.toolCallHeader, {
        [styles.hide]: collapsed,
        [styles.noClick]: !expandable,
      })}
      onClick={onClick}
    >
      {statusIcon}
      <Text fontSize="13px" lineHeight="15px" fontWeight={600}>
        {t("Common:ToolCallExecuted")}:
      </Text>
      {serverIcon ? (
        <img
          src={serverIcon}
          width="16px"
          height="16px"
          alt="mcp server logo"
        />
      ) : null}
      <Text
        fontSize="13px"
        lineHeight="15px"
        fontWeight={600}
        className={styles.toolName}
      >
        {content.name}
      </Text>
      {expandable ? (
        <ReactSVG src={ArrowRightIcon} className={styles.arrowRightIcon} />
      ) : null}
    </div>
  );
};
