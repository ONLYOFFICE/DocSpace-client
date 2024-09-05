// (c) Copyright Ascensio System SIA 2009-2024
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
import styled, { css } from "styled-components";

import { withTranslation } from "react-i18next";

import { RowContent } from "@docspace/shared/components/row-content";
import { Link } from "@docspace/shared/components/link";

import Badges from "../../Badges";
import { tablet, mobile } from "@docspace/shared/utils/device";

import { getUserTypeName } from "@docspace/shared/utils/common";

const StyledRowContent = styled(RowContent)`
  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      justify-content: space-between;
      max-width: inherit;
    }

    .badges {
      flex-direction: row-reverse;

      margin-inline-end: 12px;

      .paid-badge {
        margin-inline: 8px 0;
      }
    }
  }

  @media ${mobile} {
    .row-main-container-wrapper {
      justify-content: flex-start;
    }

    .badges {
      margin-top: 0px;
      gap: 8px;

      .paid-badge {
        margin: 0px;
      }
    }
  }
`;

const UserContent = ({
  item,
  sectionWidth,

  t,
  theme,
  standalone,
}) => {
  const {
    displayName,
    email,
    statusType,
    role,
    isVisitor,
    isCollaborator,
    isSSO,
    isLDAP,
    isOwner,
    isAdmin,
    isRoomAdmin,
  } = item;

  const nameColor =
    statusType === "pending" || statusType === "disabled"
      ? theme.peopleTableRow.pendingNameColor
      : theme.peopleTableRow.nameColor;
  const sideInfoColor =
    statusType === "pending" || statusType === "disabled"
      ? theme.peopleTableRow.pendingSideInfoColor
      : theme.peopleTableRow.sideInfoColor;

  const roleLabel = getUserTypeName(
    isOwner,
    isAdmin,
    isRoomAdmin,
    isCollaborator,
    t,
  );

  const isPaidUser = !standalone && !isVisitor;

  return (
    <StyledRowContent
      sideColor={sideInfoColor}
      sectionWidth={sectionWidth}
      nameColor={nameColor}
      sideInfoColor={sideInfoColor}
    >
      <Link
        containerWidth="28%"
        type="page"
        title={displayName}
        fontWeight={600}
        fontSize="15px"
        color={nameColor}
        isTextOverflow={true}
        noHover
        dir="auto"
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
        containerMinWidth="140px"
        containerWidth="17%"
        type="page"
        title={email}
        fontSize="12px"
        fontWeight={400}
        color={sideInfoColor}
        isTextOverflow={true}
      >
        {roleLabel}
      </Link>
      <Link
        containerMinWidth="140px"
        containerWidth="17%"
        type="page"
        title={email}
        fontSize="12px"
        fontWeight={400}
        color={sideInfoColor}
        isTextOverflow={true}
      >
        {email}
      </Link>
    </StyledRowContent>
  );
};

export default withTranslation(["People", "Common"])(UserContent);
