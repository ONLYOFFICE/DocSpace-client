// (c) Copyright Ascensio System SIA 2010-2024
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

import { RowContainer } from "@docspace/shared/components/row-container";
import UsersRow from "./UsersRow";
import { Row } from "@docspace/shared/components/row";
import { Text } from "@docspace/shared/components/text";

const StyledRow = styled(Row)`
  box-sizing: border-box;
  height: 40px;
  min-height: 40px;

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const checkedAccountType = "withoutEmail";

const RowView = (props) => {
  const {
    t,
    sectionWidth,
    accountsData,
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  } = props;

  const [openedEmailKey, setOpenedEmailKey] = useState(null);

  const usersWithFilledEmails = users.withoutEmail.filter(
    (user) => user.email && user.email.length > 0,
  );

  const toggleAll = (isChecked) =>
    toggleAllAccounts(isChecked, usersWithFilledEmails, checkedAccountType);

  const handleToggle = (user) => toggleAccount(user, checkedAccountType);

  const isIndeterminate =
    checkedUsers.withoutEmail.length > 0 &&
    checkedUsers.withoutEmail.length !== usersWithFilledEmails.length;

  return (
    <RowContainer useReactWindow={false}>
      <StyledRow
        sectionWidth={sectionWidth}
        checked={
          usersWithFilledEmails.length > 0 &&
          checkedUsers.withoutEmail.length === usersWithFilledEmails.length
        }
        onSelect={toggleAll}
        indeterminate={isIndeterminate}
        isDisabled={usersWithFilledEmails.length === 0}
      >
        <Text color="#a3a9ae" fontWeight={600} fontSize="12px">
          {t("Common:Name")}
        </Text>
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
    </RowContainer>
  );
};

export default inject(({ importAccountsStore }) => {
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  } = importAccountsStore;

  return {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  };
})(observer(RowView));
