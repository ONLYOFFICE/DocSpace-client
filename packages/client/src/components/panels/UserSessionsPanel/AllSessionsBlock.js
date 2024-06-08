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
    sessionData,
    removeAllActiveSessionsById,
    setSessionModalData,
    fetchData,
  } = props;

  const isDisabled = sessionData.length > 0;

  const onLogoutClick = async () => {
    try {
      await removeAllActiveSessionsById(sessionData[0]?.userId);
      await fetchData();
      setSessionModalData([]);
      toastr.success("Successfully logout all sessions");
    } catch (error) {
      toastr.error(error);
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
          isLoading={false}
          isDisabled={!isDisabled}
        />
      </Wrapper>

      <RowWrapper t={t} sessionsData={sessionData} />
    </>
  );
};

export default AllSessionsBlock;
