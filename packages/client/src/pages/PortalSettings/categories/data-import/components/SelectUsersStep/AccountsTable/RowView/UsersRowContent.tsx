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

import React from "react";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { RowContent } from "@docspace/shared/components/rows";
import { UsersRowContentProps } from "../../../../types";

const StyledRowContent = styled(RowContent)`
  display: flex;

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .username {
    margin-inline-end: 5px;
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .content-data-box {
    box-sizing: border-box;
    display: flex;
  }

  .user-email {
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-existing {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.existingTextColor};
  }
`;

const UsersRowContent = (props: UsersRowContentProps) => {
  const { t, data, sectionWidth, displayName, email, isDuplicate } = props;

  const contentData = [
    <div key={data.key}>
      <div className="content-data-box">
        <Text className="username">{displayName}</Text>
        {isDuplicate ? (
          <Text className="user-existing">
            ({t("Settings:AccountAlreadyExists")})
          </Text>
        ) : null}
      </div>

      <Text className="user-email">{email}</Text>
    </div>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default UsersRowContent;
