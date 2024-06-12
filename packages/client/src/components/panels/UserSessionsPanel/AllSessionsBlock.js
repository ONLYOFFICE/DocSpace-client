import { observer, inject } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import styled from "styled-components";
import RowWrapper from "./sub-components";

const Wrapper = styled.div`
  padding: 20px 20px 12px;

  .subtitle {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .desciption {
    color: ${(props) => props.theme.profile.activeSessions.subtitleColor};
    margin-bottom: 20px;
  }
`;

const AllSessionsBlock = (props) => {
  const {
    t,
    isLoading,
    connections,
    userLastSession,
    onClickLogoutAllExceptThis,
  } = props;

  const isDisabled = connections.length > 0;
  const exceptId = userLastSession.connections[0]?.id;

  return (
    <>
      <Wrapper>
        <Text className="subtitle">{t("Profile:AllSessions")}</Text>
        <Text className="desciption">{t("Profile:PanelDescription")}</Text>
        <Button
          label={t("Profile:LogoutFromAllSessions")}
          size="small"
          onClick={() => onClickLogoutAllExceptThis(t, exceptId)}
          scale={true}
          isLoading={isLoading}
          isDisabled={!isDisabled}
        />
      </Wrapper>

      <RowWrapper t={t} connections={connections} />
    </>
  );
};

export default inject(({ peopleStore }) => {
  const {
    connections,
    isLoading,
    fetchData,
    userLastSession,
    onClickLogoutAllExceptThis,
  } = peopleStore.selectionStore;

  return {
    connections,
    isLoading,
    fetchData,
    userLastSession,
    onClickLogoutAllExceptThis,
  };
})(observer(AllSessionsBlock));
