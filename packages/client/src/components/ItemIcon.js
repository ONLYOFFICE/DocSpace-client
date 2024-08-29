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

import React, { useState } from "react";
import SecuritySvgUrl from "PUBLIC_DIR/images/security.svg?url";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { Base } from "@docspace/shared/themes";
import { NoUserSelect } from "@docspace/shared/utils";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import { IconButton } from "@docspace/shared/components/icon-button";
import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import EditPenSvgUrl from "PUBLIC_DIR/images/icons/12/pen-edit.react.svg?url";
import PenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import UploadPenSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

const IconWrapper = styled.div`
  ${(props) =>
    props.isRoom &&
    css`
      position: relative;
      border-radius: 6px;

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        /* border: ${(props) => props.theme.itemIcon.borderColor}; */
        border: 1px solid transparent;
        border-radius: 5px;
        overflow: hidden;
      }
    `}

  .react-svg-icon {
    ${NoUserSelect}
    ${(props) =>
      props.isRoom &&
      css`
        border-radius: 6px;
        vertical-align: middle;
      `}
  }
`;

const EditWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${(props) => props.theme.itemIcon.editIconColor};
  border-radius: 50%;
  position: absolute;
  bottom: -6px;
  right: -6px;

  .open-edit-logo-icon {
    &:hover {
      cursor: pointer;
    }
  }
`;

IconWrapper.defaultProps = { theme: Base };

const EncryptedFileIcon = styled.div`
  background: url(${SecuritySvgUrl}) no-repeat 0 0 / 16px 16px transparent;
  height: 16px;
  position: absolute;
  width: 16px;
  margin-top: 14px;
  margin-inline-start: 12px;
`;

const ItemIcon = ({
  icon,
  fileExst,
  isPrivacy,
  isRoom,
  title,
  logo,
  color,
  isArchive,
  badgeUrl,
  size,
  withEditing,
  setRoomLogoCoverDialogVisible,
  showDefault,
  imgClassName,
}) => {
  const isLoadedRoomIcon = !!logo?.medium;
  const showDefaultRoomIcon = !isLoadedRoomIcon && isRoom;
  const [editLogoOpen, setEditLogoOpen] = useState(false);

  const toggleEditLogo = () => {
    setEditLogoOpen(!editLogoOpen);
  };

  const closeEditLogo = () => {
    setEditLogoOpen(false);
  };

  const openCustomizeCover = () => {
    setRoomLogoCoverDialogVisible(true);
    closeEditLogo();
  };
  return (
    <>
      <IconWrapper isRoom={isRoom}>
        <RoomIcon
          color={color}
          title={title}
          size={size}
          isArchive={isArchive}
          showDefault={showDefault || showDefaultRoomIcon}
          imgClassName={imgClassName || "react-svg-icon"}
          imgSrc={isRoom ? logo?.medium : icon}
          badgeUrl={badgeUrl ? badgeUrl : ""}
        />
        {withEditing && (
          <EditWrapper>
            <IconButton
              className="open-edit-logo-icon"
              size={12}
              iconName={EditPenSvgUrl}
              onClick={toggleEditLogo}
              isFill
            />
            <DropDown
              open={editLogoOpen}
              clickOutsideAction={closeEditLogo}
              withBackdrop={false}
              isDefaultMode={false}
              fixedDirection={true}
            >
              <DropDownItem
                label={`Upload picture`}
                icon={UploadPenSvgUrl}
                //   onClick={() => shareEmail(activeLink[0])}
              />
              <DropDownItem
                label={`Customize cover`}
                icon={PenSvgUrl}
                onClick={openCustomizeCover}
              />
            </DropDown>
          </EditWrapper>
        )}
      </IconWrapper>
      {isPrivacy && fileExst && <EncryptedFileIcon isEdit={false} />}
    </>
  );
};

export default inject(({ treeFoldersStore, dialogsStore }) => {
  return {
    isPrivacy: treeFoldersStore.isPrivacyFolder,
    setRoomLogoCoverDialogVisible: dialogsStore.setRoomLogoCoverDialogVisible,
  };
})(observer(ItemIcon));
