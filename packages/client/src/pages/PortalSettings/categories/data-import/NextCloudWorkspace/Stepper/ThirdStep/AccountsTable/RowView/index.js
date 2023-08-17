import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import UsersRow from "./UsersRow";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";

import { mockData } from "../../mockData";

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
    viewAs,
    setViewAs,
    sectionWidth,
    accountsData,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
  } = props;

  const toggleAll = (e) => toggleAllAccounts(e, mockData);

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }

    return cleanCheckedAccounts;
  }, [sectionWidth]);

  return (
    <StyledRowContainer useReactWindow={false}>
      <StyledRow
        sectionWidth={sectionWidth}
        checkbox
        checked={checkedAccounts.length === accountsData.length}
        onClick={toggleAll}
        isIndeterminate={
          checkedAccounts.length > 0 && checkedAccounts.length !== accountsData.length
        }
        onSelect={(isChecked) => toggleAllAccounts({ target: { checked: isChecked } }, mockData)}>
        <Text color="#a3a9ae" fontWeight={600} fontSize="12px">
          Name
        </Text>
      </StyledRow>
      {mockData.map((data) => (
        <UsersRow
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
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
  } = importAccountsStore;

  return {
    viewAs,
    setViewAs,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
  };
})(observer(RowView));
