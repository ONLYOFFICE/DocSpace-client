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

import classNames from "classnames";

import type { TGroup } from "@docspace/shared/api/groups/types";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@onlyoffice/apps-ui-kit/components/avatar";
import { DataTableRowCheckbox } from "@onlyoffice/apps-ui-kit/components/data-table";
import { Link } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import Badges from "../../Badges";

import { useGroupsRow } from "./GroupsRowContext";
import styles from "./GroupsDataTableView.module.scss";

const SIDE_COLOR = "var(--files-section-table-view-row-side-color)";

type TCellProps = { group: TGroup };

/** The avatar that turns into the checkbox, the title, and the badges. */
export const NameCell = ({ group, index }: TCellProps & { index: number }) => {
  const row = useGroupsRow();
  if (!row) return null;

  return (
    <>
      <DataTableRowCheckbox
        // The row's click handler leaves this class alone, as it did the old
        // checkbox, so a click on it does not select the row on its own.
        className={classNames(styles.selection, "table-container_row-checkbox")}
        icon={
          <Avatar
            className="avatar"
            size={AvatarSize.min}
            userName={group.name}
            isGroup
            role={AvatarRole.user}
            source=""
            dataTestId={`contacts_table_groups_avatar_${index}`}
          />
        }
        checked={row.checked}
        label={row.t("Common:SelectAction")}
        onChange={row.onSelect}
        testId={`contacts_table_groups_checkbox_${index}`}
      />
      <Link
        onClick={row.onOpen}
        title={group.name}
        fontWeight="600"
        fontSize="13px"
        isTextOverflow
        className="table-cell_group-manager"
        truncate
        dataTestId={`contacts_table_groups_name_link_${index}`}
      >
        {group.name}
      </Link>
      <Badges isLDAP={group.isLDAP} />
    </>
  );
};

export const MembersCell = ({ group }: TCellProps) => (
  <Text
    title={group.membersCount.toString()}
    fontWeight="600"
    fontSize="13px"
    className="table-cell_group-people"
    color={SIDE_COLOR}
  >
    {group.membersCount}
  </Text>
);

export const ManagerCell = ({ group }: TCellProps) => (
  <Text
    title={group.manager?.displayName}
    fontWeight="600"
    fontSize="13px"
    className="table-cell_group-manager"
    color={SIDE_COLOR}
    dir="auto"
    truncate
  >
    {group.manager?.displayName}
  </Text>
);
