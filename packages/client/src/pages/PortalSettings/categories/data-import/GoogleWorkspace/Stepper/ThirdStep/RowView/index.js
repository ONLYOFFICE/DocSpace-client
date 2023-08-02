import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import SearchInput from "@docspace/components/search-input";
import RowContainer from "@docspace/components/row-container";
import UsersTypeRow from "./UsersTypeRow";
import { mockData } from "../../mockData.js";

const StyledRowContainer = styled(RowContainer)`
  margin: 20px 0;
`;

const RowView = (props) => {
  const { sectionWidth, viewAs, setViewAs } = props;
  const [isChecked, setIsChecked] = useState(false);
  const [checkbox, setCheckbox] = useState([]);

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
    <StyledRowContainer useReactWindow={false}>
      <SearchInput
        id="search-users-input"
        onChange={() => console.log("changed")}
        onClearSearch={() => console.log("cleared")}
        placeholder="Search"
      />
      {mockData.map((data) => (
        <UsersTypeRow
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
