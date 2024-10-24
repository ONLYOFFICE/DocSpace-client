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

import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/shared/utils";

import { TPanelPosition } from "./NewFilesBadge.types";

export const StyledPanel = styled.div<{ position: TPanelPosition }>`
  height: ${(props) => `${props.position.maxHeight}px`};
  max-height: ${(props) => `${props.position.maxHeight}px`};

  width: 400px;

  position: fixed;
  top: ${(props) => `${props.position.top}px`};
  left: ${(props) => `${props.position.left}px`};

  background: ${(props) => props.theme.backgroundColor};
  border: 1px solid ${(props) => props.theme.newFilesPanel.borderColor};
  border-radius: ${(props) => props.theme.newFilesPanel.borderRadius};

  box-shadows: ${(props) => props.theme.newFilesPanel.boxShadow};
  z-index: 600;

  box-sizing: border-box;

  padding-inline-start: 16px;
  padding-bottom: 16px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;

  .mark-as-read-button {
    min-height: 32px;
    width: calc(100% - 16px);
  }
`;

export const StyledItem = styled.div<{
  isRooms?: boolean;
  isFirst?: boolean;
  isLoader?: boolean;
}>`
  padding: 0;
  margin: 0;

  .date-item {
    margin-bottom: 0;
    margin-top: ${(props) => (props.isFirst ? "20px" : "8px")};
  }

  .room-items-container {
    box-sizing: border-box;

    padding: 16px 0;
    margin: 0;

    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .file-items-container {
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    gap: 8px;

    padding: ${(props) => (props.isRooms ? 0 : "16px 0 ")};

    .more-items {
      padding-top: 4px;
      padding-inline-start: ${(props) => (props.isRooms ? "32px" : 0)};

      .more-items__link {
        text-decoration: underline dashed;
      }
    }
  }
`;

export const StyledRoomItem = styled.div`
  height: 24px;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  cursor: pointer;

  .room-icon {
    min-width: 24px;
    .room-image {
      border-radius: 6px;
    }
  }
`;

export const StyledFileItem = styled.div<{ isRooms: boolean }>`
  width: 100%;
  height: 32px;

  padding-inline-start: ${(props) => (props.isRooms ? "32px" : 0)};

  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;

  .info-container {
    width: auto;
    max-width: calc(100% - 20px);
    height: 100%;
    box-sizing: border-box;
    border: 1px solid
      ${(props) => props.theme.newFilesPanel.fileItem.borderColor};
    border-radius: 6px;

    display: flex;
    flex-direction: row;
    align-items: center;

    padding-inline-end: 8px;

    .file-icon {
      min-width: 32px;
    }

    .file-exst {
      color: ${(props) => props.theme.newFilesPanel.fileItem.fileExstColor};
    }
  }

  .open-location-button {
    cursor: pointer;

    display: none;

    ${isMobile &&
    css`
      display: block;
    `}

    @media ${tablet} {
      display: block;
    }
  }

  &:hover {
    .open-location-button {
      display: block;
    }
  }
`;
