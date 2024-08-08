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
import styled from "styled-components";

import RoomType from "@docspace/shared/components/room-type";
import { Base, globalColors } from "@docspace/shared/themes";
import { RoomsTypeValues } from "@docspace/shared/utils/common";

const StyledDropdownDesktop = styled.div`
  max-width: 100%;
  position: relative;

  ${(props) => !props.isOpen && "display: none"};

  .dropdown-content {
    background: ${(props) =>
      props.theme.createEditRoomDialog.roomTypeDropdown.desktop.background};
    border: 1px solid
      ${(props) =>
        props.theme.createEditRoomDialog.roomTypeDropdown.desktop.borderColor};
    margin-top: 4px;
    overflow: visible;
    z-index: 400;
    top: 0;

    inset-inline-start: 0;
    box-sizing: border-box;
    width: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 6px 0;
    box-shadow: 0px 12px 40px ${globalColors.popupShadow};
    border-radius: 6px;
  }
`;

StyledDropdownDesktop.defaultProps = { theme: Base };

const DropdownDesktop = ({ t, open, chooseRoomType }) => {
  return (
    <StyledDropdownDesktop className="dropdown-content-wrapper" isOpen={open}>
      <div className="dropdown-content">
        {RoomsTypeValues.map((roomType) => (
          <RoomType
            id={roomType}
            t={t}
            key={roomType}
            roomType={roomType}
            type="dropdownItem"
            onClick={() => chooseRoomType(roomType)}
          />
        ))}
      </div>
    </StyledDropdownDesktop>
  );
};

export default DropdownDesktop;
