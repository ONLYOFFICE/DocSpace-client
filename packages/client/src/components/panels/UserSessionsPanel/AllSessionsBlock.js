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
    color: #657077;
    margin-bottom: 20px;
  }
`;

const AllSessionsBlock = (props) => {
  const { t, allSessions } = props;

  const onLogoutClick = () => {
    console.log("Logout all sessions");
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
          isLoading={false}
        />
      </Wrapper>

      <RowWrapper t={t} sessionsData={allSessions} />
    </>
  );
};

export default AllSessionsBlock;
