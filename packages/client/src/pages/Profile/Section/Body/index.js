// (c) Copyright Ascensio System SIA 2009-2025
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

import styled from "styled-components";

import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { ProfileViewLoader } from "@docspace/shared/skeletons/profile";
import { Tabs } from "@docspace/shared/components/tabs";

import { tablet } from "@docspace/shared/utils";

import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";
import MainProfile from "./sub-components/main-profile";
import LoginContent from "./sub-components/LoginContent";
import Notifications from "./sub-components/notifications";
import FileManagement from "./sub-components/file-management";
import InterfaceTheme from "./sub-components/interface-theme";

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

const StyledTabs = styled(Tabs)`
  > .sticky {
    z-index: 201;
  }
`;

const SectionBodyContent = (props) => {
  const { showProfileLoader, currentDeviceType, identityServerEnabled, t } =
    props;
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
  ];

  if (identityServerEnabled) {
    data.push({
      id: "authorized-apps",
      name: t("OAuth:AuthorizedApps"),
      content: <AuthorizedApps />,
    });
  }

  data.splice(2, 0, {
    id: "file-management",
    name: t("FileManagement"),
    content: <FileManagement />,
  });

  const getCurrentTabId = () => {
    const path = window.location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const currentTabId = getCurrentTabId();

  const onSelect = (e) => {
    const arrayPaths = window.location.pathname.split("/");
    arrayPaths.splice(arrayPaths.length - 1);
    const path = arrayPaths.join("/");
    navigate(`${path}/${e.id}`, { state: { disableScrollToTop: true } });
  };

  if (showProfileLoader) return <ProfileViewLoader />;
  return (
    <Wrapper>
      <MainProfile />
      <StyledTabs
        items={data}
        selectedItemId={currentTabId}
        onSelect={onSelect}
        stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
      />
    </Wrapper>
  );
};

export default inject(({ settingsStore, clientLoadingStore, authStore }) => {
  const { showProfileLoader } = clientLoadingStore;

  const identityServerEnabled = authStore?.capabilities?.identityServerEnabled;

  return {
    currentDeviceType: settingsStore.currentDeviceType,
    showProfileLoader,
    identityServerEnabled,
  };
})(
  observer(
    withTranslation([
      "Profile",
      "Common",
      "PeopleTranslations",
      "ResetApplicationDialog",
      "BackupCodesDialog",
      "DeleteSelfProfileDialog",
      "Notifications",
      "ConnectDialog",
      "OAuth",
    ])(SectionBodyContent),
  ),
);
