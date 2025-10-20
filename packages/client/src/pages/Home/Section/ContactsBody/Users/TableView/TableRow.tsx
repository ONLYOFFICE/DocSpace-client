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

import React from "react";
import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TableCell } from "@docspace/shared/components/table";
import { Link, LinkType } from "@docspace/shared/components/link";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { EmployeeType } from "@docspace/shared/enums";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";

import withContent from "SRC_DIR/HOCs/withPeopleContent";
import SpaceQuota from "SRC_DIR/components/SpaceQuota";

import Badges from "../../Badges";

import { TableRowProps, TableRowStores } from "./TableView.types";
import {
  StyledGroupsComboBox,
  StyledWrapper,
  StyledPeopleRow,
} from "./TableView.styled";

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
}: TableRowProps) => {
  const theme = useTheme();
  const { t } = useTranslation(["People", "Common", "Settings"]);
  const [isLoading, setIsLoading] = React.useState(false);

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
  } = item;

  const isGuests = contactsTab === "guests";
  const isInsideGroup = contactsTab === "inside_group";
  const isPending = statusType === "pending" || statusType === "disabled";

  const nameColor = isPending
    ? theme.peopleTableRow.pendingNameColor
    : theme.peopleTableRow.nameColor;
  const sideInfoColor = theme.peopleTableRow.sideInfoColor;

  const getTypesOptions = React.useCallback(() => {
    const options = getUsersChangeTypeOptions!(t, item);

    return options;
  }, [getUsersChangeTypeOptions, item, t]);

  const onAbort = () => {
    setIsLoading(false);
  };

  const onSuccess = () => {
    setIsLoading(false);
  };

  const onTypeChange = React.useCallback(
    (option: TOption) => {
      if (!option.action || option.key === role) return;

      setIsLoading(true);
      if (
        !changeUserType(
          option.action as EmployeeType,
          [item],
          onSuccess,
          onAbort,
        )
      ) {
        setIsLoading(false);
      }
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
        <StyledGroupsComboBox
          className="groups-combobox"
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
        manualWidth="auto"
        isLoading={isLoading}
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
    <StyledWrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      } ${item.id}`}
      value={value}
    >
      <StyledPeopleRow
        key={item.id}
        className="table-row"
        checked={isChecked}
        isActive={isActive!}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        hideColumns={hideColumns}
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
      </StyledPeopleRow>
    </StyledWrapper>
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
    };
  },
)(withContent(observer(PeopleTableRow)));
