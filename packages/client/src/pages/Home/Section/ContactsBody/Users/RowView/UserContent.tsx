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
import { useTranslation } from "react-i18next";

import {
  getSpaceQuotaAsText,
  getUserTypeName,
} from "@docspace/shared/utils/common";
import {
  LinkWithTooltip as Link,
  LinkType,
} from "@docspace/shared/components/link";

import Badges from "../../Badges";

import { UserContentProps } from "./RowView.types";
import { StyledRowContent } from "./RowView.styled";

const UserContent = ({
  item,
  sectionWidth,

  contactsTab,
  showStorageInfo,
  isDefaultUsersQuotaSet,

  standalone,

  isRoomAdmin: isRoomAdminUser,
  itemIndex,
}: UserContentProps) => {
  const { t } = useTranslation(["People", "Common"]);
  const theme = useTheme();
  const {
    displayName,
    email,
    statusType,
    isVisitor,
    isCollaborator,
    isSSO,
    isLDAP,
    isOwner,
    isAdmin,
    isRoomAdmin,
    usedSpace,
    quotaLimit,
  } = item;

  const isGuests = contactsTab === "guests";
  const prefix = isGuests ? "contacts_guests" : "contacts_users";

  const isPending = statusType === "pending";
  const isDisabled = statusType === "disabled";

  const nameColor =
    isPending || isDisabled
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor =
    isPending || isDisabled
      ? theme.peopleTableRow.pendingSideInfoColor
      : theme.peopleTableRow.sideInfoColor;

  const roleLabel = getUserTypeName(
    isOwner,
    isAdmin,
    isRoomAdmin,
    isCollaborator,
    t,
  );

  const isPaidUser = !standalone && !isVisitor && !isCollaborator;

  const spaceQuota = getSpaceQuotaAsText(
    t,
    usedSpace!,
    quotaLimit!,
    !!isDefaultUsersQuotaSet,
  );

  return (
    <StyledRowContent sideColor={sideInfoColor} sectionWidth={sectionWidth}>
      <Link
        type={LinkType.page}
        title={displayName}
        fontWeight={600}
        fontSize="15px"
        color={nameColor}
        isTextOverflow
        noHover
        truncate
        dataTestId={`${prefix}_name_link_${itemIndex}`}
      >
        {statusType === "pending"
          ? email
          : displayName?.trim()
            ? displayName
            : email}
      </Link>
      <Badges
        statusType={statusType}
        isPaid={isPaidUser}
        isSSO={isSSO}
        isLDAP={isLDAP}
      />
      <Link
        type={LinkType.page}
        title={email}
        fontSize="12px"
        fontWeight={400}
        color={sideInfoColor}
        isTextOverflow
        dataTestId={`${prefix}_role_or_email_link_${itemIndex}`}
      >
        {isGuests ? email : roleLabel}
      </Link>
      {!isRoomAdminUser || !isGuests ? (
        <Link
          type={LinkType.page}
          title={email}
          fontSize="12px"
          fontWeight={400}
          color={sideInfoColor}
          isTextOverflow
          dataTestId={`${prefix}_created_by_or_email_link_${itemIndex}`}
        >
          {isGuests ? item.createdBy?.displayName : email}
        </Link>
      ) : (
        <div />
      )}
      {isGuests && !isRoomAdminUser && !isPending && !isDisabled ? (
        <Link
          type={LinkType.page}
          title={email}
          fontSize="12px"
          fontWeight={400}
          color={sideInfoColor}
          isTextOverflow
          dataTestId={`${prefix}_registration_date_link_${itemIndex}`}
        >
          {item.registrationDate}
        </Link>
      ) : (
        <div />
      )}
      {showStorageInfo && !isGuests ? (
        <Link
          type={LinkType.page}
          fontSize="12px"
          fontWeight={400}
          color={sideInfoColor}
          isTextOverflow
          dataTestId={`${prefix}_space_quota_link_${itemIndex}`}
        >
          {spaceQuota}
        </Link>
      ) : (
        <div />
      )}
    </StyledRowContent>
  );
};

export default UserContent;
