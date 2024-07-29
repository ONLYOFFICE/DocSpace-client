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
import { Base } from "@docspace/shared/themes";

export const StyledAccountsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledSubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 108px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledDetailsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledDetailsSubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledDetailsProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 101px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledGalleryLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  .thumbnail {
  }
`;

export const StyledGallerySubtitleLoader = styled.div`
  width: 100%;
  padding: 24px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledGalleryProperty = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 101px 1fr;
  grid-column-gap: 24px;
  grid-row-gap: 8px;

  .property-content {
    max-width: 100%;
    margin: auto 0;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledHistoryLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledHistorySubtitleLoader = styled.div`
  width: 100%;
  padding: 8px 0 12px;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledHistoryBlockLoader = styled.div`
  width: 100%;
  height: 70px;

  display: flex;
  align-items: center;
  border-bottom: ${(props) => `solid 1px ${props.theme.infoPanel.borderColor}`};

  .content {
    width: 100%;
    height: 38px;

    display: flex;
    flex-direction: row;
    gap: 8px;

    .avatar {
      min-height: 32px;
      min-width: 32px;
    }
    .message {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .date {
      margin-inline-start: auto;
    }
  }
`;

StyledHistoryBlockLoader.defaultProps = { theme: Base };

export const StyledMembersLoader = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledMemberSubtitleLoader = styled.div`
  width: 100%;
  padding: 8px 0 12px;
  .pending_users {
    padding-top: 20px;
  }

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const StyledMemberLoader = styled.div`
  width: 100%;
  height: 48px;

  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 8px;

  .avatar {
    min-height: 32px;
    min-width: 32px;
  }

  .role-selector {
    margin-inline-start: auto;
  }
`;

export const StyledNoItemLoader = styled.div`
  width: 100%;
  margin: 80px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
`;

export const StyledSeveralItemsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const StyledGroupsLoader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

export const StyledGroupMemberLoader = styled.div`
  width: 100%;
  height: 48px;

  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 8px;

  .avatar {
    min-height: 32px;
    min-width: 32px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    gap: 4px;
  }
`;
