import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import UsersRow from "./UsersRow";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";

const StyledRowContainer = styled(RowContainer)`
  margin: 20px 0;
`;

const StyledRow = styled(Row)`
  box-sizing: border-box;
  min-height: 40px;

  @media ${tablet} {
    .row_content {
      height: auto;
    }
  }
`;

const RowView = (props) => {
  const {
    t,
    viewAs,
    withoutEmailUsers,
    setViewAs,
    sectionWidth,
    accountsData,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    clearCheckedAccounts,
  } = props;

  const toggleAll = (e) =>
    toggleAllAccounts({ target: { checked: !e.target.checked } }, withoutEmailUsers);

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }

    return clearCheckedAccounts;
  }, [sectionWidth]);

  return (
    <StyledRowContainer useReactWindow={false}>
      <StyledRow
        sectionWidth={sectionWidth}
        checkbox
        checked={checkedAccounts.length === withoutEmailUsers.length}
        onClick={toggleAll}
        indeterminate={
          checkedAccounts.length > 0 && checkedAccounts.length !== withoutEmailUsers.length
        }>
        <Text color="#a3a9ae" fontWeight={600} fontSize="12px">
          {t("Common:Name")}
        </Text>
      </StyledRow>
      {accountsData.map((data) => (
        <UsersRow
          t={t}
          key={data.id}
          data={data}
          sectionWidth={sectionWidth}
          toggleAccount={() => toggleAccount(data.id)}
          isChecked={isAccountChecked(data.id)}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup, importAccountsStore }) => {
  const { viewAs, setViewAs } = setup;
  const {
    withoutEmailUsers,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    clearCheckedAccounts,
  } = importAccountsStore;

  return {
    withoutEmailUsers,
    viewAs,
    setViewAs,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    clearCheckedAccounts,
  };
})(observer(RowView));
