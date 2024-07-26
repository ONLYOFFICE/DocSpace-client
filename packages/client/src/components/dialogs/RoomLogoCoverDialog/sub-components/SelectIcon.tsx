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

import { SelectIconProps } from "../RoomLogoCoverDialog.types";
import { RoomCoverIcons } from "../data";

interface WithoutIconProps {
  isSelected?: boolean;
}

const StyledWithoutIcon = styled.div<WithoutIconProps>`
  display: flex;
  white-space: nowrap;
  flex-direction: column;
  margin: 8px 0;
  gap: 4px;
  width: max-content;
  font-weight: 600;
  line-height: 20px;
  user-select: none;
  padding: 4px 16px;
  color: #657077;
  background-color: #eceef1;
  border: 1px solid rgb(236, 238, 241);
  border-radius: 16px;
  &:hover {
    cursor: pointer;
  }

  ${(props) =>
    props.isSelected &&
    css`
      background-color: #fff;
    `}
`;

const StyledIconContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-right: 10px;
  margin-top: 8px;
`;

export const SelectIcon = ({
  t,
  withoutIcon,
  setWithoutIcon,
}: SelectIconProps) => {
  const toggleWithoutIcon = () => setWithoutIcon((state: boolean) => !state);
  return (
    <div>
      <div className="color-name">{t("CreateEditRoomDialog:Icon")}</div>
      <StyledWithoutIcon onClick={toggleWithoutIcon} isSelected={withoutIcon}>
        Without icon
      </StyledWithoutIcon>
      <div className="cover-icon-container">
        {RoomCoverIcons.map((icon) => (
          <StyledIconContainer key={icon}>
            <img src={icon} alt="cover-icon" />
          </StyledIconContainer>
        ))}
      </div>
    </div>
  );
};
