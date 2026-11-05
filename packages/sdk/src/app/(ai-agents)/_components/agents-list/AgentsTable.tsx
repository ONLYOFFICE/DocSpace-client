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

// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { decode } from "he";
import type { TFunction } from "i18next";

import type { TAgent } from "@docspace/shared/api/ai/types";
import {
  DataTableRow,
  contextMenuColumn,
  createLocalStorageWidths,
  type DataTableColumn,
  type DataTableRenderRowProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@onlyoffice/apps-ui-kit/components/avatar";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import DefaultUserPhotoSize32PngUrl from "PUBLIC_DIR/images/default_user_photo_size_32-32.png";

import {
  SDK_TABLE_TEST_IDS,
  SdkDataTable,
  getColumnWidthsStorageName,
} from "@/app/(docspace)/_components/data-table";

import { useAgentsListStore, useAgentsUserStore } from "../../_store";
import { formatCreated } from "../../_helpers/formatCreated";
import useAgentContextOptions from "./useAgentContextOptions";
import styles from "./AgentsList.module.scss";

const COLUMN_WIDTHS_PREFIX = "ai-agents-table";

const getRowKey = (agent: TAgent) => agent.id;

const cellTestId = () => SDK_TABLE_TEST_IDS.cell;

const getColumns = (
  t: TFunction,
  goToAgent: (id: TAgent["id"]) => void,
): DataTableColumn<TAgent>[] => [
  {
    id: "Name",
    title: t("Common:Name", { defaultValue: "Name" }),
    width: { type: "fill" },
    cellClassName: "table-container_file-name-cell",
    cellTestId,
    cell: (agent) => {
      const logo = agent.logo;
      return (
        <div className={styles.tableTitleCell}>
          <RoomIcon
            title={agent.title}
            color={logo?.color}
            logo={logo}
            size="32px"
            radius="6px"
            showDefault={!(logo?.cover || logo?.medium)}
            imgClassName="react-svg-icon"
          />
          <Link
            type={LinkType.page}
            title={agent.title}
            fontWeight={600}
            fontSize="13px"
            truncate
            isTextOverflow
            onClick={() => goToAgent(agent.id)}
          >
            {agent.title}
          </Link>
        </div>
      );
    },
  },
  {
    id: "Activity",
    title: t("Common:LastModifiedDate", { defaultValue: "Last activity" }),
    width: { type: "flex" },
    cellTestId,
    cell: (agent) => (
      <Text fontSize="12px" fontWeight={600} truncate>
        {formatCreated(agent.created)}
      </Text>
    ),
  },
  {
    id: "Owner",
    title: t("Common:Owner", { defaultValue: "Owner" }),
    width: { type: "flex" },
    cellTestId,
    cell: (agent) => {
      const createdBy = agent.createdBy;
      const ownerName = createdBy?.displayName
        ? decode(createdBy.displayName)
        : "";
      const ownerAvatar =
        createdBy?.hasAvatar && createdBy?.avatarSmall
          ? createdBy.avatarSmall
          : DefaultUserPhotoSize32PngUrl;

      return (
        <div className={styles.tableOwnerCell}>
          <Avatar
            source={ownerAvatar}
            role={AvatarRole.user}
            size={AvatarSize.min}
          />
          <Text fontSize="12px" fontWeight={600} title={ownerName} truncate>
            {ownerName}
          </Text>
        </div>
      );
    },
  },
  contextMenuColumn<TAgent>({
    contextMenuButtonTestId: SDK_TABLE_TEST_IDS.contextMenuButton,
  }),
];

type AgentsTableRowProps = DataTableRenderRowProps<TAgent> & {
  goToAgent: (id: TAgent["id"]) => void;
};

/** A row that follows the agent's selection in the list store. */
const AgentsTableRow = observer(
  ({ row, index, rowProps, goToAgent }: AgentsTableRowProps) => {
    const store = useAgentsListStore();
    const getContextOptions = useAgentContextOptions();
    const options = getContextOptions(row);

    return (
      <DataTableRow
        {...rowProps}
        row={row}
        index={index}
        testId={SDK_TABLE_TEST_IDS.row}
        checked={store.isSelected(row.id)}
        contextMenu={{ options, getModel: () => options }}
        onClick={() => goToAgent(row.id)}
      />
    );
  },
);

/**
 * The AI agents list on the ui-kit DataTable: the agent, its last activity and
 * its owner, with the row menu. No sorting and no column settings, as in the
 * old table; widths are remembered per user.
 */
const AgentsTable = ({
  agents,
  goToAgent,
}: {
  agents: TAgent[];
  goToAgent: (id: TAgent["id"]) => void;
}) => {
  const { t } = useTranslation(["Common", "Files"]);
  const { user } = useAgentsUserStore();

  const columns = React.useMemo(() => getColumns(t, goToAgent), [t, goToAgent]);

  const widthStorage = React.useMemo(
    () =>
      createLocalStorageWidths(
        getColumnWidthsStorageName(COLUMN_WIDTHS_PREFIX, user?.id),
      ),
    [user?.id],
  );

  const renderRow = React.useCallback(
    (props: DataTableRenderRowProps<TAgent>) => (
      <AgentsTableRow {...props} goToAgent={goToAgent} />
    ),
    [goToAgent],
  );

  return (
    <SdkDataTable<TAgent>
      ariaLabel={t("Common:AIAgents")}
      columns={columns}
      rows={agents}
      getRowKey={getRowKey}
      widthStorage={widthStorage}
      renderRow={renderRow}
    />
  );
};

export default observer(AgentsTable);
