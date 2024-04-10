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

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { DeviceType } from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside } from "@docspace/shared/components/aside";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { isDesktop, isMobile, size } from "@docspace/shared/utils";

import {
  StyledBlock,
  StyledHeading,
  StyledInvitePanel,
  StyledButtons,
  StyledControlContainer,
  StyledCrossIconMobile,
} from "./StyledInvitePanel";

import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";
import ExternalLinks from "./sub-components/ExternalLinks";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import InfoBar from "./sub-components/InfoBar";
import InvitePanelLoader from "./sub-components/InvitePanelLoader";

const InvitePanel = ({
  folders,
  getFolderInfo,
  inviteItems,
  roomId,
  setInviteItems,
  setInvitePanelOptions,
  t,
  visible,
  setRoomSecurity,
  getRoomSecurityInfo,
  getPortalInviteLinks,
  userLink,
  guestLink,
  adminLink,
  collaboratorLink,
  defaultAccess,
  inviteUsers,
  setInfoPanelIsMobileHidden,
  updateInfoPanelSelection,
  addInfoPanelMembers,
  setInviteLanguage,
  getUsersList,
  filter,
  currentDeviceType,
}) => {
  const [invitePanelIsLoding, setInvitePanelIsLoading] = useState(
    () =>
      ((!userLink || !guestLink || !collaboratorLink) && !adminLink) ||
      roomId !== -1,
  );
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [shareLinks, setShareLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalLinksVisible, setExternalLinksVisible] = useState(false);
  const [scrollAllPanelContent, setScrollAllPanelContent] = useState(false);
  const [activeLink, setActiveLink] = useState({});
  const [infoBarIsVisible, setInfoBarIsVisible] = useState(true);
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const [cultureKey, setCultureKey] = useState();

  const onCloseBar = () => setInfoBarIsVisible(false);

  const inputsRef = useRef();
  const invitePanelBodyRef = useRef();
  const invitePanelWrapper = useRef(null);
  const invitePanelRef = useRef(null);
  const windowHeight = useRef(window.innerHeight);
  const loaderRef = useRef();

  const onChangeExternalLinksVisible = (visible) => {
    setExternalLinksVisible(visible);
  };

  const selectRoom = () => {
    const room = folders.find((folder) => folder.id === roomId);

    if (room) {
      setSelectedRoom(room);
      return Promise.resolve();
    } else {
      return getFolderInfo(roomId).then((info) => {
        setSelectedRoom(info);
      });
    }
  };

  const getInfo = () => {
    return getRoomSecurityInfo(roomId).then((links) => {
      const link = links && links[0];
      if (link) {
        const { shareLink, id, title, expirationDate } = link.sharedTo;

        const activeLink = {
          id,
          title,
          shareLink,
          expirationDate,
          access: link.access || defaultAccess,
        };

        onChangeExternalLinksVisible(!!links.length);

        setShareLinks([activeLink]);
        setActiveLink(activeLink);
      }
    });
  };

  const clearLoaderTimeout = () => {
    clearTimeout(loaderRef.current);
    loaderRef.current = undefined;
  };

  const disableInvitePanelLoader = () => {
    if (loaderRef.current) return;

    loaderRef.current = setTimeout(() => {
      setInvitePanelIsLoading(false);
    }, LOADER_TIMEOUT);
  };

  useEffect(() => {
    if (roomId === -1) {
      if ((!userLink || !guestLink || !collaboratorLink) && !adminLink) {
        setInvitePanelIsLoading(true);
        getPortalInviteLinks().finally(() => {
          disableInvitePanelLoader();
        });
      }

      setShareLinks([
        {
          id: "user",
          title: "User",
          shareLink: userLink,
          access: 1,
        },
        {
          id: "guest",
          title: "Guest",
          shareLink: guestLink,
          access: 2,
        },
        {
          id: "admin",
          title: "Admin",
          shareLink: adminLink,
          access: 3,
        },
        {
          id: "collaborator",
          title: "Collaborator",
          shareLink: collaboratorLink,
          access: 4,
        },
      ]);

      return;
    }

    setInvitePanelIsLoading(true);
    Promise.all([selectRoom(), getInfo()]).finally(() => {
      disableInvitePanelLoader(false);
    });
  }, [roomId, userLink, guestLink, adminLink, collaboratorLink]);

  useEffect(() => {
    const hasErrors = inviteItems.some((item) => !!item.errors?.length);

    setHasErrors(hasErrors);
  }, [inviteItems]);

  useEffect(() => {
    onCheckHeight();
    window.addEventListener("resize", onCheckHeight);
    return () => {
      window.removeEventListener("resize", onCheckHeight);
      window.removeEventListener("mousedown", onMouseDown);
      clearLoaderTimeout();
    };
  }, []);

  useEffect(() => {
    isMobileView && window.addEventListener("mousedown", onMouseDown);
  }, [isMobileView]);

  useEffect(() => {
    window.visualViewport.addEventListener("resize", onResize);

    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
    };
  }, []);

  const onResize = useCallback((e) => {
    const diff = windowHeight.current - e.target.height;

    if (invitePanelRef.current) {
      invitePanelRef.current.style.height = `${e.target.height - 64}px`;
      // invitePanelRef.current.style.bottom = `${diff}px`;
      invitePanelWrapper.current.style.height = `${e.target.height}px`;
      invitePanelWrapper.current.style.bottom = `${diff}px`;
    }
  }, []);

  const onMouseDown = (e) => {
    if (e.target.id === "InvitePanelWrapper") onClose();
  };

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  const onClose = () => {
    setInviteLanguage({ key: "", label: "" });
    setInfoPanelIsMobileHidden(false);
    setInvitePanelOptions({
      visible: false,
      hideSelector: false,
      defaultAccess: 1,
    });
    setInviteItems([]);
  };

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    document.addEventListener("keyup", onKeyPress);
    return () => document.removeEventListener("keyup", onKeyPress);
  });

  const onClickSend = async (e) => {
    const invitations = inviteItems.map((item) => {
      let newItem = {};

      roomId === -1
        ? (newItem.type = item.access)
        : (newItem.access = item.access);

      item.avatar || item.isGroup
        ? (newItem.id = item.id)
        : (newItem.email = item.email);

      return newItem;
    });

    const data = {
      invitations,
      culture: cultureKey,
    };
    if (roomId !== -1) {
      data.notify = true;
      data.message = "Invitation message";
    }

    try {
      setIsLoading(true);
      const isRooms = roomId !== -1;
      const result = !isRooms
        ? await inviteUsers(data)
        : await setRoomSecurity(roomId, data);

      setIsLoading(false);

      if (isRooms) {
        addInfoPanelMembers(t, result.members);
      }

      console.log(result);

      onClose();
      toastr.success(t("Common:UsersInvited"));

      if (result?.warning) {
        toastr.warning(result?.warning);
      }

      updateInfoPanelSelection();
    } catch (err) {
      toastr.error(err);
      setIsLoading(false);
    } finally {
      if (roomId === -1) {
        await getUsersList(filter, false);
      }
    }
  };

  const roomType = selectedRoom ? selectedRoom.roomType : -1;
  const hasInvitedUsers = !!inviteItems.length;
  const hasAdmins = inviteItems.findIndex((u) => u.isAdmin || u.isOwner) > -1;

  const bodyInvitePanel = useMemo(() => {
    return (
      <>
        <ExternalLinks
          t={t}
          shareLinks={shareLinks}
          setShareLinks={setShareLinks}
          getInfo={getInfo}
          roomType={roomType}
          onChangeExternalLinksVisible={onChangeExternalLinksVisible}
          externalLinksVisible={externalLinksVisible}
          setActiveLink={setActiveLink}
          activeLink={activeLink}
          isMobileView={isMobileView}
        />

        <InviteInput
          t={t}
          onClose={onClose}
          setCultureKey={setCultureKey}
          roomType={roomType}
          inputsRef={inputsRef}
          addUsersPanelVisible={addUsersPanelVisible}
          setAddUsersPanelVisible={setAddUsersPanelVisible}
          isMobileView={isMobileView}
        />
        {infoBarIsVisible && hasAdmins && (
          <InfoBar t={t} onClose={onCloseBar} />
        )}
        {hasInvitedUsers && (
          <ItemsList
            t={t}
            setHasErrors={setHasErrors}
            roomType={roomType}
            externalLinksVisible={externalLinksVisible}
            scrollAllPanelContent={scrollAllPanelContent}
            inputsRef={inputsRef}
            invitePanelBodyRef={invitePanelBodyRef}
            isMobileView={isMobileView}
          />
        )}
      </>
    );
  }, [
    t,
    shareLinks,
    getInfo,
    roomType,
    onChangeExternalLinksVisible,
    externalLinksVisible,
    onClose,
    setHasErrors,
    scrollAllPanelContent,
    hasInvitedUsers,
    invitePanelBodyRef,
  ]);

  const invitePanelNode = (
    <>
      <StyledBlock>
        <StyledHeading>{t("Common:InviteUsers")}</StyledHeading>
      </StyledBlock>
      {invitePanelIsLoding ? (
        <InvitePanelLoader />
      ) : (
        <>
          {scrollAllPanelContent ? (
            <div className="invite-panel-body" ref={invitePanelBodyRef}>
              <Scrollbar>{bodyInvitePanel}</Scrollbar>
            </div>
          ) : (
            bodyInvitePanel
          )}

          <StyledButtons>
            <Button
              className="send-invitation"
              scale={true}
              size={"normal"}
              isDisabled={hasErrors || !hasInvitedUsers}
              primary
              onClick={onClickSend}
              label={t("SendInvitation")}
              isLoading={isLoading}
            />
            <Button
              className="cancel-button"
              scale={true}
              size={"normal"}
              onClick={onClose}
              label={t("Common:CancelButton")}
              isDisabled={isLoading}
            />
          </StyledButtons>
        </>
      )}
    </>
  );

  const invitePanelComponent = (
    <StyledInvitePanel
      id="InvitePanelWrapper"
      hasInvitedUsers={hasInvitedUsers}
      scrollAllPanelContent={scrollAllPanelContent}
      addUsersPanelVisible={addUsersPanelVisible}
      ref={invitePanelWrapper}
    >
      {isMobileView ? (
        <div className="invite_panel" ref={invitePanelRef}>
          <StyledControlContainer onClick={onClose}>
            <StyledCrossIconMobile />
          </StyledControlContainer>
          {invitePanelNode}
        </div>
      ) : (
        <>
          <Backdrop
            onClick={onClose}
            visible={visible}
            isAside={true}
            zIndex={currentDeviceType === DeviceType.mobile ? 10 : 210}
          />
          <Aside
            className="invite_panel"
            visible={visible}
            onClose={onClose}
            withoutBodyScroll
            zIndex={310}
          >
            {invitePanelNode}
          </Aside>
        </>
      )}
    </StyledInvitePanel>
  );

  const renderPortalInvitePanel = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={invitePanelComponent}
        appendTo={rootElement}
        visible={visible}
      />
    );
  };

  return currentDeviceType === DeviceType.mobile
    ? renderPortalInvitePanel()
    : invitePanelComponent;
};

