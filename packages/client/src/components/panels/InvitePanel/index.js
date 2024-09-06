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
import { withTranslation, Trans } from "react-i18next";

import { DeviceType, EmployeeType } from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

import { Backdrop } from "@docspace/shared/components/backdrop";
import { Aside, AsideHeader } from "@docspace/shared/components/aside";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import { isDesktop, isMobile, size } from "@docspace/shared/utils";

import { StyledInvitePanel, StyledButtons } from "./StyledInvitePanel";

import ItemsList from "./sub-components/ItemsList";
import InviteInput from "./sub-components/InviteInput";
import ExternalLinks from "./sub-components/ExternalLinks";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

import InfoBar from "./sub-components/InfoBar";
import InvitePanelLoader from "./sub-components/InvitePanelLoader";

import { Text } from "@docspace/shared/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

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
  defaultAccess,
  inviteUsers,
  setInfoPanelIsMobileHidden,
  updateInfoPanelMembers,
  isRoomMembersPanelOpen,
  setInviteLanguage,
  getUsersList,
  filter,
  currentDeviceType,
  isRoomAdmin,
  maxCountManagersByQuota,
  invitePaidUsersCount,
  setIsNewUserByCurrentUser,
  setInvitePaidUsersCount,
}) => {
  const [invitePanelIsLoding, setInvitePanelIsLoading] = useState(
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
  const loaderRef = useRef();

  const onChangeExternalLinksVisible = (visible) => {
    setExternalLinksVisible(visible);
  };

  const accessModel = [
    {
      id: "user",
      title: "User",
      shareLink: "",
      access: EmployeeType.User,
    },
    {
      id: "guest",
      title: "Guest",
      shareLink: "",
      access: EmployeeType.Guest,
    },
    {
      id: "admin",
      title: "Admin",
      shareLink: "",
      access: EmployeeType.Admin,
    },
    {
      id: "collaborator",
      title: "Collaborator",
      shareLink: "",
      access: EmployeeType.Collaborator,
    },
  ];

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
      setShareLinks(accessModel);
      return;
    }

    setInvitePanelIsLoading(true);
    Promise.all([selectRoom(), getInfo()]).finally(() => {
      disableInvitePanelLoader(false);
    });
  }, [roomId]);

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

  const onClickPayments = () => {
    const paymentPageUrl = combineUrl(
      "/portal-settings",
      "/payments/portal-payments",
    );

    toastr.clear();

    window.DocSpace.navigate(paymentPageUrl);

    setInvitePanelOptions({
      visible: false,
      hideSelector: false,
      defaultAccess: 1,
    });
  };

  const getError = () => {
    const paymentLink = (
      <Trans
        t={t}
        i18nKey="ChangeUserPermissions"
        ns="Common"
        components={{
          1: (
            <ColorTheme
              tag="a"
              themeId={ThemeId.Link}
              onClick={onClickPayments}
              target="_blank"
            />
          ),
        }}
      />
    );

    return (
      <>
        <Text as="span">
          {t("Common:PaidUsersExceedsLimit", {
            count: maxCountManagersByQuota + invitePaidUsersCount,
            limit: maxCountManagersByQuota,
          })}
        </Text>
        &nbsp;
        {!isRoomAdmin && paymentLink}
      </>
    );
  };
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

      if (!isRooms) {
        setIsNewUserByCurrentUser(true);
      }
      setIsLoading(false);
      setInvitePaidUsersCount(0);

      onClose();
      toastr.success(t("Common:UsersInvited"));

      if (result?.warning) {
        toastr.warning(result?.warning);
      }

      if (isRoomMembersPanelOpen) {
        updateInfoPanelMembers(t);
      }
    } catch (err) {
      let error = err;

      if (err?.response?.status === 402) {
        error = getError();
      }

      toastr.error(error);
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
          <AsideHeader
            header={t("Common:InviteUsers")}
            onCloseClick={onClose}
          />

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
            header={t("Common:InviteUsers")}
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
    authStore,
    currentQuotaStore,
  }) => {
    const { theme, currentDeviceType } = settingsStore;

    const { getUsersByQuery, inviteUsers, getUsersList } =
      peopleStore.usersStore;
    const { filter } = peopleStore.filterStore;
    const {
      setIsMobileHidden: setInfoPanelIsMobileHidden,
      updateInfoPanelMembers,
      isRoomMembersPanelOpen,
    } = infoPanelStore;

    const {
      inviteItems,
      invitePanelOptions,
      setInviteItems,
      setInvitePanelOptions,
      setInviteLanguage,
      invitePaidUsersCount,
      setIsNewUserByCurrentUser,
      setInvitePaidUsersCount,
    } = dialogsStore;

    const { getFolderInfo, setRoomSecurity, getRoomSecurityInfo, folders } =
      filesStore;

    const { isRoomAdmin } = authStore;

    const { maxCountManagersByQuota } = currentQuotaStore;

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
      inviteUsers,
      setInfoPanelIsMobileHidden,
      updateInfoPanelMembers,
      isRoomMembersPanelOpen,
      getUsersList,
      filter,
      currentDeviceType,
      isRoomAdmin,
      maxCountManagersByQuota,
      invitePaidUsersCount,
      setIsNewUserByCurrentUser,
      setInvitePaidUsersCount,
    };
  },
)(
  withTranslation([
    "InviteDialog",
    "SharingPanel",
    "Translations",
    "Common",
    "InfoPanel",
  ])(observer(InvitePanel)),
);
