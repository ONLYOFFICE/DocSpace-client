import { useRef } from "react";
import { withTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import styled, { css } from "styled-components";

import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Heading } from "@docspace/shared/components/heading";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import AllSessionsBlock from "./AllSessionsBlock";
import LastSessionBlock from "./LastSessionBlock";

const StyledSessionsPanel = styled.div`
  .user-sessions-panel {
    .scroll-body {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-left: 0px !important;
            `
          : css`
              padding-right: 0px !important;
            `}
    }
  }
`;

const StyledHeaderContent = styled.div`
  padding: 0px 16px;
  border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

  .user-sessions-panel-heading {
    font-weight: 700;
    font-size: 21px;
    margin: 12px 0px;
  }
`;

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100vh - 87px) !important;
`;

const UserSessionsPanel = (props) => {
  const { t, visible, setVisible } = props;
  const scrollRef = useRef(null);

  const onClose = () => {
    setVisible(false);
  };

  return (
    <StyledSessionsPanel>
      <Backdrop
        onClick={onClose}
        visible={visible}
        isAside={true}
        zIndex={210}
      />
      <Aside
        className="user-sessions-panel"
        visible={visible}
        onClose={onClose}
      >
        <StyledHeaderContent>
          <Heading className="user-sessions-panel-heading">
            {t("Profile:ActiveSessions")}
          </Heading>
        </StyledHeaderContent>

        <StyledScrollbar ref={scrollRef}>
          <LastSessionBlock t={t} />
          <AllSessionsBlock t={t} />
        </StyledScrollbar>
      </Aside>
    </StyledSessionsPanel>
  );
};

export default inject(({ dialogsStore }) => {
  const { userSessionsPanelVisible, setUserSessionPanelVisible } = dialogsStore;

  return {
    visible: userSessionsPanelVisible,
    setVisible: setUserSessionPanelVisible,
  };
})(
  withTranslation(["Settings", "Profile", "Common"])(
    observer(UserSessionsPanel),
  ),
);
