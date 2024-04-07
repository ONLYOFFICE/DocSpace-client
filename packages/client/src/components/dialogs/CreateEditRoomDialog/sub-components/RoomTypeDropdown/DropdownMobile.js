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

import RoomType from "../RoomType";
import { RoomsTypeValues } from "@docspace/shared/utils/common";
import { Backdrop } from "@docspace/shared/components/backdrop";

import { Base } from "@docspace/shared/themes";

const StyledDropdownMobile = styled.div`
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  position: fixed;
  bottom: 0;
  z-index: 500;
  padding-top: 6px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `margin-right: -16px;`
      : `margin-left: -16px;`}
  box-shadow: 0px -4px 60px rgba(4, 15, 27, 0.12);
  border-radius: 6px 6px 0px 0px;
  background: ${(props) =>
    props.theme.createEditRoomDialog.roomTypeDropdown.mobile.background};
`;

StyledDropdownMobile.defaultProps = { theme: Base };

const DropdownMobile = ({
  t,
  open,
  onClose,
  chooseRoomType,
  forсeHideDropdown,
}) => {
  return (
    <>
      <Backdrop visible={open} onClick={onClose} zIndex={450} />
      {!forсeHideDropdown && (
        <StyledDropdownMobile className="dropdown-mobile" isOpen={open}>
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
        </StyledDropdownMobile>
      )}
    </>
  );
};

export default DropdownMobile;
