import { useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
import { mockData } from "../../../mockData";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import Row from "@docspace/components/row";
import Text from "@docspace/components/text";
import UsersRow from "./UsersRow";

const StyledRowContainer = styled(RowContainer)`
  margin: 0 0 20px;
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

const RowView = (props) => {
  const {
    t,
    sectionWidth,
    viewAs,
    setViewAs,
    accountsData,
    checkedAccounts,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    cleanCheckedAccounts,
  } = props;
  const rowRef = useRef(null);

  const toggleAll = (e) => {
    toggleAllAccounts({ target: { checked: !e.target.checked } }, mockData);
  };

  const isIndeterminate =
    checkedAccounts.length > 0 && checkedAccounts.length !== mockData.length;

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
    <StyledRowContainer forwardedRef={rowRef} useReactWindow={false}>
      <StyledRow
        sectionWidth={sectionWidth}
        onClick={toggleAll}
        indeterminate={isIndeterminate}
        checkbox
        checked={checkedAccounts.length === mockData.length}
      >
        <Text className="row-header-title">{t("Common:Name")}</Text>
      </StyledRow>
      {accountsData.map((data) => (
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
