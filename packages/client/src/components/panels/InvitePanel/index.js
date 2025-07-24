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

import { useEffect, useState, useMemo, useRef } from "react";
import { observer, inject } from "mobx-react";
import { withTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router";

import {
  EmployeeType,
  ShareAccessRights,
  RoomsType,
} from "@docspace/shared/enums";
import { LOADER_TIMEOUT } from "@docspace/shared/constants";

import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { isDesktop, isMobile } from "@docspace/shared/utils";
import api from "@docspace/shared/api";
import { getAccessOptions } from "@docspace/shared/utils/getAccessOptions";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Link } from "@docspace/shared/components/link";
import { checkIfAccessPaid } from "SRC_DIR/helpers";
import PeopleSelector from "@docspace/shared/selectors/People";
import PaidQuotaLimitError from "SRC_DIR/components/PaidQuotaLimitError";
import { fixAccess } from "./utils";
import ExternalLinks from "./sub-components/ExternalLinks";
import InviteInput from "./sub-components/InviteInput";
import ItemsList from "./sub-components/ItemsList";

const InvitePanel = ({
  folders,
  getFolderInfo,
  inviteItems,
  roomId,
  setInviteItems,
  setInvitePanelOptions,
  t,
  isVisible,
  defaultAccess,
  setInfoPanelIsMobileHidden,
  updateInfoPanelMembers,
  isRoomMembersPanelOpen,
  setInviteLanguage,
  isRoomAdmin,
  setIsNewUserByCurrentUser,

  isOwner,
  isAdmin,
  standalone,
  hideSelector,
  isUserTariffLimit,

  allowInvitingGuests,
  checkGuests,
  hasGuests,
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
  const [addUsersPanelVisible, setAddUsersPanelVisible] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [inputValue, setInputValue] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [cultureKey, setCultureKey] = useState();
  const [showGuestsTab, setShowGuestsTab] = useState(true);

  const navigate = useNavigate();

  const inputsRef = useRef();
  const invitePanelBodyRef = useRef();
  const loaderRef = useRef();

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

  const onBackClick = () => {
    if (!hideSelector && addUsersPanelVisible) setAddUsersPanelVisible(false);
  };

  const onCheckHeight = () => {
    setScrollAllPanelContent(!isDesktop());
    setIsMobileView(isMobile());
  };

  const onMouseDown = (e) => {
    if (e.target.id === "InvitePanelWrapper") onClose();
  };

  const roomType = selectedRoom ? selectedRoom.roomType : -1;
  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const onChangeExternalLinksVisible = (visible) => {
    setExternalLinksVisible(visible);
  };

  const accessModel = [
    {
      id: "user",
      title: "User",
      shareLink: "",
      access: EmployeeType.RoomAdmin,
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
      access: EmployeeType.User,
    },
  ];

  const selectRoom = () => {
    const room = folders.find((folder) => folder.id === roomId);

    if (room) {
      setSelectedRoom(room);
      return Promise.resolve();
    }
    return getFolderInfo(roomId).then((info) => {
      setSelectedRoom(info);
    });
  };

  const getInfo = () => {
    return api.rooms
      .getRoomSecurityInfo(roomId)
      .then((res) => res.items)
      .then((links) => {
        const link = links && links[0];
        if (link) {
          const { shareLink, id, title, expirationDate } = link.sharedTo;

          const newLink = {
            id,
            title,
            shareLink,
            expirationDate,
            access: link.access || defaultAccess,
          };

          onChangeExternalLinksVisible(!!links.length);

          setShareLinks([newLink]);
          setActiveLink(newLink);
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
    if (!allowInvitingGuests) checkGuests();
  }, [allowInvitingGuests]);

  useEffect(() => {
    if (typeof hasGuests === "boolean") setShowGuestsTab(hasGuests);
  }, [hasGuests]);

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
    const hasValidationErrors = () => {
      return inviteItems.some((item) => !!item.errors?.length);
    };

    const needRemoveGuests = !allowInvitingGuests
      ? inviteItems.some(
          (item) => item.userType === EmployeeType.Guest && !item.status,
        )
      : false;

    setHasErrors(hasValidationErrors() || needRemoveGuests);
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

  const getError = (error) => {
    const paymentLink = (
      <Trans
        t={t}
        i18nKey="ChangeUserPermissions"
        ns="Common"
        components={{
          1: (
            <Link
              tag="a"
              onClick={onClickPayments}
              target="_blank"
              color="accent"
            />
          ),
        }}
      />
    );

    return (
      <>
        {error}
        &nbsp;
        {!isRoomAdmin ? paymentLink : null}
      </>
    );
  };

  const onClickSend = async () => {
    const invitations = inviteItems.map((item) => {
      const newItem = {};

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
        ? await api.people.inviteUsers(data)
        : await api.rooms.setRoomSecurity(roomId, data);

      if (!isRooms) {
        setIsNewUserByCurrentUser(true);
      }
      setIsLoading(false);

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
        error = getError(err?.response?.data?.error?.message);
      }

      if (err.response?.data?.response?.errors) {
        const { Invitations } = err.response.data.response.errors;

        if (Invitations) {
          error = Invitations[0];
        }
      }

      toastr.error(error);
      setIsLoading(false);
    } finally {
      if (roomId === -1) {
        const isPeoplePage =
          window.location.pathname.includes("accounts/people");

        if (!isPeoplePage) {
          navigate("/accounts/people/filter");
        }
      }
    }
  };

  const hasInvitedUsers = !!inviteItems.length;

  const removeExist = (items) => {
    const filtered = items.reduce((unique, current) => {
      const isUnique = !unique.some((obj) =>
        obj.isGroup ? obj.id === current.id : obj.email === current.email,
      );

      isUnique && unique.push(current);

      return unique;
    }, []);

    if (items.length > filtered.length) toastr.warning(t("UsersAlreadyAdded"));

    return filtered;
  };

  const bodyInvitePanel = useMemo(() => {
    return (
      <div style={{ display: "contents" }} ref={invitePanelBodyRef}>
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
          removeExist={removeExist}
          inputValue={inputValue}
          setInputValue={setInputValue}
          usersList={usersList}
          setUsersList={setUsersList}
        />
        {hasInvitedUsers ? (
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
        ) : null}
      </div>
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

  const closeUsersPanel = () => {
    setAddUsersPanelVisible(false);
  };

  const addItems = (users, access) => {
    users.forEach((u) => {
      u.access = access.access;
      const isAccessPaid = checkIfAccessPaid(u.access);

      if (isAccessPaid) {
        if (u.isGroup || u.isVisitor || u.isCollaborator) {
          u = fixAccess(u, t, roomType);

          if (isUserTariffLimit) {
            toastr.error(<PaidQuotaLimitError />);
          }
        }
      }
    });

    const items = [...users, ...inviteItems];

    const filtered = removeExist(items);

    setInviteItems(filtered);
    setInputValue("");
    setUsersList([]);
    closeUsersPanel();
  };

  const accessOptions = getAccessOptions(
    t,
    roomType,
    false,
    true,
    isOwner,
    isAdmin,
    standalone,
  );

  const invitedUsers = useMemo(
    () => inviteItems.map((item) => item.id),
    [inviteItems],
  );

  const invitedUsersArray = useMemo(
    () => Array.from(invitedUsers.keys()),
    [invitedUsers],
  );

  const access = defaultAccess ?? ShareAccessRights.ReadOnly;

  return (
    <ModalDialog
      visible={isVisible}
      onClose={onClose}
      onBackClick={onBackClick}
      displayType={ModalDialogType.aside}
      containerVisible={!hideSelector ? addUsersPanelVisible : null}
      isLoading={invitePanelIsLoding}
      withBodyScroll
      isInvitePanelLoader
    >
      {!hideSelector && addUsersPanelVisible ? (
        <ModalDialog.Container>
          <PeopleSelector
            useAside
            onClose={() => {
              onClose();
              closeUsersPanel();
            }}
            onSubmit={addItems}
            withAccessRights
            accessRights={accessOptions}
            selectedAccessRight={
              accessOptions.filter((a) => a.access === access)[0]
            }
            onAccessRightsChange={() => {}}
            isMultiSelect
            disableDisabledUsers
            withGroups={!isPublicRoomType}
            roomId={roomId}
            disableInvitedUsers={invitedUsersArray}
            withGuests={showGuestsTab}
            withHeader
            headerProps={{
              // Todo: Update groups empty screen texts when they are ready
              headerLabel: t("Common:Contacts"),
              withoutBackButton: false,
              withoutBorder: true,
              isCloseable: true,
              onBackClick: closeUsersPanel,
              onCloseClick: () => {
                onClose();
                closeUsersPanel();
              },
            }}
          />
        </ModalDialog.Container>
      ) : null}

      <ModalDialog.Header>{t("Common:Invite")}</ModalDialog.Header>
      <ModalDialog.Body>{bodyInvitePanel}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-invitation"
          scale
          size="normal"
          isDisabled={hasErrors || !hasInvitedUsers}
          primary
          onClick={onClickSend}
          label={t("SendInvitation")}
          isLoading={isLoading}
        />
        <Button
          className="cancel-button"
          scale
          size="normal"
          onClick={onClose}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    dialogsStore,
    infoPanelStore,
    authStore,
    currentQuotaStore,
    userStore,
  }) => {
    const { theme, standalone, allowInvitingGuests, checkGuests, hasGuests } =
      settingsStore;

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
      setIsNewUserByCurrentUser,
    } = dialogsStore;

    const { getFolderInfo, folders } = filesStore;

    const { isRoomAdmin } = authStore;

    const { isUserTariffLimit } = currentQuotaStore;

    const { isOwner, isAdmin } = userStore.user;

    return {
      folders,
      setInviteLanguage,
      inviteItems,
      roomId: invitePanelOptions.roomId,
      setInviteItems,
      setInvitePanelOptions,
      theme,
      isVisible: invitePanelOptions.visible,
      defaultAccess: invitePanelOptions.defaultAccess,
      getFolderInfo,
      setInfoPanelIsMobileHidden,
      updateInfoPanelMembers,
      isRoomMembersPanelOpen,
      isRoomAdmin,

      setIsNewUserByCurrentUser,
      isOwner,
      standalone,
      hideSelector: invitePanelOptions.hideSelector,
      isUserTariffLimit,
      isAdmin,
      allowInvitingGuests,
      checkGuests,
      hasGuests,
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
