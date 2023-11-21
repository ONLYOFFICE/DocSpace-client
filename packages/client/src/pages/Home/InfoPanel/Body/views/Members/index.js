import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import toastr from "@docspace/components/toast/toastr";

import {
  EmployeeActivationStatus,
  LINKS_LIMIT_COUNT,
  RoomsType,
  ShareAccessRights,
} from "@docspace/common/constants";
import Loaders from "@docspace/common/components/Loaders";
import MembersHelper from "../../helpers/MembersHelper";
import MembersList from "./sub-components/MembersList";
import User from "./User";
import PublicRoomBar from "./sub-components/PublicRoomBar";
import { LinksBlock, StyledLinkRow } from "./sub-components/StyledPublicRoom";

import Text from "@docspace/components/text";
import Link from "@docspace/components/link";
import IconButton from "@docspace/components/icon-button";
import Tooltip from "@docspace/components/tooltip";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/actions.button.plus.react.svg?url";

import Avatar from "@docspace/components/avatar";
import copy from "copy-to-clipboard";
import LinkRow from "./sub-components/LinkRow";

const Members = ({
  t,
  selfId,
  selection,

  updateRoomMembers,
  setUpdateRoomMembers,

  selectionParentRoom,
  setSelectionParentRoom,

  setIsScrollLocked,

  getRoomMembers,
  getRoomLinks,
  updateRoomMemberRole,
  setView,
  roomsView,
  resendEmailInvitations,
  changeUserType,
  isPublicRoomType,

  setExternalLinks,
  membersFilter,
  setMembersFilter,
  externalLinks,
  members,
  setMembersList,
  roomType,
  primaryLink,
  isArchiveFolder,
  isPublicRoom,

  additionalLinks,
  setLinkParams,
  setEditLinkPanelIsVisible,
  getPrimaryLink,
  setExternalLink,
  withPublicRoomBlock,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const membersHelper = new MembersHelper({ t });

  const security = selectionParentRoom ? selectionParentRoom.security : {};

  const fetchMembers = async (roomId, clearFilter = true) => {
    if (isLoading) return;
    const isPublic = selection?.roomType ?? selectionParentRoom?.roomType;
    const requests = [getRoomMembers(roomId, clearFilter)];

    if (isPublic && clearFilter && withPublicRoomBlock) {
      requests.push(getRoomLinks(roomId));
    }

    let timerId;
    if (clearFilter) timerId = setTimeout(() => setIsLoading(true), 300);

    const [data, links] = await Promise.all(requests);
    clearFilter && setIsLoading(false);
    clearTimeout(timerId);

    links && setExternalLinks(links);

    const users = [];
    const administrators = [];
    const expectedMembers = [];
    data?.map((fetchedMember) => {
      const member = {
        access: fetchedMember.access,
        canEditAccess: fetchedMember.canEditAccess,
        ...fetchedMember.sharedTo,
      };

      if (member.activationStatus === EmployeeActivationStatus.Pending) {
        member.isExpect = true;
        expectedMembers.push(member);
      } else if (
        member.access === ShareAccessRights.FullAccess ||
        member.access === ShareAccessRights.RoomManager
      ) {
        administrators.push(member);
      } else {
        users.push(member);
      }
    });

    let hasPrevAdminsTitle =
      members?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(members?.administrators, "administration")
        : false;

    if (administrators.length && !hasPrevAdminsTitle) {
      administrators.unshift({
        id: "administration",
        displayName: t("Administration"),
        isTitle: true,
      });
    }

    let hasPrevUsersTitle =
      members?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(members?.users, "user")
        : false;

    if (users.length && !hasPrevUsersTitle) {
      users.unshift({ id: "user", displayName: t("Users"), isTitle: true });
    }

    let hasPrevExpectedTitle =
      members?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(members?.expected, "expected")
        : false;

    if (expectedMembers.length && !hasPrevExpectedTitle) {
      expectedMembers.unshift({
        id: "expected",
        displayName: t("ExpectUsers"),
        isTitle: true,
        isExpect: true,
      });
    }

    setUpdateRoomMembers(false);

    return {
      users,
      administrators,
      expected: expectedMembers,
      roomId,
    };
  };

  const getHasPrevTitle = (array, type) => {
    return array.findIndex((x) => x.id === type) > -1;
  };

  const updateSelectionParentRoomActionSelection = useCallback(async () => {
    if (!selection.isRoom || selection.id === members?.roomId) return;

    const fetchedMembers = await fetchMembers(selection.id);
    setMembersList(fetchedMembers);

    setSelectionParentRoom({
      ...selection,
      members: fetchedMembers,
    });
    if (roomsView === "info_members" && !selection?.security?.Read)
      setView("info_details");
  }, [selection]);

  useEffect(() => {
    updateSelectionParentRoomActionSelection();
  }, [selection, updateSelectionParentRoomActionSelection]);

  const updateMembersAction = useCallback(async () => {
    if (!updateRoomMembers) return;

    const fetchedMembers = await fetchMembers(selection.id);

    setSelectionParentRoom({
      ...selectionParentRoom,
      members: fetchedMembers,
    });

    setMembersList(fetchedMembers);
  }, [selectionParentRoom, selection?.id, updateRoomMembers]);

  useEffect(() => {
    updateMembersAction();
  }, [
    selectionParentRoom,
    selection?.id,
    updateRoomMembers,
    updateMembersAction,
  ]);

  const onRepeatInvitation = async () => {
    resendEmailInvitations(selectionParentRoom.id, true)
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios"))
      )
      .catch((err) => toastr.error(err));
  };

  const loadNextPage = async () => {
    const roomId = selectionParentRoom.id;
    const fetchedMembers = await fetchMembers(roomId, false);
    const { users, administrators, expected } = fetchedMembers;

    const newMembers = {
      roomId: roomId,
      administrators: [...members.administrators, ...administrators],
      users: [...members.users, ...users],
      expected: [...members.expected, ...expected],
    };

    setMembersList(newMembers);
    setSelectionParentRoom({
      ...selectionParentRoom,
      members: newMembers,
    });
  };

  if (isLoading) return <Loaders.InfoPanelViewLoader view="members" />;
  else if (!members) return <></>;

  const [currentMember] = members.administrators.filter(
    (member) => member.id === selfId
  );

  const { administrators, users, expected } = members;
  const membersList = [...administrators, ...users, ...expected];

  const adminsTitleCount = administrators.length ? 1 : 0;
  const usersTitleCount = users.length ? 1 : 0;
  const expectedTitleCount = expected.length ? 1 : 0;

  const headersCount = adminsTitleCount + usersTitleCount + expectedTitleCount;
  const dataReadyMembersList = selection?.id === selectionParentRoom?.id;

  if (!dataReadyMembersList) return <></>;

  const canInviteUserInRoomAbility = security?.EditAccess;

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      setLinkParams({ isEdit: false });
      setEditLinkPanelIsVisible(true);
    } else {
      getPrimaryLink(selectionParentRoom.id).then((link) => {
        setExternalLink(link);
        copy(link.sharedTo.shareLink);
        toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
      });
    }
  };

  const publicRoomItems = [];

  if (isPublicRoomType && withPublicRoomBlock) {
    if (!isArchiveFolder || primaryLink) {
      publicRoomItems.push(
        <LinksBlock key="general-link_header">
          <Text fontSize="14px" fontWeight={600}>
            {t("Files:GeneralLink")}
          </Text>
        </LinksBlock>
      );
    }

    if (primaryLink) {
      publicRoomItems.push(
        <LinkRow
          key="general-link"
          link={primaryLink}
          setIsScrollLocked={setIsScrollLocked}
        />
      );
    } else if (!isArchiveFolder) {
      publicRoomItems.push(
        <StyledLinkRow onClick={onAddNewLink} key="create-general-link">
          <Avatar size="min" source={PlusReactSvgUrl} />
          <Link
            isHovered
            type="action"
            fontSize="14px"
            fontWeight={600}
            className="external-row-link"
          >
            {t("Files:CreateAndCopy")}
          </Link>
        </StyledLinkRow>
      );
    }

    if ((primaryLink && !isArchiveFolder) || additionalLinks.length) {
      publicRoomItems.push(
        <LinksBlock key="additional-link_header">
          <Text fontSize="14px" fontWeight={600}>
            {t("Files:AdditionalLinks")}
          </Text>

          {!isArchiveFolder && (
            <div
              data-tooltip-id="emailTooltip"
              data-tooltip-content={t(
                "Files:MaximumNumberOfExternalLinksCreated"
              )}
            >
              <IconButton
                className="link-to-viewing-icon"
                iconName={LinksToViewingIconUrl}
                onClick={onAddNewLink}
                size={16}
                isDisabled={additionalLinks.length >= LINKS_LIMIT_COUNT}
                title={t("Files:AddNewLink")}
              />

              {additionalLinks.length >= LINKS_LIMIT_COUNT && (
                <Tooltip
                  float
                  id="emailTooltip"
                  getContent={({ content }) => (
                    <Text fontSize="12px">{content}</Text>
                  )}
                  place="bottom"
                />
              )}
            </div>
          )}
        </LinksBlock>
      );
    }

    if (additionalLinks.length) {
      additionalLinks.map((link) => {
        publicRoomItems.push(
          <LinkRow
            link={link}
            key={link?.sharedTo?.id}
            setIsScrollLocked={setIsScrollLocked}
          />
        );
      });
    } else if (!isArchiveFolder && primaryLink) {
      publicRoomItems.push(
        <StyledLinkRow
          key="create-additional-link"
          className="additional-link"
          onClick={onAddNewLink}
        >
          <Avatar size="min" source={PlusReactSvgUrl} />

          <Link
            isHovered
            type="action"
            fontSize="14px"
            fontWeight={600}
            className="external-row-link"
          >
            {t("Files:CreateNewLink")}
          </Link>
        </StyledLinkRow>
      );
    }
  }

  const showPublicRoomBar =
    ((primaryLink && !isArchiveFolder) || isPublicRoom) && withPublicRoomBlock;

  return (
    <>
      {showPublicRoomBar && (
        <PublicRoomBar
          headerText={t("Files:RoomAvailableViaExternalLink")}
          bodyText={t("CreateEditRoomDialog:PublicRoomBarDescription")}
        />
      )}

      <MembersList
        loadNextPage={loadNextPage}
        hasNextPage={membersList.length - headersCount < membersFilter.total}
        itemCount={membersFilter.total + headersCount + publicRoomItems.length}
        showPublicRoomBar={showPublicRoomBar}
      >
        {publicRoomItems}
        {membersList.map((user) => {
          return (
            <User
              t={t}
              user={user}
              key={user.id}
              security={security}
              membersHelper={membersHelper}
              currentMember={currentMember}
              updateRoomMemberRole={updateRoomMemberRole}
              roomId={selectionParentRoom.id}
              roomType={selectionParentRoom.roomType}
              selectionParentRoom={selectionParentRoom}
              setSelectionParentRoom={setSelectionParentRoom}
              changeUserType={changeUserType}
              setIsScrollLocked={setIsScrollLocked}
              isTitle={user.isTitle}
              isExpect={user.isExpect}
              showInviteIcon={canInviteUserInRoomAbility && user.isExpect}
              onRepeatInvitation={onRepeatInvitation}
              setMembers={setMembersList}
              membersFilter={membersFilter}
              setMembersFilter={setMembersFilter}
              fetchMembers={fetchMembers}
              hasNextPage={
                membersList.length - headersCount < membersFilter.total
              }
            />
          );
        })}
      </MembersList>
    </>
  );
};

