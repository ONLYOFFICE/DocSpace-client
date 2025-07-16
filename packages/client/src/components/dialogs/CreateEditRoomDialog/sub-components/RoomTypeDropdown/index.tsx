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

import React, { useState, useEffect } from "react";
import styled from "styled-components";

import RoomType from "@docspace/shared/components/room-type";
import { isMobile } from "@docspace/shared/utils";
import { RoomsType } from "@docspace/shared/enums";

import DropdownDesktop from "./DropdownDesktop";
import DropdownMobile from "./DropdownMobile";

const StyledRoomTypeDropdown = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .backdrop-active {
    top: -64px;
  }
`;

type RoomTypeDropdownProps = {
  currentRoomType: RoomsType;
  setRoomType: (roomType: RoomsType) => void;
  setIsScrollLocked: (isScrollLocked: boolean) => void;
  isDisabled: boolean;
  forceHideDropdown: boolean;
};

const RoomTypeDropdown = ({
  currentRoomType,
  setRoomType,
  setIsScrollLocked,
  isDisabled,
  forceHideDropdown,
}: RoomTypeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (isDisabled) return;
    if (isOpen) {
      setIsScrollLocked(false);
      setIsOpen(false);
    } else {
      setIsScrollLocked(true);
      setIsOpen(true);
    }
  };

  const chooseRoomType = (roomType: RoomsType) => {
    if (isDisabled) return;
    setRoomType(roomType);
    toggleDropdown();
  };

  useEffect(() => {
    if (forceHideDropdown) {
      setIsScrollLocked(false);
      setIsOpen(false);
    }
  }, [forceHideDropdown]);

  return (
    <StyledRoomTypeDropdown>
      <RoomType
        roomType={currentRoomType}
        id="shared_select-room"
        selectedId={currentRoomType}
        type="dropdownButton"
        isOpen={isOpen}
        onClick={toggleDropdown}
      />
      {isMobile() ? (
        <DropdownMobile
          open={isOpen}
          onClose={toggleDropdown}
          chooseRoomType={chooseRoomType}
          forceHideDropdown={forceHideDropdown}
        />
      ) : (
        <DropdownDesktop open={isOpen} chooseRoomType={chooseRoomType} />
      )}
    </StyledRoomTypeDropdown>
  );
};

export default RoomTypeDropdown;
