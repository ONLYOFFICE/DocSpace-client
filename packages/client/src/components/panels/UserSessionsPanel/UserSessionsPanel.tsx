// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";
import styled from "styled-components";

import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Scrollbar } from "@docspace/shared/components/scrollbar";
import AllSessionsBlock from "./AllSessionsBlock";
import LastSessionBlock from "./LastSessionBlock";

import { UserSessionsPanelProps } from "./UserSessionsPanel.types";

const StyledSessionsPanel = styled.div`
  .user-sessions-panel {
    .scroll-body {
      padding-inline-end: 0px !important;
    }
  }
`;

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100vh - 87px) !important;
`;

export const UserSessionsPanel = (props: UserSessionsPanelProps) => {
  const { storeProps } = props;
  const {
    visible,
    setVisible,
    fetchUserSessions,
    bufferSelection,
    setBufferSelection,
    subscribeToUserSessions,
    unsubscribeToUserSessions,
    clearUserSessions,
  } = storeProps!;

  const { t } = useTranslation(["Settings", "Profile", "Common"]);
  const scrollRef = useRef(null);

  const onClose = () => {
    setVisible(false);
    setBufferSelection(null);
  };

  useEffect(() => {
    if (!bufferSelection) return;

    fetchUserSessions(bufferSelection.userId);
    subscribeToUserSessions(bufferSelection.userId);

    return () => {
      unsubscribeToUserSessions();
      clearUserSessions();
    };
  }, [
    bufferSelection,
    fetchUserSessions,
    subscribeToUserSessions,
    unsubscribeToUserSessions,
    clearUserSessions,
  ]);

  return (
    <StyledSessionsPanel>
      <Backdrop onClick={onClose} visible={visible} zIndex={210} isAside />
      <Aside
        className="user-sessions-panel"
        visible={visible}
        onClose={onClose}
        withoutHeader={false}
        header={t("Profile:ActiveSessions")}
      >
        <StyledScrollbar ref={scrollRef}>
          <LastSessionBlock t={t} />
          <AllSessionsBlock t={t} />
        </StyledScrollbar>
      </Aside>
    </StyledSessionsPanel>
  );
};

export const SessionsPanel = inject<TStore>(
  ({ dialogsStore, sessionsStore }) => {
    const { userSessionsPanelVisible, setUserSessionPanelVisible } =
      dialogsStore;
    const {
      fetchUserSessions,
      subscribeToUserSessions,
      bufferSelection,
      setBufferSelection,
      unsubscribeToUserSessions,
      clearUserSessions,
    } = sessionsStore;

    return {
      storeProps: {
        visible: userSessionsPanelVisible,
        setVisible: setUserSessionPanelVisible,
        fetchUserSessions,
        subscribeToUserSessions,
        bufferSelection,
        setBufferSelection,
        unsubscribeToUserSessions,
        clearUserSessions,
      },
    };
  },
)(observer(UserSessionsPanel));
