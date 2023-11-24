import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import UsersRow from "./UsersRow";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";

const StyledRow = styled(Row)`
  box-sizing: border-box;
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
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  } = props;

  const [openedEmailKey, setOpenedEmailKey] = useState(null);

  const usersWithFilledEmails = users.withoutEmail.filter((user) => user.email.length > 0);

  const toggleAll = (isChecked) =>
    toggleAllAccounts(isChecked, usersWithFilledEmails, checkedAccountType);

  const handleToggle = (user) => toggleAccount(user, checkedAccountType);

  const isIndeterminate =
    checkedUsers.withoutEmail.length > 0 &&
    checkedUsers.withoutEmail.length !== usersWithFilledEmails.length;

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

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
        isDisabled={usersWithFilledEmails.length === 0}>
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

export default inject(({ setup, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const { users, checkedUsers, toggleAccount, toggleAllAccounts, isAccountChecked } =
    importAccountsStore;

  return {
    viewAs,
    setViewAs,

    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
  };
})(observer(RowView));
