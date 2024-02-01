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
    color: ${(props) => props.theme.activeSessions.subtitleColor};
    margin-bottom: 20px;
  }
`;

const AllSessionsBlock = (props) => {
  const { t, allSessions, data } = props;

  const onLogoutClick = () => {
    console.log("Logout all sessions");
  };

  const foundSession = allSessions.find(
    (session) => session?.userId === data?.userId
  );

  const sessionsData = foundSession
    ? foundSession.sessions.map((data) => data)
    : [];

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
          isLoading={false}
        />
      </Wrapper>

      <RowWrapper t={t} sessionsData={sessionsData} />
    </>
  );
};

export default AllSessionsBlock;
