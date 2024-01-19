import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { toastr } from "@docspace/shared/components/toast";

import {
  EmployeeActivationStatus,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { LINKS_LIMIT_COUNT } from "@docspace/shared/constants";
import Loaders from "@docspace/common/components/Loaders";
import MembersHelper from "../../helpers/MembersHelper";
import MembersList from "./sub-components/MembersList";
import User from "./User";
import PublicRoomBar from "./sub-components/PublicRoomBar";
import { LinksBlock, StyledLinkRow } from "./sub-components/StyledPublicRoom";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Tooltip } from "@docspace/shared/components/tooltip";
import LinksToViewingIconUrl from "PUBLIC_DIR/images/links-to-viewing.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/actions.button.plus.react.svg?url";

import { Avatar } from "@docspace/shared/components/avatar";
import copy from "copy-to-clipboard";
import LinkRow from "./sub-components/LinkRow";

const Members = ({
  t,
  selfId,

  updateRoomMembers,

  infoPanelSelection,

  setIsScrollLocked,

  getRoomMembers,
  getRoomLinks,
  isPublicRoomType,

  setExternalLinks,
  membersFilter,
  infoPanelMembers,
  setInfoPanelMembers,
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

  const fetchMembers = async (roomId, clearFilter = true) => {
    if (isLoading) return;
    const isPublic =
      infoPanelSelection?.roomType ?? infoPanelSelection?.roomType;
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
      infoPanelMembers?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(infoPanelMembers?.administrators, "administration")
        : false;

    if (administrators.length && !hasPrevAdminsTitle) {
      administrators.unshift({
        id: "administration",
        displayName: t("Administration"),
        isTitle: true,
      });
    }

    let hasPrevUsersTitle =
      infoPanelMembers?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(infoPanelMembers?.users, "user")
        : false;

    if (users.length && !hasPrevUsersTitle) {
      users.unshift({ id: "user", displayName: t("Users"), isTitle: true });
    }

    let hasPrevExpectedTitle =
      infoPanelMembers?.roomId === roomId && !clearFilter
        ? getHasPrevTitle(infoPanelMembers?.expected, "expected")
        : false;

    if (expectedMembers.length && !hasPrevExpectedTitle) {
      expectedMembers.unshift({
        id: "expected",
        displayName: t("ExpectUsers"),
        isTitle: true,
        isExpect: true,
      });
    }

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

  const updateInfoPanelMembers = async () => {
    if (!infoPanelSelection) return;
    console.log("updateInfoPanelMembers");
    const fetchedMembers = await fetchMembers(infoPanelSelection.id);
    setInfoPanelMembers(fetchedMembers);
  };

  useEffect(() => {
    updateInfoPanelMembers();
    // if (updateRoomMembers) setUpdateRoomMembers(false);
  }, [infoPanelSelection, updateRoomMembers]);

  const loadNextPage = async () => {
    const roomId = infoPanelSelection.id;
    const fetchedMembers = await fetchMembers(roomId, false);
    const { users, administrators, expected } = fetchedMembers;

    const newMembers = {
      roomId: roomId,
      administrators: [...infoPanelMembers.administrators, ...administrators],
      users: [...infoPanelMembers.users, ...users],
      expected: [...infoPanelMembers.expected, ...expected],
    };

    setInfoPanelMembers(newMembers);
  };

  if (isLoading) return <Loaders.InfoPanelViewLoader view="members" />;
  else if (!infoPanelMembers) return <></>;

  const [currentMember] = infoPanelMembers.administrators.filter(
    (member) => member.id === selfId
  );

  const { administrators, users, expected } = infoPanelMembers;

  const membersList = [...administrators, ...users, ...expected];

  const adminsTitleCount = administrators.length ? 1 : 0;
  const usersTitleCount = users.length ? 1 : 0;
  const expectedTitleCount = expected.length ? 1 : 0;

  const headersCount = adminsTitleCount + usersTitleCount + expectedTitleCount;
  const dataReadyMembersList =
    infoPanelSelection?.id === infoPanelSelection?.id;

  if (!dataReadyMembersList) return <></>;

  const onAddNewLink = async () => {
    if (isPublicRoom || primaryLink) {
      setLinkParams({ isEdit: false });
      setEditLinkPanelIsVisible(true);
    } else {
      getPrimaryLink(infoPanelSelection.id).then((link) => {
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
  const publicRoomItemsLength = publicRoomItems.length;

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
        itemCount={membersFilter.total + headersCount + publicRoomItemsLength}
        showPublicRoomBar={showPublicRoomBar}
        linksBlockLength={publicRoomItemsLength}
      >
        {publicRoomItems}
        {membersList.map((user, index) => {
          return (
            <User
              t={t}
              user={user}
              key={user.id}
              index={index + publicRoomItemsLength}
              membersHelper={membersHelper}
              currentMember={currentMember}
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
    selectedFolderStore,
    publicRoomStore,
    treeFoldersStore,
    dialogsStore,
  }) => {
    const {
      infoPanelSelection,
      updateRoomMembers,
      setIsScrollLocked,
      infoPanelMembers,
      setInfoPanelMembers,
    } = auth.infoPanelStore;
    const {
      getRoomMembers,
      getRoomLinks,
      membersFilter,
      selection,
      bufferSelection,
    } = filesStore;
    const { id: selfId } = auth.userStore.user;

    const { setExternalLinks, primaryLink, additionalLinks, setExternalLink } =
      publicRoomStore;
    const { isArchiveFolderRoot } = treeFoldersStore;
    const { setLinkParams, setEditLinkPanelIsVisible } = dialogsStore;

    const roomType =
      selectedFolderStore.roomType ?? infoPanelSelection?.roomType;

    const isPublicRoomType =
      roomType === RoomsType.PublicRoom || roomType === RoomsType.CustomRoom;

    const isPublicRoom = roomType === RoomsType.PublicRoom;

    const room = infoPanelSelection
      ? infoPanelSelection
      : selection.length
        ? selection[0]
        : bufferSelection
          ? bufferSelection
          : null;

    const withPublicRoomBlock =
      room?.access === ShareAccessRights.RoomManager ||
      room?.access === ShareAccessRights.None;

    const infoSelection =
      infoPanelSelection?.length > 1 ? null : infoPanelSelection;

    return {
      infoPanelSelection: infoSelection,

      setIsScrollLocked,

      getRoomMembers,
      getRoomLinks,

      updateRoomMembers,

      selfId,

      isPublicRoomType,
      setExternalLinks,
      membersFilter,
      infoPanelMembers,
      setInfoPanelMembers,
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
