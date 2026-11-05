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

import { DataTableRowCheckbox } from "@onlyoffice/apps-ui-kit/components/data-table";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@onlyoffice/apps-ui-kit/components/combobox";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";

import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import AILimit from "SRC_DIR/components/AILimit";
import { USER_TYPE_DROPDOWN_WIDTH } from "SRC_DIR/helpers/contacts";

import Badges from "../../Badges";

import { useUsersRow } from "./UsersRowContext";
import styles from "./UsersDataTableView.module.scss";

const NAME_COLOR = "var(--people-table-row-name-color)";
const PENDING_NAME_COLOR = "var(--people-table-row-pending-name-color)";
const SIDE_INFO_COLOR = "var(--people-table-row-side-info-color)";

/** The avatar that turns into the checkbox, the name, and the badges. */
export const NameCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  const { item, t } = row;
  const { displayName, email, statusType, isSSO, isLDAP } = item;
  const isPending = statusType === "pending" || statusType === "disabled";

  return (
    <>
      <DataTableRowCheckbox
        // The row's click handler leaves this class alone, as it did the old
        // checkbox, so a click on it does not select the row on its own.
        className={classNames(styles.selection, "table-container_row-checkbox")}
        icon={row.element}
        checked={row.checked}
        loading={row.inProgress}
        label={t("Common:SelectAction")}
        onChange={(checked) => row.onContentRowSelect?.(checked, item)}
        testId={`contacts_users_checkbox_cell_${row.index}`}
      />
      <Text
        as="div"
        title={displayName}
        fontWeight="600"
        fontSize="13px"
        color={isPending ? PENDING_NAME_COLOR : NAME_COLOR}
        className="table-cell_username"
        dir="auto"
        truncate
        data-testid="contacts_users_username_text"
      >
        {statusType === "pending"
          ? email
          : displayName?.trim()
            ? displayName
            : email}
        {row.isMe ? (
          <Text className="me-label" fontWeight="600" fontSize="13px">
            ({t("Common:MeLabel")})
          </Text>
        ) : null}
      </Text>
      <Badges
        statusType={statusType}
        isPaid={row.isPaidUser}
        isSSO={isSSO}
        isLDAP={isLDAP}
      />
    </>
  );
};

/** The user's type, as a list to change it from when that is allowed. */
export const TypeCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  const { item, t, typeOptions } = row;

  if (typeOptions)
    return (
      <ComboBox
        className="type-combobox"
        selectedOption={
          typeOptions.find((option) => option.key === item.role) ||
          ({} as TOption)
        }
        options={typeOptions}
        onSelect={row.onTypeChange}
        scaled={false}
        directionY="both"
        size={ComboBoxSize.content}
        displaySelectedOption
        modernView
        manualWidth={USER_TYPE_DROPDOWN_WIDTH}
      />
    );

  return (
    <Text
      className="plainTextItem"
      title={item.position}
      fontSize="13px"
      fontWeight={600}
      color={SIDE_INFO_COLOR}
      truncate
      noSelect
      dir="auto"
    >
      {getUserTypeTranslation(item.role, t)}
    </Text>
  );
};

/** The user's groups: a link to the one, a list of the first five of many. */
export const GroupsCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  const groups = row.item.groups || [];

  if (groups.length > 1)
    return (
      <ComboBox
        className={classNames(styles.groupsComboBox, "groups-combobox")}
        selectedOption={{
          key: "first-group",
          title: groups[0].name,
          label: `${groups[0].name} `,
        }}
        plusBadgeValue={groups.length - 1}
        onSelect={row.onOpenGroup}
        options={groups.slice(0, 5).map((group) => ({
          key: group.id,
          title: group.name,
          label: group.name,
          action: group.id,
        }))}
        scaled={false}
        directionY="both"
        size={ComboBoxSize.content}
        modernView
        manualWidth="unset"
        optionStyle={{ maxWidth: "400px" }}
        textOverflow
      />
    );

  if (groups.length === 1)
    return (
      <Link
        className="plainTextItem"
        type={LinkType.page}
        title={row.item.email}
        fontSize="13px"
        fontWeight={600}
        color={SIDE_INFO_COLOR}
        onClick={() => row.onOpenGroup({ action: groups[0].id } as TOption)}
        isTextOverflow
        truncate
      >
        {groups[0].name}
      </Link>
    );

  return null;
};

export const EmailCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  return (
    <Link
      type={LinkType.page}
      title={row.item.email}
      fontSize="13px"
      fontWeight={600}
      color={SIDE_INFO_COLOR}
      onClick={row.onEmailClick}
      isTextOverflow
      enableUserSelect
      truncate
      dataTestId="contacts_email_link"
    >
      {row.item.email}
    </Link>
  );
};

export const InviterCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  const name = row.item.createdBy?.displayName;

  return (
    <Text
      title={name}
      fontSize="13px"
      fontWeight={600}
      color={SIDE_INFO_COLOR}
      truncate
      noSelect
      dir="auto"
    >
      {name}
    </Text>
  );
};

export const InvitedDateCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  const { registrationDate, statusType } = row.item;
  const isPending = statusType === "pending" || statusType === "disabled";

  return (
    <Text
      title={registrationDate}
      fontSize="13px"
      fontWeight={600}
      color={SIDE_INFO_COLOR}
      truncate
      noSelect
      dir="auto"
    >
      {isPending ? null : registrationDate}
    </Text>
  );
};

export const StorageCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  return <SpaceQuota hideColumns={false} item={row.item} type="user" />;
};

export const AISpendingCell = () => {
  const row = useUsersRow();
  if (!row) return null;

  return (
    <AILimit item={row.item} dataTestId={`contacts_ai_limit_${row.index}`} />
  );
};
