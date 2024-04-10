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
import { isMobile, isTablet } from "react-device-detect";
import { Base } from "@docspace/shared/themes";

const StyledThumbnail = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${isMobile ? (isTablet ? "240" : "188") : "200"}px;
  img {
    box-sizing: border-box;
    border: ${(props) => `solid 1px ${props.theme.infoPanel.borderColor}`};
    border-radius: 6px;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: ${(props) => (props.isImageOrMedia ? "center" : "top")};
  }
`;

const StyledNoThumbnail = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  .no-thumbnail-img {
    height: 96px;
    width: 96px;
  }
  .is-room {
    border-radius: 16px;
  }
  .custom-logo {
    outline: 1px solid
      ${(props) => props.theme.infoPanel.details.customLogoBorderColor};
  }

  .room-title {
    font-size: ${(props) => props.theme.getCorrectFontSize("41px")};
    font-weight: 700;
    line-height: 56px;
  }
`;

StyledThumbnail.defaultProps = { theme: Base };
StyledNoThumbnail.defaultProps = { theme: Base };

export { StyledThumbnail, StyledNoThumbnail };
