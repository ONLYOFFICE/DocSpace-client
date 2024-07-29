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

import { HelpButton } from "@docspace/shared/components/help-button";
import { Text } from "@docspace/shared/components/text";
import { mobile } from "@docspace/shared/utils";
import { UsersInfoBlockProps } from "../types";

const Wrapper = styled.div`
  margin: 16px 0;

  .license-limit-warning {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${(props) => props.theme.client.settings.migration.errorTextColor};
  }
`;

const UsersInfoWrapper = styled.div<{
  selectedUsers: number;
  totalLicenceLimit: number;
}>`
  display: flex;
  align-items: center;
  width: fit-content;
  min-width: 660px;
  background: ${(props) =>
    props.theme.client.settings.migration.infoBlockBackground};
  box-sizing: border-box;
  padding: 12px 16px;
  border-radius: 6px;
  margin: 16px 0;

  @media (max-width: 1140px) {
    width: 100%;
  }

  @media ${mobile} {
    flex-wrap: wrap;
    min-width: auto;
    gap: 12px;
  }

  .selected-users-count {
    margin-inline-end: 24px;
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;
  }

  .selected-admins-count {
    margin-inline-end: 8px;
    color: ${(props) =>
      props.theme.client.settings.migration.infoBlockTextColor};
    font-weight: 700;
    font-size: 14px;

    span {
      font-weight: 700;
      font-size: 14px;
      margin-inline-start: 4px;
      color: ${(props) =>
        props.selectedUsers > props.totalLicenceLimit
          ? props.theme.client.settings.migration.errorTextColor
          : props.theme.client.settings.migration.infoBlockTextColor};
    }
  }
`;

const UsersInfoBlock = ({
  t,
  selectedUsers,
  totalUsers,
  totalUsedUsers,
  totalLicenceLimit,
}: UsersInfoBlockProps) => {
  return (
    <Wrapper>
      {totalUsedUsers > totalLicenceLimit && (
        <Text className="license-limit-warning">
          {t("Settings:UserLimitExceeded", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      )}

      <UsersInfoWrapper
        selectedUsers={totalUsedUsers}
        totalLicenceLimit={totalLicenceLimit}
      >
        <Text className="selected-users-count" truncate>
          {t("Settings:SelectedUsersCounter", { selectedUsers, totalUsers })}
        </Text>
        <Text as="div" className="selected-admins-count" truncate>
          {t("Settings:LicenseLimitCounter")}
          <Text as="span">
            {totalUsedUsers}/{totalLicenceLimit}
          </Text>
        </Text>
        <HelpButton
          place="right"
          offsetRight={0}
          tooltipContent={
            <Text fontSize="12px">
              {t("Settings:LicenseLimitDescription", {
                productName: t("Common:ProductName"),
                maxLimit: totalLicenceLimit,
              })}
            </Text>
          }
        />
      </UsersInfoWrapper>
    </Wrapper>
  );
};

export default UsersInfoBlock;
