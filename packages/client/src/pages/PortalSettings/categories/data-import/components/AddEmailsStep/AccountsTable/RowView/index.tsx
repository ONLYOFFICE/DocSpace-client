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

import { useState } from "react";
import { inject, observer } from "mobx-react";
import { tablet } from "@docspace/shared/utils/device";
import styled from "styled-components";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { RowContainer, Row } from "@docspace/shared/components/rows";
import { Text } from "@docspace/shared/components/text";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { TEnhancedMigrationUser } from "@docspace/shared/api/settings/types";
import UsersRow from "./UsersRow";
import { AddEmailRowProps, RowViewProps } from "../../../../types";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;

  .clear-icon {
    margin-inline-end: 8px;
  }

  .buttons-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
`;

const StyledRow = styled(Row)`
  box-sizing: border-box;
  height: 40px;
  min-height: 40px;

  .row-header-title {
    color: ${(props) => props.theme.client.settings.migration.tableHeaderText};
    font-weight: 600;
    font-size: 12px;
  }

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const checkedAccountType = "withoutEmail";

const RowView = (props: RowViewProps) => {
  const {
    t,
    sectionWidth,
    accountsData,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = props as AddEmailRowProps;

  const [openedEmailKey, setOpenedEmailKey] = useState("");

  const usersWithFilledEmails = users.withoutEmail.filter(
    (user) => user.email && user.email.length > 0,
  );

  const toggleAll = (isChecked: boolean) =>
    toggleAllAccounts(isChecked, usersWithFilledEmails, checkedAccountType);

  const handleToggle = (user: TEnhancedMigrationUser) =>
    toggleAccount(user, checkedAccountType);

  const onClearFilter = () => setSearchValue("");

  const isIndeterminate =
    checkedUsers.withoutEmail.length > 0 &&
    checkedUsers.withoutEmail.length !== usersWithFilledEmails.length;

  const isChecked =
    usersWithFilledEmails.length > 0 &&
    checkedUsers.withoutEmail.length === usersWithFilledEmails.length;

  return (
    <StyledRowContainer useReactWindow={false}>
      {accountsData.length > 0 ? (
        <>
          <StyledRow
            checked={isChecked}
            onSelect={toggleAll}
            indeterminate={isIndeterminate}
            isDisabled={usersWithFilledEmails.length === 0}
          >
            <Text className="row-header-title">{t("Common:Name")}</Text>
          </StyledRow>
          {accountsData.map((data) => (
            <UsersRow
              t={t}
              key={data.key}
              data={data}
              sectionWidth={sectionWidth}
              toggleAccount={() => handleToggle(data)}
              isChecked={isAccountChecked(data.key, checkedAccountType)}
              isEmailOpen={openedEmailKey === data.key}
              setOpenedEmailKey={setOpenedEmailKey}
            />
          ))}
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
          headerText={t("Common:NotFoundUsers")}
          descriptionText={t("Common:NotFoundUsersDescription")}
          buttons={
            <div className="buttons-box">
              <IconButton
                className="clear-icon"
                isFill
                size={12}
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link
                type={LinkType.action}
                isHovered
                fontWeight="600"
                onClick={onClearFilter}
              >
                {t("Common:ClearFilter")}
              </Link>
            </div>
          }
        />
      )}
      <div />
    </StyledRowContainer>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(RowView));
