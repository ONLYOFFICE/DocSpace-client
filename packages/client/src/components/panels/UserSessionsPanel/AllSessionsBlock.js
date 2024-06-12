import { useState } from "react";
import { observer, inject } from "mobx-react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
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
    connections,
    setConnections,
    userLastSession,
    fetchData,
    removeAllExceptThisEventId,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const isDisabled = connections.length > 0;

  const onLogoutClick = async () => {
    const exceptId = userLastSession.connections[0]?.id;
    try {
      setIsLoading(true);
      await removeAllExceptThisEventId(connections[0]?.id);

      const filteredConnections = connections.filter(
        (connection) => connection.id === exceptId,
      );
      setConnections(filteredConnections);
      await fetchData();
      toastr.success("Successfully logout except this");
    } catch (error) {
      toastr.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Wrapper>
        <Text className="subtitle">{t("Profile:AllSessions")}</Text>
        <Text className="desciption">{t("Profile:PanelDescription")}</Text>
        <Button
          label={t("Profile:LogoutFromAllSessions")}
          size="small"
          onClick={onLogoutClick}
          scale={true}
          isLoading={isLoading}
          isDisabled={!isDisabled}
        />
      </Wrapper>

      <RowWrapper t={t} connections={connections} />
    </>
  );
};

export default inject(({ setup, peopleStore }) => {
  const { removeAllExceptThisEventId } = setup;
  const { connections, setConnections, fetchData, userLastSession } =
    peopleStore.selectionStore;

  return {
    connections,
    setConnections,
    userLastSession,
    fetchData,
    removeAllExceptThisEventId,
  };
})(observer(AllSessionsBlock));
