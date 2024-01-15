import { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { mobile, tablet } from "@docspace/components/utils/device";
import styled from "styled-components";

import { MainContainer } from "../StyledSecurity";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";
import SessionsTable from "./SessionsTable";
import mockData from "./mockData";

import Text from "@docspace/components/text";
import Button from "@docspace/components/button";

const DownLoadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  position: sticky;
  bottom: 0;
  background-color: ${({ theme }) => theme.backgroundColor};

  @media ${mobile} {
    position: fixed;
    padding-inline: 16px;
    inset-inline: 0;
  }

  .download-report_button {
    width: auto;
    height: auto;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    line-height: ${(props) => props.theme.getCorrectFontSize("20px")};
    padding-top: 5px;
    padding-bottom: 5px;

    @media ${tablet} {
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
      padding-top: 11px;
      padding-bottom: 11px;
    }

    @media ${mobile} {
      width: 100%;
    }
  }

  .download-report_description {
    font-style: normal;
    font-weight: 400;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
    line-height: 16px;

    height: 16px;

    margin: 0;
    color: ${(props) =>
      props.theme.client.settings.security.auditTrail
        .downloadReportDescriptionColor};
  }

  @media ${mobile} {
    flex-direction: column-reverse;
  }
`;

const Sessions = ({
  t,
  viewAs,
  setViewAs,
  currentDeviceType,
  allSessions,
  setAllSessions,
  isLoadingDownloadReport,
  clearSelection,
}) => {
  useEffect(() => {
    setAllSessions(mockData);
    return () => {
      clearSelection();
    };
  }, []);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <MainContainer>
      <Text className="subtitle">{t("SessionsSubtitle")}</Text>

      <SessionsTable t={t} sessionsData={allSessions} />

      <DownLoadWrapper>
        <Button
          className="download-report_button"
          primary
          label={t("DownloadReportBtnText")}
          size="normal"
          minwidth="auto"
          onClick={() => console.log("get report")}
          isLoading={isLoadingDownloadReport}
        />
        <span className="download-report_description">
          {t("DownloadReportDescription")}
        </span>
      </DownLoadWrapper>
    </MainContainer>
  );
};

export default inject(({ auth, setup, peopleStore }) => {
  const { culture, currentDeviceType } = auth.settingsStore;
  const { user } = auth.userStore;
  const { viewAs, setViewAs, isLoadingDownloadReport } = setup;
  const locale = (user && user.cultureName) || culture || "en";

  const { clearSelection, allSessions, setAllSessions } =
    peopleStore.selectionStore;

  return {
    locale,
    currentDeviceType,
    viewAs,
    setViewAs,
    isLoadingDownloadReport,
    allSessions,
    setAllSessions,
    clearSelection,
  };
})(withTranslation(["Settings", "Common"])(observer(Sessions)));
