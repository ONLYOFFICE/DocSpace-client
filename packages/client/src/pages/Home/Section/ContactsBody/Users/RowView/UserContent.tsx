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
import { useTranslation } from "react-i18next";

import {
  getSpaceQuotaAsText,
  getUserTypeName,
} from "@docspace/shared/utils/common";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import Badges from "../../Badges";

import { RowContent } from "@docspace/ui-kit/components/rows";

import { UserContentProps } from "./RowView.types";
import styles from "./RowView.module.scss";

const UserContent = ({
  item,
  sectionWidth,

  contactsTab,
  showStorageInfo,
  isDefaultUsersQuotaSet,

  standalone,

  isRoomAdmin: isRoomAdminUser,
  itemIndex,
  isMe,
}: UserContentProps) => {
  const { t } = useTranslation(["People", "Common"]);
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
    id,
  } = item;

  const isGuests = contactsTab === "guests";
  const prefix = isGuests ? "contacts_guests" : "contacts_users";

  const isPending = statusType === "pending";
  const isDisabled = statusType === "disabled";

  const nameColor =
    isPending || isDisabled
      ? "var(--people-table-row-pending-name-color)"
      : "var(--people-table-row-name-color)";
  const sideInfoColor =
    isPending || isDisabled
      ? "var(--people-table-row-pending-side-info-color)"
      : "var(--people-table-row-side-info-color)";

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
    <RowContent className={styles.styledRowContent} sideColor={sideInfoColor} sectionWidth={sectionWidth}>
      <Link
        className="name-block"
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
        {isMe?.(id) ? (
          <Text as="div" className="me-label" fontWeight="600" fontSize="13px">
            ({t("Common:MeLabel")})
          </Text>
        ) : null}
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
    </RowContent>
  );
};

export default UserContent;
