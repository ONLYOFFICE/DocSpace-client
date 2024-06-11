import { RowContainer } from "@docspace/shared/components/row-container";
import styled from "styled-components";
import SessionsRow from "./SessionsRow";

const StyledRowContainer = styled(RowContainer)`
  padding: 0px 16px;
`;

const RowView = (props) => {
  const { t, sectionWidth, connections } = props;

  return (
    <StyledRowContainer
      useReactWindow={false}
      hasMoreFiles={false}
      itemHeight={58}
      itemCount={connections.length}
      filesLength={connections.length}
      fetchMoreFiles={() => {}}
    >
      {connections.map((item) => (
        <SessionsRow
          t={t}
          key={item.id}
          item={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default RowView;
