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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TableCell, TableRow } from "@docspace/ui-kit/components/table";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { EmployeeType } from "@docspace/shared/enums";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/ui-kit/components/combobox";
import { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import withContent from "SRC_DIR/HOCs/withPeopleContent";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";
import { USER_TYPE_DROPDOWN_WIDTH } from "SRC_DIR/helpers/contacts";

import Badges from "../../Badges";

import classNames from "classnames";

import { TableRowProps, TableRowStores } from "./TableView.types";
import styles from "./TableView.module.scss";

const PeopleTableRow = ({
  item,
  getContextModel,
  element,
  checkedProps,
  onContentRowSelect,
  onContentRowClick,
  onEmailClick,
  onUserContextClick,
  getUsersChangeTypeOptions,

  changeUserType,

  isActive,
  canChangeUserType,
  hideColumns,
  value,
  standalone,
  onOpenGroup,
  showStorageInfo,

  typeColumnIsEnabled,
  groupColumnIsEnabled,
  emailColumnIsEnabled,
  invitedDateColumnIsEnabled,
  inviterColumnIsEnabled,
  storageColumnIsEnabled,

  contactsTab,
  isRoomAdmin,
  inProgress,
  itemIndex,
  withContentSelection,
  isMe,
}: TableRowProps) => {
  const { t } = useTranslation(["People", "Common", "Settings"]);

  const {
    displayName,
    email,
    statusType,

    position,

    role,
    isVisitor,
    isCollaborator,
    isSSO,
    isLDAP,

    id,
  } = item;

  const isGuests = contactsTab === "guests";
  const isInsideGroup = contactsTab === "inside_group";
  const isPending = statusType === "pending" || statusType === "disabled";

  const nameColor = isPending
    ? "var(--people-table-row-pending-name-color)"
    : "var(--people-table-row-name-color)";
  const sideInfoColor = "var(--people-table-row-side-info-color)";

  const getTypesOptions = React.useCallback(() => {
    const options = getUsersChangeTypeOptions!(t, item);

    return options;
  }, [getUsersChangeTypeOptions, item, t]);

  const onTypeChange = React.useCallback(
    (option: TOption) => {
      if (!option.action || option.key === role) return;

      changeUserType(option.action as EmployeeType, [item]);
    },
    [item, changeUserType],
  );

  const onOpenGroupClick = React.useCallback(
    ({ action, title }: TOption) =>
      onOpenGroup!(action as string, !isInsideGroup, title),
    [onOpenGroup],
  );

  const typeLabel = getUserTypeTranslation(role, t);

  const isChecked = checkedProps!.checked;

  const renderGroupsCell = () => {
    const groups = item.groups || [];
    const groupItems = groups
      .map((group) => ({
        key: group.id,
        title: group.name,
        label: group.name,
        action: group.id,
      }))
      .slice(0, 5);

    if (groups.length > 1)
      return (
        <ComboBox
          className={classNames(styles.styledGroupsComboBox, "groups-combobox")}
          selectedOption={{
            key: "first-group",
            title: groups[0].name,
            label: `${groups[0].name} `,
          }}
          plusBadgeValue={groups.length - 1}
          onSelect={onOpenGroupClick}
          options={groupItems}
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
          title={email}
          fontSize="13px"
          fontWeight={600}
          color={sideInfoColor}
          onClick={() => onOpenGroupClick({ action: groups[0].id } as TOption)}
          isTextOverflow
          truncate
        >
          {groups[0].name}
        </Link>
      );

    return null;
  };

  const renderTypeCell = () => {
    const typesOptions = getTypesOptions();

    const combobox = (
      <ComboBox
        className="type-combobox"
        selectedOption={
          typesOptions.find((option) => option.key === role) || ({} as TOption)
        }
        options={typesOptions}
        onSelect={onTypeChange}
        scaled={false}
        directionY="both"
        size={ComboBoxSize.content}
        displaySelectedOption
        modernView
        manualWidth={USER_TYPE_DROPDOWN_WIDTH}
      />
    );

    const text = (
      <Text
        className="plainTextItem"
        title={position}
        fontSize="13px"
        fontWeight={600}
        color={sideInfoColor}
        truncate
        noSelect
        dir="auto"
      >
        {typeLabel}
      </Text>
    );

    const canChange = canChangeUserType(item);

    return canChange ? combobox : text;
  };

  const typeCell = renderTypeCell();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onContentRowSelect?.(e.target.checked, item);
  };

  const onRowContextClick = React.useCallback(
    (rightMouseButtonClick?: boolean) => {
      onUserContextClick?.(item, !rightMouseButtonClick);
    },
    [item, onUserContextClick],
  );

  const onRowClick = (e: React.MouseEvent) => {
    if (withContentSelection) return;
    onContentRowClick?.(e, item);
  };

  const isPaidUser = !standalone && !isVisitor && !isCollaborator;

  return (
    <div
      id={String(item.id)}
      className={classNames(styles.styledWrapper, "user-item", {
        "table-row-selected": isChecked || isActive,
      }, String(item.id))}
      {...({ value } as unknown as { value?: string })}
    >
      <TableRow
        key={item.id}
        className={classNames(styles.styledPeopleRow, "table-row", {
          [styles.checked]: isChecked || isActive,
          [styles.hideColumns]: hideColumns,
        })}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        contextOptions={item.options as unknown as ContextMenuModel[]}
        getContextModel={getContextModel!}
        isIndexEditingMode={false}
        badgeUrl=""
        dataTestId={
          isGuests
            ? `contacts_guests_row_${itemIndex}`
            : `contacts_users_row_${itemIndex}`
        }
      >
        <TableCell
          className="table-container_user-name-cell"
          dataTestId={`contacts_name_cell_${itemIndex}`}
        >
          <TableCell
            hasAccess
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
            dataTestId={`contacts_users_checkbox_cell_${itemIndex}`}
          >
            {inProgress ? (
              <Loader
                className="table-container_row-loader"
                size="20px"
                type={LoaderTypes.track}
              />
            ) : (
              <>
                <div className="table-container_element">{element}</div>
                <Checkbox
                  className="table-container_row-checkbox"
                  onChange={onChange}
                  isChecked={isChecked}
                />
              </>
            )}
          </TableCell>

          <Text
            as="div"
            title={displayName}
            fontWeight="600"
            fontSize="13px"
            color={nameColor}
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
            {isMe?.(id) ? (
              <Text className="me-label" fontWeight="600" fontSize="13px">
                ({t("Common:MeLabel")})
              </Text>
            ) : null}
          </Text>
          <Badges
            statusType={statusType}
            isPaid={isPaidUser}
            isSSO={isSSO}
            isLDAP={isLDAP}
          />
        </TableCell>

        {isGuests ? null : typeColumnIsEnabled ? (
          <TableCell
            className="table-cell_type"
            dataTestId={`contacts_type_cell_${itemIndex}`}
          >
            {typeCell}
          </TableCell>
        ) : (
          <div />
        )}

        {isGuests ? null : groupColumnIsEnabled ? (
          <TableCell
            className="table-cell_groups"
            dataTestId={`contacts_groups_cell_${itemIndex}`}
          >
            {renderGroupsCell()}
          </TableCell>
        ) : (
          <div />
        )}

        {emailColumnIsEnabled ? (
          <TableCell
            className="table-cell_email"
            dataTestId={`contacts_email_cell_${itemIndex}`}
          >
            <Link
              type={LinkType.page}
              title={email}
              fontSize="13px"
              fontWeight={600}
              color={sideInfoColor}
              onClick={onEmailClick}
              isTextOverflow
              enableUserSelect
              truncate
              dataTestId="contacts_email_link"
            >
              {email}
            </Link>
          </TableCell>
        ) : (
          <div />
        )}

        {isGuests && !isRoomAdmin ? (
          inviterColumnIsEnabled ? (
            <TableCell
              className="table-cell_inviter"
              dataTestId={`contacts_inviter_cell_${itemIndex}`}
            >
              <Text
                title={item.createdBy?.displayName}
                fontSize="13px"
                fontWeight={600}
                color={sideInfoColor}
                truncate
                noSelect
                dir="auto"
              >
                {item.createdBy?.displayName}
              </Text>
            </TableCell>
          ) : (
            <div />
          )
        ) : null}

        {isGuests && !isRoomAdmin ? (
          invitedDateColumnIsEnabled ? (
            <TableCell
              className="table-cell_invited-date"
              dataTestId={`contacts_invited_date_cell_${itemIndex}`}
            >
              <Text
                title={item.registrationDate}
                fontSize="13px"
                fontWeight={600}
                color={sideInfoColor}
                truncate
                noSelect
                dir="auto"
              >
                {isPending ? null : item.registrationDate}
              </Text>
            </TableCell>
          ) : (
            <div />
          )
        ) : null}

        {isGuests
          ? null
          : showStorageInfo &&
            (storageColumnIsEnabled ? (
              <TableCell
                className="table-cell_Storage/Quota"
                dataTestId={`contacts_storage_cell_${itemIndex}`}
              >
                <SpaceQuota hideColumns={hideColumns} item={item} type="user" />
              </TableCell>
            ) : (
              <div />
            ))}
      </TableRow>
    </div>
  );
};

export default inject(
  ({ currentQuotaStore, peopleStore, userStore }: TableRowStores) => {
    const { showStorageInfo } = currentQuotaStore;

    const { getUsersChangeTypeOptions } = peopleStore.contextOptionsStore!;
    const { withContentSelection } = peopleStore.contactsHotkeysStore!;

    return {
      showStorageInfo,
      getUsersChangeTypeOptions,

      isRoomAdmin: userStore.user?.isRoomAdmin,
      withContentSelection,
      isMe: userStore.isMe,
    };
  },
)(withContent(observer(PeopleTableRow)));
