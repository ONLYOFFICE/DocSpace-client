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

import styled, { useTheme } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/row-content";

import { SessionsRowContentProps } from "../../SecuritySessions.types";

const StyledRowContent = styled(RowContent)`
  .online {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    margin-left: 4px;
    font-size: 14px;
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .offline {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    font-size: 14px;
    margin-left: 4px;
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

const SessionsRowContent = ({
  fromDateAgo,
  item,
  sectionWidth,
}: SessionsRowContentProps) => {
  const { userId, displayName, session } = item;
  const { ip, platform, browser, city, country, status } = session;

  const theme = useTheme();

  return (
    <StyledRowContent
      key={userId}
      sectionWidth={sectionWidth}
      sideColor={theme.profile.activeSessions.tableCellColor}
    >
      <Text fontSize="14px" fontWeight="600">
        {displayName}
        <span className={status === "online" ? "online" : "offline"}>
          {fromDateAgo}
        </span>
      </Text>
      <span />
      <Text fontSize="12px" fontWeight="600">
        {platform}
        {` ${browser}`}
      </Text>

      {(country || city) && (
        <Text fontSize="12px" fontWeight="600">
          {country}
          {country && city && ` ${city}`}
        </Text>
      )}

      <Text fontSize="12px" fontWeight="600">
        {ip}
      </Text>
    </StyledRowContent>
  );
};

export default SessionsRowContent;
