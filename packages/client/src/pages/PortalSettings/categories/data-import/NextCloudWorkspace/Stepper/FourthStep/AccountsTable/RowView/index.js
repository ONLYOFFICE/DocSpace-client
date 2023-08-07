import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import UsersRow from "./UsersRow";
import { mockData } from "../../mockData";

const StyledRowContainer = styled(RowContainer)`
  margin: 20px 0;
`;

const RowView = (props) => {
  const { sectionWidth, viewAs, setViewAs } = props;

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
      {mockData.map((data) => (
        <UsersRow key={data.id} data={data} sectionWidth={sectionWidth} />
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
