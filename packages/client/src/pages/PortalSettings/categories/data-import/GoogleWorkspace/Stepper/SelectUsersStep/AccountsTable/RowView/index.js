import { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import { tablet } from "@docspace/components/utils/device";
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
  min-height: 40px;

  .row-header-title {
    color: #a3a9ae;
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
  const { t, sectionWidth, viewAs, setViewAs, accountsData } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);
  const rowRef = useRef(null);

  const onCheck = (checked) => {
    setIsChecked(checked);
    if (checked) {
      setCheckbox(accountsData.map((data) => data.id));
    } else {
      setCheckbox([]);
    }
  };

  const onChangeAllCheckbox = (e) => {
    onCheck(e.target.checked);
  };

  const onChangeCheckbox = (id, checked) => {
    if (checked) {
      setCheckbox([...checkbox, id]);
    } else {
      setCheckbox([...checkbox.filter((item) => item !== id)]);
    }
  };

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  return (
    <StyledRowContainer forwardedRef={rowRef} useReactWindow={false}>
      <StyledRow
        key="Name"
        sectionWidth={sectionWidth}
        onClick={onChangeAllCheckbox}
      >
        <Text className="row-header-title">{t("Common:Name")}</Text>
      </StyledRow>
      {accountsData.map((data) => (
        <UsersRow
          key={data.id}
          id={data.id}
          data={data}
          sectionWidth={sectionWidth}
          checkbox={checkbox}
          isChecked={isChecked}
          onChangeCheckbox={onChangeCheckbox}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup }) => {
  const { viewAs, setViewAs } = setup;

  return {
    viewAs,
    setViewAs,
  };
})(observer(RowView));
