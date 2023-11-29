import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import Loaders from "@docspace/common/components/Loaders";
import Submenu from "@docspace/components/submenu";

import MainProfile from "./sub-components/main-profile";
import LoginContent from "./sub-components/LoginContent";
import Notifications from "./sub-components/notifications";
import FileManagement from "./sub-components/file-management";
import InterfaceTheme from "./sub-components/interface-theme";

import { tablet } from "@docspace/components/utils/device";
import { DeviceType } from "@docspace/common/constants";
import AuthorizedApps from "./sub-components/authorized-apps";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media ${tablet} {
    width: 100%;
    max-width: 100%;
  }
`;

const SectionBodyContent = (props) => {
  const { showProfileLoader, profile, currentDeviceType, t } = props;
  const navigate = useNavigate();

  const data = [
    {
      id: "login",
      name: t("ConnectDialog:Login"),
      content: <LoginContent />,
    },
    {
      id: "notifications",
      name: t("Notifications:Notifications"),
      content: <Notifications />,
    },
    {
      id: "interface-theme",
      name: t("InterfaceTheme"),
      content: <InterfaceTheme />,
    },
    {
      id: "authorized-apps",
      name: t("OAuth:AuthorizedApps"),
      content: <AuthorizedApps />,
    },
  ];

  if (!profile?.isVisitor)
    data.splice(2, 0, {
      id: "file-management",
      name: t("FileManagement"),
      content: <FileManagement />,
    });

  const getCurrentTab = () => {
    const path = location.pathname;
    const currentTab = data.findIndex((item) => path.includes(item.id));
    return currentTab !== -1 ? currentTab : 0;
  };

  const currentTab = getCurrentTab();

  const onSelect = (e) => {
    const arrayPaths = location.pathname.split("/");
    arrayPaths.splice(arrayPaths.length - 1);
    const path = arrayPaths.join("/");
    navigate(`${path}/${e.id}`, { state: { disableScrollToTop: true } });
  };

  if (showProfileLoader) return <Loaders.ProfileView />;
  return (
    <Wrapper>
      <MainProfile />
      <Submenu
        data={data}
        startSelect={currentTab}
        onSelect={onSelect}
        topProps={
          currentDeviceType === DeviceType.desktop
            ? 0
            : currentDeviceType === DeviceType.mobile
            ? "53px"
            : "61px"
        }
      />
    </Wrapper>
  );
};

export default inject(({ auth, peopleStore, clientLoadingStore }) => {
  const { showProfileLoader } = clientLoadingStore;
  const { targetUser: profile } = peopleStore.targetUserStore;

  return {
    profile,
    currentDeviceType: auth.settingsStore.currentDeviceType,
    showProfileLoader,
  };
})(
  observer(
    withTranslation([
      "Profile",
      "Common",
      "PeopleTranslations",
      "ProfileAction",
      "ResetApplicationDialog",
      "BackupCodesDialog",
      "DeleteSelfProfileDialog",
      "Notifications",
      "ConnectDialog",
      "OAuth",
    ])(SectionBodyContent)
  )
);
