import { inject, observer } from "mobx-react";
import { Row } from "@docspace/shared/components/row";
import styled from "styled-components";

import SessionsRowContent from "./SessionsRowContent";

const StyledRow = styled(Row)`
  min-height: 56px;
`;

const SessionsRow = (props) => {
  const { item, sectionWidth } = props;

  return (
    <StyledRow
      key={item.id}
      data={item}
      sectionWidth={sectionWidth}
      contextButtonSpacerWidth="0"
    >
      <SessionsRowContent {...props} />
    </StyledRow>
  );
};

export default inject(({ setup }) => {
  const { setSessionModalData, setLogoutDialogVisible } = setup;

  return {
    setSessionModalData,
    setLogoutDialogVisible,
  };
})(observer(SessionsRow));