export default inject(
  ({
    settingsStore,
    peopleStore,
    filesStore,
    dialogsStore,
    infoPanelStore,
  }) => {
    const { theme, currentDeviceType } = settingsStore;

    const { getUsersByQuery, inviteUsers, getUsersList } =
      peopleStore.usersStore;
    const { filter } = peopleStore.filterStore;
    const {
      setIsMobileHidden: setInfoPanelIsMobileHidden,
      updateInfoPanelSelection,
      addInfoPanelMembers,
    } = infoPanelStore;

    const {
      getPortalInviteLinks,
      userLink,
      guestLink,
      adminLink,
      collaboratorLink,
    } = peopleStore.inviteLinksStore;

    const {
      inviteItems,
      invitePanelOptions,
      setInviteItems,
      setInvitePanelOptions,
      setInviteLanguage,
    } = dialogsStore;

    const { getFolderInfo, setRoomSecurity, getRoomSecurityInfo, folders } =
      filesStore;

    return {
      folders,
      setInviteLanguage,
      getUsersByQuery,
      getRoomSecurityInfo,
      inviteItems,
      roomId: invitePanelOptions.roomId,
      setInviteItems,
      setInvitePanelOptions,
      setRoomSecurity,
      theme,
      visible: invitePanelOptions.visible,
      defaultAccess: invitePanelOptions.defaultAccess,
      getFolderInfo,
      getPortalInviteLinks,
      userLink,
      guestLink,
      adminLink,
      collaboratorLink,
      inviteUsers,
      setInfoPanelIsMobileHidden,
      updateInfoPanelSelection,
      addInfoPanelMembers,
      getUsersList,
      filter,
      currentDeviceType,
    };
  },
)(
  withTranslation([
    "InviteDialog",
    "SharingPanel",
    "Translations",
    "Common",
    "InfoPanel",
    "PeopleSelector",
  ])(observer(InvitePanel)),
);
