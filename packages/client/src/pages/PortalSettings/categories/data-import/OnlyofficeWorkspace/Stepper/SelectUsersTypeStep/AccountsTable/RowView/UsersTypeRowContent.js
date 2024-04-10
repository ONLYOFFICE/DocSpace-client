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

import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import { Text } from "@docspace/shared/components/text";
import { Box } from "@docspace/shared/components/box";
import { RowContent } from "@docspace/shared/components/row-content";
import { ComboBox } from "@docspace/shared/components/combobox";

const StyledRowContent = styled(RowContent)`
  display: flex;

  .row-main-container-wrapper {
    width: 100%;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 0px;
          `
        : css`
            margin-right: 0px;
          `}
  }

  .rowMainContainer {
    height: 100%;
    width: 100%;
  }

  .username {
    font-size: 14px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    margin-right: 5px;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
  }

  .user-type {
    .combo-button {
      border: none;
      padding: 5px;
      justify-content: flex-end;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.tableRowTextColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-right: 0px;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.tableRowTextColor};
      }
    }
  }
`;

const UsersRowContent = ({
  id,
  sectionWidth,
  displayName,
  email,
  typeOptions,
  roleSelectorRef,
  type,
  changeUserType,
}) => {
  const onSelectUser = (e) => {
    changeUserType(id, e.key);
  };

  const selectedOption =
    typeOptions.find((option) => option.key === type) || {};

  const contentData = [
    <Box
      key={id}
      displayProp="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box>
        <Text className="username">{displayName}</Text>
        <Text className="user-email">{email}</Text>
      </Box>

      <div ref={roleSelectorRef}>
        <ComboBox
          className="user-type"
          selectedOption={selectedOption}
          options={typeOptions}
          onSelect={onSelectUser}
          scaled
          size="content"
          displaySelectedOption
          modernView
          manualWidth="fit-content"
        />
      </div>
    </Box>,
  ];

  return (
    <StyledRowContent sectionWidth={sectionWidth}>
      {contentData}
    </StyledRowContent>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersRowContent));
