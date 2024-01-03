import { inject, observer } from "mobx-react";
import styled from "styled-components";

import RowContainer from "@docspace/components/row-container";
import SessionsRow from "./SessionsRow";

const StyledRowContainer = styled(RowContainer)`
  margin 0px 0px 20px;
`;

const RowView = (props) => {
  const { t, sectionWidth, sessionsData } = props;

  return (
    sessionsData.length !== 0 && (
      <StyledRowContainer
        className="people-row-container"
        useReactWindow={false}
        itemHeight={58}
        itemCount={6}
        filesLength={sessionsData.length}
      >
        {sessionsData.map((session) => (
          <SessionsRow
            t={t}
            sectionWidth={sectionWidth}
            data={session}
            key={session.id}
            avatar={session.avatar}
            displayName={session.displayName}
            status={session.status}
            browser={session.browser}
            platform={session.platform}
            country={session.country}
            city={session.city}
            ip={session.ip}
            userId={session.userId}
            // isChecked={isAccountChecked(data.key, checkedAccountType)}
            // toggleAccount={() => handleToggle(data)}
          />
        ))}
      </StyledRowContainer>
    )
  );
};

export default inject(({ auth }) => {
  const { id: userId } = auth.userStore.user;

  return {
    userId,
  };
})(observer(RowView));
