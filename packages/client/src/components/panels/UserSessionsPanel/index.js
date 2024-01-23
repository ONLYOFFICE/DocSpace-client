import { useRef } from "react";
import { observer, inject } from "mobx-react";

import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Heading } from "@docspace/shared/components/heading";

import UserSessions from "./UserSessions";

import {
  StyledUserSessionsPanel,
  StyledScrollbar,
} from "./StyledUserSessionsPanel";

const UserSessionsPanel = (props) => {
  const { visible, setVisible } = props;

  const scrollRef = useRef(null);

  const onClose = () => {
    setVisible(false);
  };

  return (
    <StyledUserSessionsPanel>
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
        <div className="user-sessions-header">
          <Heading className="header-text">Active sessions</Heading>
        </div>

        <StyledScrollbar ref={scrollRef} stype="mediumBlack">
          <UserSessions />
        </StyledScrollbar>
      </Aside>
    </StyledUserSessionsPanel>
  );
};

export default inject(({ dialogsStore }) => {
  const { userSessionsPanelVisible, setUserSessionPanelVisible } = dialogsStore;

  return {
    visible: userSessionsPanelVisible,
    setVisible: setUserSessionPanelVisible,
  };
})(observer(UserSessionsPanel));
