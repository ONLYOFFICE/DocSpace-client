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
import styled from "styled-components";
import { Avatar } from "@docspace/shared/components/avatar";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import { useState, useRef } from "react";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { inject } from "mobx-react";
import { useTranslation } from "react-i18next";
import { getUserStatus } from "SRC_DIR/helpers/people-helpers";
import { EmployeeStatus } from "@docspace/shared/enums";
import { StyledSendClockIcon } from "SRC_DIR/components/Icons";
import { getUserType } from "@docspace/shared/utils/common";

const StyledContextMenu = styled(ContextMenu)`
  min-width: auto !important;
`;

const GroupMember = ({
  userId,
  groupMember,
  isManager,
  getUserContextOptions,
  getUserContextOptionsModel,
}) => {
  const { t } = useTranslation([
    "People",
    "Profile",
    "PeopleTranslations",
    "Common",
  ]);

  const iconRef = useRef(null);
  const buttonMenuRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  const onClick = (e) => {
    if (!isOpen) buttonMenuRef?.current?.show(e);
    else buttonMenuRef?.current?.hide(e);
    setIsOpen(!isOpen);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getUserContextOptionsModel(
    t,
    getUserContextOptions(
      groupMember.id === userId,
      getUserStatus(groupMember),
      getUserType(groupMember),
      groupMember.status,
    ),
    groupMember,
  );

  return (
    <div className="group-member">
      <Avatar
        className="avatar"
        role={groupMember.role || "user"}
        size="min"
        source={groupMember.avatar}
        noClick
      />

      <div className="main-wrapper">
        <div className="name-wrapper">
          <div className="name" style={{}} title={groupMember.displayName}>
            {groupMember.displayName}
          </div>
          {groupMember.status === EmployeeStatus.Pending && (
            <StyledSendClockIcon />
          )}
        </div>
        <div className="email" title={groupMember.email}>
          {groupMember.email}
        </div>
      </div>

      <div className="context-btn-wrapper">
        {isManager && (
          <div className="group-manager-tag">{t("Common:HeadOfGroup")}</div>
        )}

        {/* {!groupMember.isLDAP && (
          <div className="context-btn" ref={iconRef}>
            <ContextMenuButton
              isFill
              className="expandButton"
              directionX="right"
              displayType="toggle"
              onClick={onClick}
              getData={() => model}
            />
            <StyledContextMenu
              model={model}
              containerRef={iconRef}
              ref={buttonMenuRef}
              onHide={onHide}
              scaled={false}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default inject(({ peopleStore }) => ({
  userId: peopleStore.userStore.user.id,
  getUserContextOptions: peopleStore.usersStore.getUserContextOptions,
  getUserContextOptionsModel:
    peopleStore.contextOptionsStore.getUserContextOptions,
}))(GroupMember);