export default inject(
  ({
    auth,
    filesStore,
    peopleStore,
    selectedFolderStore,
    publicRoomStore,
    treeFoldersStore,
    dialogsStore,
  }) => {
    const {
      selectionParentRoom,
      setSelectionParentRoom,
      setView,
      roomsView,

      updateRoomMembers,
      setUpdateRoomMembers,

      setIsScrollLocked,
      membersList,
      setMembersList,
    } = auth.infoPanelStore;
    const {
      getRoomMembers,
      getRoomLinks,
      updateRoomMemberRole,
      resendEmailInvitations,
      membersFilter,
      setMembersFilter,
      selection,
      bufferSelection,
    } = filesStore;
    const { id: selfId } = auth.userStore.user;

    const { changeType: changeUserType } = peopleStore;
    const {
      roomLinks,
      setExternalLinks,
      primaryLink,
      additionalLinks,
      setExternalLink,
    } = publicRoomStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;

    const roomType =
      selectedFolderStore.roomType ?? selectionParentRoom?.roomType;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom || roomType === RoomsType.CustomRoom;

    const isPublicRoom = roomType === RoomsType.PublicRoom;

    const room = selectionParentRoom
      ? selectionParentRoom
      : selection.length
      ? selection[0]
      : bufferSelection
      ? bufferSelection
      : null;

    const withPublicRoomBlock =
      room?.access === ShareAccessRights.RoomManager ||
      room?.access === ShareAccessRights.None;

    return {
      setView,
      roomsView,
      selectionParentRoom,
      setSelectionParentRoom,

      setIsScrollLocked,

      getRoomMembers,
      getRoomLinks,
      updateRoomMemberRole,

      updateRoomMembers,
      setUpdateRoomMembers,

      selfId,

      resendEmailInvitations,
      changeUserType,
      isPublicRoomType,
      setExternalLinks,
      membersFilter,
      setMembersFilter,
      externalLinks: roomLinks,
      members: membersList,
      setMembersList,
      roomType,
      primaryLink,
      isArchiveFolder: isArchiveFolderRoot,
      isPublicRoom,

      additionalLinks: additionalLinks,
      isArchiveFolder: isArchiveFolderRoot,
      setLinkParams,
      setEditLinkPanelIsVisible,
      primaryLink,
      getPrimaryLink: filesStore.getPrimaryLink,
      setExternalLink,
      withPublicRoomBlock,
    };
  }
)(
  withTranslation([
    "InfoPanel",
    "Common",
    "Translations",
    "People",
    "PeopleTranslations",
    "Settings",
    "CreateEditRoomDialog",
  ])(observer(Members))
);
