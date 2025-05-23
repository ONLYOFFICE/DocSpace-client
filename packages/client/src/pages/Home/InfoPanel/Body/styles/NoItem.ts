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

import styled from "styled-components";

const StyledNoItemContainer = styled.div`
  margin-block: 80px 0;
  margin-inline: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 32px;

  .no-item-text {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
  }

  .no-history-text {
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
  }

  .no-thumbnail-img-wrapper {
    width: 75px;
    height: 75px;
    img {
      width: 75px;
      height: 75px;
    }
  }

  .expired-title {
    text-align: center;

    margin: 0 0 8px 0;
    font-size: 16px;
    line-height: 22px;
  }

  .expired-text {
    font-size: 12px;
    line-height: 16px;
    text-align: center;

    color: ${(props) => props.theme.infoPanel.expired.color};
  }
`;

const LockedSharedRoomButton = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;

  background: none;
  cursor: pointer;
  border: none;

  color: ${(props) => props.theme.emptyContent.button.colorLink};

  svg {
    path {
      fill: ${(props) => props.theme.emptyContent.button.colorLink};
    }
  }

  span {
    color: inherit;
    font-size: 13px;
    font-weight: 600;
    text-decoration: underline dashed;
    text-underline-offset: 2px;
  }
`;

export { StyledNoItemContainer, LockedSharedRoomButton };
